#!/bin/bash

# 🚀 Script de instalación y arranque automático
# Ejecutar: bash INSTALL_AND_RUN.sh

echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo ""
    echo "📥 Instalando Node.js vía Homebrew..."
    echo "   (Puede pedir contraseña)"
    echo ""

    # Verificar si Homebrew está instalado
    if ! command -v brew &> /dev/null; then
        echo "⚠️  Homebrew no encontrado. Instalando..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    # Instalar Node.js
    brew install node
else
    echo "✅ Node.js ya está instalado"
    node --version
fi

echo ""
echo "🚀 Instalando dependencias npm..."
npm install

echo ""
echo "📚 Iniciando servidor Next.js..."
echo "   → http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

npm run dev
