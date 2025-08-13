using Microsoft.EntityFrameworkCore;
using AracTakip.Api.Data;
using AracTakip.Api.Models;
using AracTakip.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddDbContext<AracTakipDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Log service'i ekle
builder.Services.AddScoped<IAracLogService, AracLogService>();

builder.Services.AddControllers(); // Controller desteği ekle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Araç Takip API", Version = "v1" });
});

// CORS - Zorunlu
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// CORS'u en başta ekle - Sıralama önemli!
app.UseCors("AllowAll");

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Controller routing ekle
app.MapControllers();

app.Run();