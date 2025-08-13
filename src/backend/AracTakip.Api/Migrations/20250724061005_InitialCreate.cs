using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AracTakip.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Araclar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Plaka = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Marka = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Model = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Yil = table.Column<int>(type: "int", nullable: false),
                    VIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SirketAdi = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MuayeneTarihi = table.Column<DateTime>(type: "datetime2", nullable: false),
                    KaskoTrafik = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    KaskoTrafikTarihi = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SonBakimTarihi = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GuncelKm = table.Column<int>(type: "int", nullable: false),
                    YakitTuketimi = table.Column<decimal>(type: "decimal(4,1)", precision: 4, scale: 1, nullable: false),
                    LastikDurumu = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RuhsatBilgisi = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SirketKiralama = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    KullaniciAdi = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    KullaniciTelefon = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Konum = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AracResimUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Araclar", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Araclar");
        }
    }
}
