#!/bin/bash

# 🔍 Script de Diagnóstico - Custer AI Studio
# Verifica que todo esté configurado correctamente para testing

echo "═══════════════════════════════════════════════════════════"
echo "🔍 DIAGNÓSTICO - Custer AI Studio"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 1. Verificar Node.js
echo "1️⃣  Verificar Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js instalado: $NODE_VERSION"
else
    echo "❌ Node.js NO instalado"
    echo "   Solución: brew install node"
fi
echo ""

# 2. Verificar npm
echo "2️⃣  Verificar npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm instalado: $NPM_VERSION"
else
    echo "❌ npm NO instalado"
    echo "   Solución: brew install npm"
fi
echo ""

# 3. Verificar archivos críticos
echo "3️⃣  Verificar archivos críticos..."
CRITICAL_FILES=(
    "package.json"
    "public/studio-v2.html"
    "app/lib/prompt-schemas.js"
    ".env.local"
    "app/api/generate/route.js"
    "app/api/validate/route.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(ls -lh "$file" | awk '{print $5}')
        echo "✅ $file ($SIZE)"
    else
        echo "❌ $file - NO ENCONTRADO"
    fi
done
echo ""

# 4. Verificar API Key
echo "4️⃣  Verificar API Key..."
if [ -f ".env.local" ]; then
    if grep -q "ANTHROPIC_API_KEY" .env.local; then
        KEY_LENGTH=$(grep "ANTHROPIC_API_KEY" .env.local | cut -d'=' -f2 | wc -c)
        if [ "$KEY_LENGTH" -gt 10 ]; then
            echo "✅ API Key configurada (${KEY_LENGTH} caracteres)"
        else
            echo "⚠️  API Key muy corta o vacía"
        fi
    else
        echo "❌ API Key NO encontrada en .env.local"
    fi
else
    echo "❌ .env.local NO existe"
    echo "   Solución: Crear archivo con: ANTHROPIC_API_KEY=tu_clave"
fi
echo ""

# 5. Verificar puerto 3000
echo "5️⃣  Verificar puerto 3000..."
if command -v lsof &> /dev/null; then
    if lsof -i :3000 > /dev/null 2>&1; then
        PID=$(lsof -t -i :3000)
        echo "✅ Servidor corriendo en puerto 3000 (PID: $PID)"
    else
        echo "⏸️  Servidor NO está corriendo en puerto 3000"
        echo "   Solución: npm run dev"
    fi
else
    echo "⚠️  lsof no disponible, no se puede verificar puerto"
fi
echo ""

# 6. Verificar conexión a API de Anthropic
echo "6️⃣  Verificar conexión a API (requiere servidor corriendo)..."
if command -v curl &> /dev/null; then
    RESPONSE=$(curl -s http://localhost:3000 | head -c 100)
    if [ ! -z "$RESPONSE" ]; then
        echo "✅ Servidor responde en localhost:3000"
    else
        echo "❌ No se puede conectar a localhost:3000"
    fi
else
    echo "⚠️  curl no disponible"
fi
echo ""

# 7. Verificar dependencias de npm
echo "7️⃣  Verificar dependencias npm..."
if [ -d "node_modules" ]; then
    MODULE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo "✅ node_modules existe (${MODULE_COUNT} paquetes)"
else
    echo "⚠️  node_modules NO existe"
    echo "   Solución: npm install"
fi
echo ""

# 8. Resumen
echo "═══════════════════════════════════════════════════════════"
echo "📋 RESUMEN"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Para iniciar testing:"
echo "1. Verifica que npm está instalado (punto 2)"
echo "2. Verifica que .env.local tiene API Key (punto 4)"
echo "3. Ejecuta: npm run dev"
echo "4. Abre: http://localhost:3000"
echo "5. Abre Developer Tools (F12) → Console"
echo "6. Prueba endpoint: fetch('/api/validate', ...)"
echo ""
echo "Para debugging:"
echo "- Abre: http://localhost:3000"
echo "- Press: F12 (Developer Tools)"
echo "- Tab: Console (ver errores rojos)"
echo "- Tab: Network (ver requests a /api/*)"
echo ""
