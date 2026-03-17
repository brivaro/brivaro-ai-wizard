Write-Host "🚀 Iniciando instalación..."

if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm no está instalado"
    exit 1
}

cd scripts/brivaro

Write-Host "📦 Instalando dependencias..."
pnpm install

Write-Host "🧙 Ejecutando wizard..."
node brivaro.mjs

Write-Host "✅ Instalación completada"