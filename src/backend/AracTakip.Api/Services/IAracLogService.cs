using AracTakip.Api.Models;

namespace AracTakip.Api.Services
{
    public interface IAracLogService
    {
        Task LogIslemAsync(int aracId, string islemTuru, string aciklama, object? eskiDegerler = null, object? yeniDegerler = null, string kullaniciAdi = "System", string ipAdresi = "Unknown");
        Task<List<AracLog>> GetAracLogsAsync(int aracId);
    }
}