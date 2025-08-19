// Backend Configuration Controller
// src/backend/API/Controllers/ConfigController.cs

using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Configuration API Controller
/// Frontend'in config verilerini alması için endpoint'ler sağlar
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ConfigController : ControllerBase
{
    private readonly IClientConfigService _configService;
    private readonly ILogger<ConfigController> _logger;

    public ConfigController(IClientConfigService configService, ILogger<ConfigController> logger)
    {
        _configService = configService;
        _logger = logger;
    }

    /// <summary>
    /// Frontend için genel konfigürasyon verilerini döner
    /// GET: api/config/frontend
    /// </summary>
    [HttpGet("frontend")]
    [AllowAnonymous] // Bu endpoint'e herkes erişebilir
    public ActionResult<object> GetFrontendConfig()
    {
        try
        {
            var config = _configService.GetFrontendConfig();
            
            _logger.LogDebug("Frontend config requested for company: {CompanyName}", 
                config.ContainsKey("COMPANY_NAME") ? config["COMPANY_NAME"] : "Unknown");
            
            return Ok(new
            {
                success = true,
                data = config,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting frontend config");
            return StatusCode(500, new
            {
                success = false,
                message = "Konfigürasyon alınırken hata oluştu",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Müşteri ayarlarını döner
    /// GET: api/config/client
    /// </summary>
    [HttpGet("client")]
    [AllowAnonymous]
    public ActionResult<ClientSettings> GetClientSettings()
    {
        try
        {
            var settings = _configService.GetClientSettings();
            return Ok(new
            {
                success = true,
                data = settings,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting client settings");
            return StatusCode(500, new
            {
                success = false,
                message = "Müşteri ayarları alınırken hata oluştu",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Belirli bir config değerini döner
    /// GET: api/config/value/{configPath}
    /// </summary>
    [HttpGet("value/{*configPath}")]
    [Authorize] // Bu endpoint için auth gerekli
    public ActionResult GetConfigValue(string configPath)
    {
        try
        {
            if (string.IsNullOrEmpty(configPath))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Config path boş olamaz"
                });
            }

            // Güvenlik: Sadece belirli config path'lere izin ver
            var allowedPaths = new[]
            {
                "ClientSettings",
                "ApiSettings",
                "FeatureFlags",
                "UI"
            };

            if (!allowedPaths.Any(path => configPath.StartsWith(path)))
            {
                return Forbidden(new
                {
                    success = false,
                    message = "Bu config path'e erişim izni yok"
                });
            }

            var value = _configService.GetConfigValue<object>(configPath);
            
            return Ok(new
            {
                success = true,
                path = configPath,
                value = value,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting config value for path: {ConfigPath}", configPath);
            return StatusCode(500, new
            {
                success = false,
                message = "Config değeri alınırken hata oluştu",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Config değerini günceller (sadece admin)
    /// PUT: api/config/value/{configPath}
    /// </summary>
    [HttpPut("value/{*configPath}")]
    [Authorize(Roles = "Admin")] // Sadece admin güncelleyebilir
    public ActionResult UpdateConfigValue(string configPath, [FromBody] UpdateConfigRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(configPath))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Config path boş olamaz"
                });
            }

            // Güvenlik: Sadece belirli config path'lere izin ver
            var allowedPaths = new[]
            {
                "ClientSettings:CompanyName",
                "ClientSettings:PortalTitle",
                "ClientSettings:ContactEmail",
                "ClientSettings:SupportEmail"
            };

            if (!allowedPaths.Contains(configPath))
            {
                return Forbidden(new
                {
                    success = false,
                    message = "Bu config path güncellenemez"
                });
            }

            _configService.SetConfigValue(configPath, request.Value);
            
            _logger.LogInformation("Config value updated by {User}: {Path} = {Value}", 
                User.Identity?.Name, configPath, request.Value);
            
            return Ok(new
            {
                success = true,
                message = "Config değeri güncellendi",
                path = configPath,
                value = request.Value,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating config value for path: {ConfigPath}", configPath);
            return StatusCode(500, new
            {
                success = false,
                message = "Config değeri güncellenirken hata oluştu",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Template işleme endpoint'i
    /// POST: api/config/process-template
    /// </summary>
    [HttpPost("process-template")]
    [Authorize]
    public ActionResult<string> ProcessTemplate([FromBody] ProcessTemplateRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Template))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Template boş olamaz"
                });
            }

            var processedTemplate = _configService.ProcessTemplate(request.Template);
            
            return Ok(new
            {
                success = true,
                original = request.Template,
                processed = processedTemplate,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing template");
            return StatusCode(500, new
            {
                success = false,
                message = "Template işlenirken hata oluştu",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// System health check with config info
    /// GET: api/config/health
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous]
    public ActionResult GetHealthCheck()
    {
        try
        {
            var clientSettings = _configService.GetClientSettings();
            
            return Ok(new
            {
                success = true,
                status = "healthy",
                company = clientSettings.CompanyName,
                portal = clientSettings.PortalTitle,
                timestamp = DateTime.UtcNow,
                version = "1.0.0"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return StatusCode(500, new
            {
                success = false,
                status = "unhealthy",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }

    private ActionResult Forbidden(object value)
    {
        return new ObjectResult(value) { StatusCode = 403 };
    }
}

/// <summary>
/// Request models
/// </summary>
public class UpdateConfigRequest
{
    public object Value { get; set; }
}

public class ProcessTemplateRequest
{
    public string Template { get; set; } = "";
}