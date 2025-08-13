using System.ComponentModel.DataAnnotations;

namespace AracTakip.Api.Models
{
    public class AracLog
    {
        public int Id { get; set; }
        
        public int AracId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string IslemTuru { get; set; } = string.Empty; // "Ruhsat Güncelleme", "Kullanıcı Güncelleme", etc.
        
        [Required]
        [MaxLength(500)]
        public string Aciklama { get; set; } = string.Empty;
        
        [MaxLength(2000)]
        public string? EskiDegerler { get; set; } // JSON format
        
        [MaxLength(2000)]
        public string? YeniDegerler { get; set; } // JSON format
        
        [Required]
        [MaxLength(100)]
        public string KullaniciAdi { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string IpAdresi { get; set; } = string.Empty;
        
        public DateTime IslemTarihi { get; set; } = DateTime.Now;
        
        // Navigation property
        public virtual Arac? Arac { get; set; }
    }
}