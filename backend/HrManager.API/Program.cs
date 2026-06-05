using System.Text;
using HrManager.API.Data;
using HrManager.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────
// Railway injects DATABASE_URL as postgresql://user:pass@host:port/db
// Npgsql needs Host=...;Username=...;Password=...;Database=...
var rawUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
string connectionString;
if (!string.IsNullOrEmpty(rawUrl))
{
    var uri = new Uri(rawUrl);
    var userInfo = uri.UserInfo.Split(':');
    connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}
else
{
    connectionString = builder.Configuration.GetConnectionString("Default")!;
}
builder.Services.AddDbContext<HrDbContext>(opt =>
    opt.UseNpgsql(connectionString));

// ── JWT ───────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(
                                           Encoding.UTF8.GetBytes(jwtKey)),
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<JwtService>();

// ── CORS ─────────────────────────────────────────────
var allowedOrigins = (Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? "http://localhost:3000")
    .Split(',', StringSplitOptions.RemoveEmptyEntries);
builder.Services.AddCors(opt =>
    opt.AddPolicy("ReactDev", p =>
        p.WithOrigins(allowedOrigins)
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials()));

// ── Controllers + Swagger ─────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "HR Manager API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In     = ParameterLocation.Header,
        Name   = "Authorization",
        Type   = SecuritySchemeType.Http,
        Scheme = "bearer",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {{
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
        },
        Array.Empty<string>()
    }});
});

var app = builder.Build();

// ── Auto Migration ────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HrDbContext>();
    db.Database.Migrate();
}

// ── Middleware — THỨ TỰ QUAN TRỌNG ──────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Static files PHẢI đứng trước Controllers
// (production: serve React build từ wwwroot/)
if (!app.Environment.IsDevelopment())
{
    app.UseDefaultFiles();  // index.html là mặc định
    app.UseStaticFiles();   // serve css/js/assets
}

app.UseCors("ReactDev");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Fallback: mọi route không khớp API → trả index.html (React Router tự xử lý)
if (!app.Environment.IsDevelopment())
{
    app.MapFallbackToFile("index.html");
}

app.Run();
