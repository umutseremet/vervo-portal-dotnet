using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AracTakip.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAracLogTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AracLoglari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AracId = table.Column<int>(type: "int", nullable: false),
                    IslemTuru = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Aciklama = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EskiDegerler = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    YeniDegerler = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    KullaniciAdi = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IpAdresi = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IslemTarihi = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AracLoglari", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AracLoglari_Araclar_AracId",
                        column: x => x.AracId,
                        principalTable: "Araclar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AracLoglari_AracId",
                table: "AracLoglari",
                column: "AracId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AracLoglari");
        }
    }
}
