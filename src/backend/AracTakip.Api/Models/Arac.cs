using System.ComponentModel.DataAnnotations;

namespace AracTakip.Api.Models
{
    public class Arac
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Plaka { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Marka { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Model { get; set; } = string.Empty;
        
        public int Yil { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string VIN { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string SirketAdi { get; set; } = string.Empty;
        
        public DateTime MuayeneTarihi { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string KaskoTrafik { get; set; } = string.Empty;
        
        public DateTime KaskoTrafikTarihi { get; set; }
        
        public DateTime SonBakimTarihi { get; set; }
        
        public int GuncelKm { get; set; }
        
        public decimal YakitTuketimi { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string LastikDurumu { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string RuhsatBilgisi { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string SirketKiralama { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string KullaniciAdi { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string KullaniciTelefon { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Konum { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? AracResimUrl { get; set; }
    }
}