// Backend Configuration Service
// src/backend/API/Services/ClientConfigService.cs

using Microsoft.Extensions.Options;

namespace API.Services;

/// <summary>
/// Müşteri konfigürasyon ayarları
/// </summary>
public class ClientSettings
{
    public string CompanyName { get; set; } = "Portal";
    public string PortalTitle { get; set; } = "Portal";
    public string ContactEmail { get; set; } = "";
    public string SupportEmail { get; set; } = "";
    public string CompanyWebsite { get; set; } = "";
    public string CompanyAddress { get; set; } = "";
    public string CompanyPhone { get; set; } = "";
    public string TimeZone { get; set; } = "Europe/Istanbul";
    public string Language { get; set; } = "tr-TR";
    public string Currency { get; set; } = "TRY";
}

/// <summary>
/// Email ayarları
/// </summary>
public class EmailSettings
{
    public string SmtpHost { get; set; } = "";
    public int SmtpPort { get; set; } = 587;
    public string SmtpUsername { get; set; } = "";
    public string SmtpPassword { get; set; } = "";
    public bool EnableSsl { get; set; } = true;
    public string FromEmail { get; set; } = "";
    public string FromName { get; set; } = "";
    public bool EnableEmailNotifications { get; set; } = false;
}

/// <summary>
/// Müşteri konfigürasyon servisi
/// Parametrik değerleri yönetir ve şablonları işler
/// </summary>
public interface IClientConfigService
{
    ClientSettings GetClientSettings();
    EmailSettings GetEmailSettings();
    string ProcessTemplate(string template);
    T GetConfigValue<T>(string configPath);
    void SetConfigValue(string configPath, object value);
    Dictionary<string, object> GetFrontendConfig();
}

public class ClientConfigService : IClientConfigService
{
    private readonly ClientSettings _clientSettings;
    private readonly EmailSettings _emailSettings;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ClientConfigService> _logger;

    public ClientConfigService(
        IOptions<ClientSettings> clientSettings,
        IOptions<EmailSettings> emailSettings,
        IConfiguration configuration,
        ILogger<ClientConfigService> logger)
    {
        _clientSettings = clientSettings.Value;
        _emailSettings = emailSettings.Value;
        _configuration = configuration;
        _logger = logger;

        _logger.LogInformation("ClientConfigService initialized for: {CompanyName}", 
            _clientSettings.CompanyName);
    }

    public ClientSettings GetClientSettings()
    {
        return _clientSettings;
    }

    public EmailSettings GetEmailSettings()
    {
        return _emailSettings;
    }

    /// <summary>
    /// Template metinlerini işler ve parametrik değerleri yerleştirir
    /// Örnek: "{{CompanyName}} Portal" -> "Aslan Group Portal"
    /// </summary>
    public string ProcessTemplate(string template)
    {
        if (string.IsNullOrEmpty(template))
            return template;

        var result = template;

        // Müşteri ayarları
        result = result.Replace("{{CompanyName}}", _clientSettings.CompanyName);
        result = result.Replace("{{PortalTitle}}", _clientSettings.PortalTitle);
        result = result.Replace("{{ContactEmail}}", _clientSettings.ContactEmail);
        result = result.Replace("{{SupportEmail}}", _clientSettings.SupportEmail);
        result = result.Replace("{{CompanyWebsite}}", _clientSettings.CompanyWebsite);
        result = result.Replace("{{CompanyAddress}}", _clientSettings.CompanyAddress);
        result = result.Replace("{{CompanyPhone}}", _clientSettings.CompanyPhone);

        // Email ayarları
        result = result.Replace("{{FromEmail}}", _emailSettings.FromEmail);
        result = result.Replace("{{FromName}}", _emailSettings.FromName);

        // Tarih/saat
        result = result.Replace("{{CurrentYear}}", DateTime.Now.Year.ToString());
        result = result.Replace("{{CurrentDate}}", DateTime.Now.ToString("dd.MM.yyyy"));

        return result;
    }

    /// <summary>
    /// Herhangi bir config değerini alır
    /// </summary>
    public T GetConfigValue<T>(string configPath)
    {
        try
        {
            return _configuration.GetValue<T>(configPath);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Config value not found: {ConfigPath}", configPath);
            return default(T);
        }
    }

    /// <summary>
    /// Config değerini ayarlar (runtime'da değiştirme için)
    /// </summary>
    public void SetConfigValue(string configPath, object value)
    {
        try
        {
            _configuration[configPath] = value?.ToString();
            _logger.LogInformation("Config value updated: {ConfigPath} = {Value}", configPath, value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to set config value: {ConfigPath}", configPath);
        }
    }

    /// <summary>
    /// Frontend için config verilerini döner
    /// </summary>
    public Dictionary<string, object> GetFrontendConfig()
    {
        return new Dictionary<string, object>
        {
            ["COMPANY_NAME"] = _clientSettings.CompanyName,
            ["PORTAL_TITLE"] = _clientSettings.PortalTitle,
            ["CONTACT_EMAIL"] = _clientSettings.ContactEmail,
            ["SUPPORT_EMAIL"] = _clientSettings.SupportEmail,
            ["COMPANY_WEBSITE"] = _clientSettings.CompanyWebsite,
            ["COMPANY_ADDRESS"] = _clientSettings.CompanyAddress,
            ["COMPANY_PHONE"] = _clientSettings.CompanyPhone,
            ["TIME_ZONE"] = _clientSettings.TimeZone,
            ["LANGUAGE"] = _clientSettings.Language,
            ["CURRENCY"] = _clientSettings.Currency,
            
            // API ayarları
            ["API"] = new
            {
                BASE_URL = GetConfigValue<string>("ApiSettings:BaseUrl") ?? "/api",
                TIMEOUT = GetConfigValue<int>("ApiSettings:Timeout"),
                RETRY_ATTEMPTS = GetConfigValue<int>("ApiSettings:RetryAttempts")
            },
            
            // Güvenlik ayarları (sadece frontend'e güvenli olanlar)
            ["SECURITY"] = new
            {
                AUTO_LOGOUT_MINUTES = GetConfigValue<int>("JwtSettings:ExpiryMinutes"),
                ENABLE_REFRESH_TOKEN = GetConfigValue<bool>("JwtSettings:EnableRefreshToken")
            },
            
            // Özellik bayrakları
            ["FEATURES"] = new
            {
                REMEMBER_ME = GetConfigValue<bool>("FeatureFlags:EnablePasswordReset"),
                AUTO_REFRESH_TOKEN = GetConfigValue<bool>("JwtSettings:EnableRefreshToken"),
                SHOW_CONSOLE_LOGS = GetConfigValue<bool>("ApiSettings:EnableDetailedErrors"),
                ENABLE_NOTIFICATIONS = GetConfigValue<bool>("FeatureFlags:EnableNotifications"),
                ENABLE_FILE_UPLOAD = GetConfigValue<bool>("FeatureFlags:EnableFileUpload")
            },
            
            // UI ayarları
            ["UI"] = new
            {
                THEME = "light",
                PRIMARY_COLOR = "#667eea",
                SECONDARY_COLOR = "#764ba2",
                ANIMATION_DURATION = 300,
                TOAST_DURATION = 5000
            }
        };
    }
}

/// <summary>
/// Extension methods for DI registration
/// </summary>
public static class ClientConfigServiceExtensions
{
    public static IServiceCollection AddClientConfigService(this IServiceCollection services, IConfiguration configuration)
    {
        // Configuration sections'ları bind et
        services.Configure<ClientSettings>(configuration.GetSection("ClientSettings"));
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
        
        // Service'i register et
        services.AddScoped<IClientConfigService, ClientConfigService>();
        
        return services;
    }
}