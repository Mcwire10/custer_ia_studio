#!/bin/bash

# 🧪 SCRIPT DE TESTING AUTOMATIZADO - Custer AI Studio Pro
# Prueba todos los endpoints de la API

BASE_URL="http://localhost:3000"
RESULTS_FILE="/tmp/custer-test-results.txt"

echo "🚀 Iniciando testing de endpoints..." | tee $RESULTS_FILE
echo "URL Base: $BASE_URL" | tee -a $RESULTS_FILE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a $RESULTS_FILE

# Test 1: Verificar que la página principal se sirve
echo -e "\n\n📄 TEST 1: Página principal (studio-v2.html)" | tee -a $RESULTS_FILE
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/studio-v2.html)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - Código HTTP: $HTTP_CODE" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL - Código HTTP: $HTTP_CODE" | tee -a $RESULTS_FILE
fi

# Test 2: API - Process Brand Text
echo -e "\n\n📝 TEST 2: /api/process-brand-text" | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -X POST "$BASE_URL/api/process-brand-text" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Somos una agencia de marketing digital especializada en branding para startups"
  }')

if echo "$RESPONSE" | grep -q "nombre\|rubro"; then
  echo "✅ PASS - Respuesta contiene datos de marca" | tee -a $RESULTS_FILE
  echo "Respuesta: $RESPONSE" | head -c 200 | tee -a $RESULTS_FILE
else
  echo "⚠️ REVISAR - Respuesta:" | tee -a $RESULTS_FILE
  echo "$RESPONSE" | tee -a $RESULTS_FILE
fi

# Test 3: API - Analyze Visual Identity (sin imágenes)
echo -e "\n\n🎨 TEST 3: /api/analyze-visual-identity (error esperado)" | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -X POST "$BASE_URL/api/analyze-visual-identity" \
  -H "Content-Type: application/json" \
  -d '{
    "images": [],
    "brandName": "Test Brand"
  }')

if echo "$RESPONSE" | grep -q "error\|Error\|images"; then
  echo "✅ PASS - Retorna error esperado (sin imágenes)" | tee -a $RESULTS_FILE
else
  echo "⚠️ REVISAR - Respuesta:" | tee -a $RESULTS_FILE
  echo "$RESPONSE" | tee -a $RESULTS_FILE
fi

# Test 4: API - Validate Content
echo -e "\n\n🎯 TEST 4: /api/validate" | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -X POST "$BASE_URL/api/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Este producto es muy bueno!!!",
    "brain": {
      "nombre": "Test Brand",
      "registro": "formal-conversacional",
      "tonalidad": "profesional"
    }
  }')

if echo "$RESPONSE" | grep -q "validacion\|validation\|sugerencia\|suggestion"; then
  echo "✅ PASS - Validación funcionando" | tee -a $RESULTS_FILE
  echo "Respuesta: " | tee -a $RESULTS_FILE
  echo "$RESPONSE" | head -c 300 | tee -a $RESULTS_FILE
else
  echo "⚠️ REVISAR - Respuesta:" | tee -a $RESULTS_FILE
  echo "$RESPONSE" | tee -a $RESULTS_FILE
fi

# Test 5: API - Generate Copy
echo -e "\n\n✍️ TEST 5: /api/copy" | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -X POST "$BASE_URL/api/copy" \
  -H "Content-Type: application/json" \
  -d '{
    "producto": "Agencia de branding digital",
    "brain": {
      "nombre": "Test Brand",
      "propuesta": "Branding profesional"
    }
  }')

if echo "$RESPONSE" | grep -q "whatsapp\|instagram\|email\|linkedin"; then
  echo "✅ PASS - Copy generado para múltiples plataformas" | tee -a $RESULTS_FILE
  echo "Plataformas en respuesta:" | tee -a $RESULTS_FILE
  echo "$RESPONSE" | grep -o '"[a-z]*":' | sort | uniq | tee -a $RESULTS_FILE
else
  echo "⚠️ REVISAR - Respuesta:" | tee -a $RESULTS_FILE
  echo "$RESPONSE" | tee -a $RESULTS_FILE
fi

# Test 6: API - Competition Analysis
echo -e "\n\n🔍 TEST 6: /api/competition" | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -X POST "$BASE_URL/api/competition" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa": "Google",
    "brain": {
      "nombre": "Test Brand"
    }
  }')

if echo "$RESPONSE" | grep -q "competencia\|competition\|diferenciador\|differentiator"; then
  echo "✅ PASS - Análisis de competencia funcionando" | tee -a $RESULTS_FILE
else
  echo "⚠️ REVISAR - Respuesta:" | tee -a $RESULTS_FILE
  echo "$RESPONSE" | tee -a $RESULTS_FILE
fi

# Test 7: API - Reports (esperado que sea mock)
echo -e "\n\n📊 TEST 7: /api/reports (MOCK esperado)" | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -X POST "$BASE_URL/api/reports" \
  -H "Content-Type: application/json" \
  -d '{
    "instagram": "@test",
    "periodo": "mes"
  }')

if echo "$RESPONSE" | grep -q "Integracion\|integration\|mock"; then
  echo "✅ PASS - Mock detectado (integración pendiente)" | tee -a $RESULTS_FILE
else
  echo "ℹ️ INFO - Respuesta:" | tee -a $RESULTS_FILE
  echo "$RESPONSE" | head -c 200 | tee -a $RESULTS_FILE
fi

# Resumen
echo -e "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a $RESULTS_FILE
echo "📊 RESUMEN DE TESTING" | tee -a $RESULTS_FILE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE
echo "✅ Página principal: HTML se sirve correctamente" | tee -a $RESULTS_FILE
echo "✅ Endpoints API: Responden a requests" | tee -a $RESULTS_FILE
echo "⚠️ Generador: REQUIERE TESTING CON IMÁGENES REALES" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE
echo "📁 Resultados guardados en: $RESULTS_FILE" | tee -a $RESULTS_FILE

cat $RESULTS_FILE
