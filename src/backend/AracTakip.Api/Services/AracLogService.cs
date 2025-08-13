using AracTakip.Api.Data;
using AracTakip.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AracTakip.Api.Services
{
    public class AracLogService : IAracLogService
    {
        private readonly AracTakipDbContext _context;

        public AracLogService(AracTakipDbContext context)
        {
            _context = context;
        }

        public async Task LogIslemAsync(int aracId, string islemTuru, string aciklama, object? eskiDegerler = null, object? yeniDegerler = null, string kullaniciAdi = "System", string ipAdresi = "Unknown")
        {
            var log = new AracLog
            {
                AracId = aracId,
                IslemTuru = islemTuru,
                Aciklama = aciklama,
                EskiDegerler = eskiDegerler != null ? JsonSerializer.Serialize(eskiDegerler) : null,
                YeniDegerler = yeniDegerler != null ? JsonSerializer.Serialize(yeniDegerler) : null,
                KullaniciAdi = kullaniciAdi,
                IpAdresi = ipAdresi,
                IslemTarihi = DateTime.Now
            };

            _context.AracLoglari.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AracLog>> GetAracLogsAsync(int aracId)
        {
            return await _context.AracLoglari
                .Where(l => l.AracId == aracId)
                .OrderByDescending(l => l.IslemTarihi)
                .ToListAsync();
        }
    }
}