using Microsoft.EntityFrameworkCore;
using MapApi.Data;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Добавляем контроллеры
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Разрешаем NaN, Infinity в JSON
        options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowNamedFloatingPointLiterals;
        // Игнорируем циклы (на всякий случай)
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Настраиваем подключение к PostgreSQL с PostGIS
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.UseNetTopologySuite()
    ));

// Добавляем Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Настраиваем конвейер HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Отключаем для разработки
app.UseAuthorization();
app.MapControllers();

app.Run();