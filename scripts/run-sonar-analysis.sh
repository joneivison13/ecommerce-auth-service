#!/bin/bash

set -e

echo "🔍 SonarQube - Análise Local de Qualidade de Código"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    print_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

print_status "Iniciando SonarQube local..."

# Subir SonarQube
print_status "📦 Subindo containers SonarQube e PostgreSQL..."
docker-compose -f docker-compose.sonar.yml up -d

print_status "⏳ Aguardando SonarQube inicializar (pode levar alguns minutos)..."

# Aguardar SonarQube ficar pronto (timeout de 5 minutos)
timeout=300
counter=0
while ! curl -s http://localhost:9000/api/system/status | grep -q "UP" 2>/dev/null; do
    if [ $counter -ge $timeout ]; then
        print_error "SonarQube não inicializou em 5 minutos. Verificando logs..."
        docker-compose -f docker-compose.sonar.yml logs sonarqube
        exit 1
    fi
    
    printf "."
    sleep 5
    counter=$((counter + 5))
done

echo ""
print_success "SonarQube está funcionando!"

# Verificar se sonar-scanner está disponível
if ! command -v sonar-scanner &> /dev/null; then
    print_warning "sonar-scanner não encontrado. Usando Docker..."
    
    print_status "🔍 Executando análise com Docker..."
    docker run --rm \
        --network host \
        -v "$(pwd):/usr/src" \
        -w /usr/src \
        sonarsource/sonar-scanner-cli \
        -Dsonar.host.url=http://localhost:9000 \
        -Dsonar.login=admin \
        -Dsonar.password=admin
else
    print_status "🔍 Executando análise local..."
    npm run lint:sonar 2>/dev/null || print_warning "ESLint falhou, continuando..."
    
    sonar-scanner \
        -Dsonar.host.url=http://localhost:9000 \
        -Dsonar.login=admin \
        -Dsonar.password=admin
fi

if [ $? -eq 0 ]; then
    echo ""
    print_success "✅ Análise concluída com sucesso!"
    echo ""
    echo "📊 Dashboard disponível em: ${BLUE}http://localhost:9000${NC}"
    echo "👤 Login padrão:"
    echo "   Usuário: ${YELLOW}admin${NC}"
    echo "   Senha: ${YELLOW}admin${NC}"
    echo ""
    echo "🛑 Para parar o SonarQube:"
    echo "   ${BLUE}npm run sonar:down${NC}"
    echo ""
    
    # Tentar abrir no navegador (Linux)
    if command -v xdg-open &> /dev/null; then
        print_status "🌐 Tentando abrir no navegador..."
        xdg-open http://localhost:9000 2>/dev/null || true
    fi
else
    print_error "❌ Análise falhou!"
    echo ""
    echo "📋 Para debuggar:"
    echo "   ${BLUE}docker-compose -f docker-compose.sonar.yml logs${NC}"
    exit 1
fi
