using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AracTakip.Api.Data;
using AracTakip.Api.Models;
using AracTakip.Api.Services;
using System.Text.Json;

namespace AracTakip.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AraclarController : ControllerBase
    {
        private readonly AracTakipDbContext _context;
        private readonly IAracLogService _logService;
        private readonly ILogger<AraclarController> _logger;

        public AraclarController(AracTakipDbContext context, IAracLogService logService, ILogger<AraclarController> logger)
        {
            _context = context;
            _logService = logService;
            _logger = logger;
        }

        private string GetClientIpAddress()
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            if (string.IsNullOrEmpty(ipAddress) || ipAddress == "::1")
                ipAddress = "127.0.0.1";
            return ipAddress ?? "Unknown";
        }

        // GET: api/araclar
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Arac>>> GetAraclar()
        {
            try
            {
                var araclar = await _context.Araclar.ToListAsync();
                return Ok(araclar);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Araçlar getirilirken hata oluştu");
                return StatusCode(500, "İç sunucu hatası");
            }
        }

        // GET: api/araclar/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Arac>> GetArac(int id)
        {
            try
            {
                var arac = await _context.Araclar.FindAsync(id);

                if (arac == null)
                {
                    return NotFound($"ID {id} ile araç bulunamadı.");
                }

                return Ok(arac);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Araç {Id} getirilirken hata oluştu", id);
                return StatusCode(500, "İç sunucu hatası");
            }
        }

        // GET: api/araclar/5/logs
        [HttpGet("{id}/logs")]
        public async Task<ActionResult<IEnumerable<AracLog>>> GetAracLogs(int id)
        {
            try
            {
                var logs = await _logService.GetAracLogsAsync(id);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Araç {Id} logları getirilirken hata oluştu", id);
                return StatusCode(500, "İç sunucu hatası");
            }
        }

        // PUT: api/araclar/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateArac(int id, Arac arac)
        {
            if (id != arac.Id)
            {
                return BadRequest("ID uyuşmazlığı");
            }

            try
            {
                var existingArac = await _context.Araclar.FindAsync(id);
                if (existingArac == null)
                {
                    return NotFound($"ID {id} ile araç bulunamadı.");
                }

                // Eski değerleri kaydet
                var eskiDegerler = new
                {
                    existingArac.Plaka,
                    existingArac.Marka,
                    existingArac.Model,
                    existingArac.Yil,
                    existingArac.VIN,
                    existingArac.SirketAdi,
                    existingArac.MuayeneTarihi,
                    existingArac.KaskoTrafik,
                    existingArac.KaskoTrafikTarihi,
                    existingArac.SonBakimTarihi,
                    existingArac.GuncelKm,
                    existingArac.YakitTuketimi,
                    existingArac.LastikDurumu,
                    existingArac.RuhsatBilgisi,
                    existingArac.SirketKiralama,
                    existingArac.KullaniciAdi,
                    existingArac.KullaniciTelefon,
                    existingArac.Konum,
                    existingArac.AracResimUrl
                };

                // Güncelleme
                existingArac.Plaka = arac.Plaka;
                existingArac.Marka = arac.Marka;
                existingArac.Model = arac.Model;
                existingArac.Yil = arac.Yil;
                existingArac.VIN = arac.VIN;
                existingArac.SirketAdi = arac.SirketAdi;
                existingArac.MuayeneTarihi = arac.MuayeneTarihi;
                existingArac.KaskoTrafik = arac.KaskoTrafik;
                existingArac.KaskoTrafikTarihi = arac.KaskoTrafikTarihi;
                existingArac.SonBakimTarihi = arac.SonBakimTarihi;
                existingArac.GuncelKm = arac.GuncelKm;
                existingArac.YakitTuketimi = arac.YakitTuketimi;
                existingArac.LastikDurumu = arac.LastikDurumu;
                existingArac.RuhsatBilgisi = arac.RuhsatBilgisi;
                existingArac.SirketKiralama = arac.SirketKiralama;
                existingArac.KullaniciAdi = arac.KullaniciAdi;
                existingArac.KullaniciTelefon = arac.KullaniciTelefon;
                existingArac.Konum = arac.Konum;
                existingArac.AracResimUrl = arac.AracResimUrl;

                await _context.SaveChangesAsync();

                // Yeni değerleri kaydet
                var yeniDegerler = new
                {
                    arac.Plaka,
                    arac.Marka,
                    arac.Model,
                    arac.Yil,
                    arac.VIN,
                    arac.SirketAdi,
                    arac.MuayeneTarihi,
                    arac.KaskoTrafik,
                    arac.KaskoTrafikTarihi,
                    arac.SonBakimTarihi,
                    arac.GuncelKm,
                    arac.YakitTuketimi,
                    arac.LastikDurumu,
                    arac.RuhsatBilgisi,
                    arac.SirketKiralama,
                    arac.KullaniciAdi,
                    arac.KullaniciTelefon,
                    arac.Konum,
                    arac.AracResimUrl
                };

                // Log kaydı
                await _logService.LogIslemAsync(
                    id,
                    "Araç Tam Güncelleme",
                    $"Araç {arac.Plaka} - {arac.Marka} {arac.Model} tam güncelleme yapıldı.",
                    eskiDegerler,
                    yeniDegerler,
                    "Admin", // Bu değeri authentication'dan alabilirsiniz
                    GetClientIpAddress()
                );

                return Ok(existingArac);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Araç {Id} güncellenirken hata oluştu", id);
                return StatusCode(500, "İç sunucu hatası");
            }
        }

        // PATCH: api/araclar/5/ruhsat - Ruhsat bilgilerini güncelle
        [HttpPatch("{id}/ruhsat")]
        public async Task<IActionResult> UpdateRuhsatBilgileri(int id, [FromBody] RuhsatUpdateDto ruhsatDto)
        {
            try
            {
                var arac = await _context.Araclar.FindAsync(id);
                if (arac == null)
                {
                    return NotFound($"ID {id} ile araç bulunamadı.");
                }

                // Eski değerleri kaydet
                var eskiDegerler = new
                {
                    arac.Plaka,
                    arac.VIN,
                    arac.Marka,
                    arac.Model,
                    arac.Yil
                };

                // Sadece ruhsat bilgilerini güncelle
                arac.Plaka = ruhsatDto.Plaka;
                arac.VIN = ruhsatDto.VIN;
                arac.Marka = ruhsatDto.Marka;
                arac.Model = ruhsatDto.Model;
                arac.Yil = ruhsatDto.Yil;

                await _context.SaveChangesAsync();

                // Yeni değerleri kaydet
                var yeniDegerler = new
                {
                    ruhsatDto.Plaka,
                    ruhsatDto.VIN,
                    ruhsatDto.Marka,
                    ruhsatDto.Model,
                    ruhsatDto.Yil
                };

                // Log kaydı
                await _logService.LogIslemAsync(
                    id,
                    "Ruhsat Bilgileri Güncelleme",
                    $"Araç {ruhsatDto.Plaka} ruhsat bilgileri güncellendi.",
                    eskiDegerler,
                    yeniDegerler,
                    "Admin",
                    GetClientIpAddress()
                );

                return Ok(arac);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Araç {Id} ruhsat bilgileri güncellenirken hata oluştu", id);
                return StatusCode(500, "İç sunucu hatası");
            }
        }

        // PATCH: api/araclar/5/kullanici - Kullanıcı bilgilerini güncelle
        [HttpPatch("{id}/kullanici")]
        public async Task<IActionResult> UpdateKullaniciBilgileri(int id, [FromBody] KullaniciUpdateDto kullaniciDto)
        {
            try
            {
                var arac = await _context.Araclar.FindAsync(id);
                if (arac == null)
                {
                    return NotFound($"ID {id} ile araç bulunamadı.");
                }

                // Eski değerleri kaydet
                var eskiDegerler = new
                {
                    arac.KullaniciAdi,
                    arac.KullaniciTelefon
                };

                // Sadece kullanıcı bilgilerini güncelle
                arac.KullaniciAdi = kullaniciDto.KullaniciAdi;
                arac.KullaniciTelefon = kullaniciDto.KullaniciTelefon;

                await _context.SaveChangesAsync();

                // Yeni değerleri kaydet
                var yeniDegerler = new
                {
                    kullaniciDto.KullaniciAdi,
                    kullaniciDto.KullaniciTelefon
                };

                // Log kaydı
                await _logService.LogIslemAsync(
                    id,
                    "Kullanıcı Bilgileri Güncelleme",
                    $"Araç {arac.Plaka} kullanıcı bilgileri güncellendi.",
                    eskiDegerler,
                    yeniDegerler,
                    "Admin",
                    GetClientIpAddress()
                );

                return Ok(arac);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Araç {Id} kullanıcı bilgileri güncellenirken hata oluştu", id);
                return StatusCode(500, "İç sunucu hatası");
            }
        }

        // PATCH: api/araclar/5/arac-bilgileri - Araç bilgilerini güncelle
        [HttpPatch("{id}/arac-bilgileri")]
        public async Task<IActionResult> UpdateAracBilgileri(int id, [FromBody] AracBilgileriUpdateDto aracDto)
        {
            try
            {
                var arac = await _context.Araclar.FindAsync(id);
                if (arac == null)
                {
                    return NotFound($"ID {id} ile araç bulunamadı.");
                }

                // Eski değerleri kaydet
                var eskiDegerler = new
                {
                    arac.MuayeneTarihi,
                    arac.SonBakimTarihi,
                    arac.GuncelKm,
                    arac.LastikDurumu,
                    arac.KaskoTrafikTarihi
                };

                // Araç bilgilerini güncelle
                arac.MuayeneTarihi = aracDto.MuayeneTarihi;
                arac.SonBakimTarihi = aracDto.SonBakimTarihi;
                arac.GuncelKm = aracDto.GuncelKm;
                arac.LastikDurumu = aracDto.LastikDurumu;
                arac.KaskoTrafikTarihi = aracDto.KaskoTarihi;

                await _context.SaveChangesAsync();

                // Yeni değerleri kaydet
                var yeniDegerler = new
                {
                    aracDto.MuayeneTarihi,
                    aracDto.SonBakimTarihi,
                    aracDto.GuncelKm,
                    aracDto.LastikDurumu,
                    aracDto.KaskoTarihi
                };

                // Log kaydı
                await _logService.LogIslemAsync(
                    id,
                    "Araç Bilgileri Güncelleme",
                    $"Araç {arac.Plaka} teknik bilgileri güncellendi.",
                    eskiDegerler,
                    yeniDegerler,
                    "Admin",
                    GetClientIpAddress()
                );

                return Ok(arac);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Araç {Id} araç bilgileri güncellenirken hata oluştu", id);
                return StatusCode(500, "İç sunucu hatası");
            }
        }
    }

    // DTOs
    public class RuhsatUpdateDto
    {
        public string Plaka { get; set; } = string.Empty;
        public string VIN { get; set; } = string.Empty;
        public string Marka { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Yil { get; set; }
    }

    public class KullaniciUpdateDto
    {
        public string KullaniciAdi { get; set; } = string.Empty;
        public string KullaniciTelefon { get; set; } = string.Empty;
    }

    public class AracBilgileriUpdateDto
    {
        public DateTime MuayeneTarihi { get; set; }
        public DateTime KaskoTarihi { get; set; }
        public DateTime SonBakimTarihi { get; set; }
        public int GuncelKm { get; set; }
        public string LastikDurumu { get; set; } = string.Empty;
    }
}