# 🔍 SonarQube - Guia Rápido

## 🚀 Inicialização Rápida

```bash
# 1. Subir SonarQube
npm run sonar:up

# 2. Aguardar inicialização (2-3 minutos)
# 3. Acessar: http://localhost:9000
# 4. Login: admin/admin (alterar senha obrigatório)
```

## 🔑 Configuração de Token

### 1. Gerar Token no SonarQube

1. Acesse: http://localhost:9000
2. Login com: `admin/admin`
3. Altere a senha (obrigatório no primeiro acesso)
4. Vá em: **My Account** → **Security** → **Generate Tokens**
5. Nome: `nodejs-boilerplate-token`
6. Copie o token gerado

### 2. Configurar Token no Projeto

#### Opção A: Variável de Ambiente

```bash
export SONAR_TOKEN=seu_token_aqui
```

#### Opção B: Arquivo .env

```bash
echo "SONAR_TOKEN=seu_token_aqui" >> .env
```

#### Opção C: sonar-project.properties

```bash
echo "sonar.token=seu_token_aqui" >> sonar-project.properties
```

## 📊 Executar Análise

```bash
# Análise completa (recomendado)
npm run quality:check

# OU por etapas
npm run lint:sonar    # Gerar relatório ESLint
npm run sonar        # Executar análise SonarQube
```

## 🎯 Acessar Dashboard

- **URL**: http://localhost:9000
- **Projeto**: `joneivison13_nodejs-boilerplate-ts`
- **Usuário**: admin
- **Senha**: (definida no primeiro acesso)

## 🛠️ Comandos Utilitários

```bash
# Status dos containers
docker compose -f docker-compose.sonar.yml ps

# Logs do SonarQube
docker compose -f docker-compose.sonar.yml logs -f sonarqube

# Reiniciar SonarQube
docker compose -f docker-compose.sonar.yml restart sonarqube

# Parar ambiente
npm run sonar:down

# Reset completo (limpar dados)
npm run sonar:down
docker volume prune -f
npm run sonar:up
```

## ❌ Troubleshooting

### Erro: "Not authorized"

```bash
# 1. Verificar se o token está configurado
echo $SONAR_TOKEN

# 2. Regenerar token no web UI
# 3. Verificar permissões do usuário
```

### Erro: "Connection refused"

```bash
# Verificar se SonarQube está rodando
curl http://localhost:9000/api/system/status

# Se não estiver, iniciar:
npm run sonar:up
```

### SonarQube não inicia

```bash
# Verificar logs
docker compose -f docker-compose.sonar.yml logs sonarqube

# Verificar espaço em disco
df -h

# Verificar memória
free -h
```

## 🎨 Quality Gate Status

- ✅ **PASSED**: Projeto aprovado
- ❌ **FAILED**: Correções necessárias

### Métricas Principais:

- 🐛 **Bugs**: 0
- 🔒 **Vulnerabilities**: 0
- 💨 **Code Smells**: Rating A
- 🔄 **Duplicated Code**: < 3%
- 🧠 **Cognitive Complexity**: < 15

---

## 📚 Links Úteis

- [SonarQube Docs](https://docs.sonarqube.org/latest/)
- [SonarJS Rules](https://rules.sonarsource.com/javascript)
- [Quality Gates](https://docs.sonarqube.org/latest/user-guide/quality-gates/)
