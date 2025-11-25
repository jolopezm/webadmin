#!/bin/bash
# Script de prueba para el sistema de autenticación

echo "🔐 Probando Sistema de Autenticación PymeMap"
echo "============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL de la API
API_URL="https://pymemap-production-306f.up.railway.app"

echo "📡 Probando conectividad con la API..."
echo "URL: $API_URL"
echo ""

# Test 1: Verificar que la API está online
echo "Test 1: Verificar API online"
if curl -s -f -o /dev/null "$API_URL/docs"; then
    echo -e "${GREEN}✅ API está online${NC}"
else
    echo -e "${RED}❌ API no responde${NC}"
fi
echo ""

# Test 2: Intentar login con credenciales de prueba
echo "Test 2: Probar endpoint de login"
echo "Intentando login con credenciales de prueba..."

RESPONSE=$(curl -s -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Login exitoso (HTTP 200)${NC}"
    echo "Token recibido"
elif [ "$HTTP_CODE" = "401" ]; then
    echo -e "${YELLOW}⚠️  Credenciales incorrectas (HTTP 401)${NC}"
    echo "Esto es esperado si no tienes un usuario de prueba"
else
    echo -e "${RED}❌ Error inesperado (HTTP $HTTP_CODE)${NC}"
    echo "Respuesta: $BODY"
fi
echo ""

# Test 3: Verificar archivos locales
echo "Test 3: Verificar archivos del sistema de auth"

FILES=(
    "login.html"
    "js/auth-service.js"
    "js/auth-guard.js"
    "AUTH_SYSTEM.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file (no encontrado)"
    fi
done
echo ""

# Test 4: Verificar que las páginas tienen el auth-guard
echo "Test 4: Verificar protección en páginas"

PAGES=(
    "index.html"
    "pedidos.html"
    "servicios.html"
    "historial.html"
    "vision.html"
)

for page in "${PAGES[@]}"; do
    if grep -q "auth-guard.js" "$page" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $page está protegida"
    else
        echo -e "${RED}❌${NC} $page NO está protegida"
    fi
done
echo ""

# Resumen
echo "============================================="
echo "✨ Pruebas completadas"
echo ""
echo "Para probar manualmente:"
echo "1. Inicia el servidor:"
echo "   ${YELLOW}python3 -m http.server 8000${NC}"
echo ""
echo "2. Abre en el navegador:"
echo "   ${YELLOW}http://localhost:8000/login.html${NC}"
echo ""
echo "3. Intenta acceder a una página protegida:"
echo "   ${YELLOW}http://localhost:8000/index.html${NC}"
echo "   (Debe redirigir a login)"
echo ""
echo "============================================="
