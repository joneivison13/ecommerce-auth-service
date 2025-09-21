# 🚀 Auth Service - Microsserviço de Autenticação

[![Node.js](https://img.shields.io/badge/Node.js-19+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-000000?style=flat&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.5+-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![AWS Cognito](https://img.shields.io/badge/AWS_Cognito-FF9900?style=flat&logo=amazon-aws)](https://aws.amazon.com/cognito/)
[![Docker](https://img.shields.io/badge/Docker-20.10+-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)

[![Quality Gate Status](https://img.shields.io/badge/Quality_Gate-Ready-brightgreen?style=flat&logo=sonarqube)](http://localhost:9000)
[![ESLint](https://img.shields.io/badge/ESLint-Configured-4B32C3?style=flat&logo=eslint)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-Integrated-F7B93E?style=flat&logo=prettier)](https://prettier.io/)
[![SonarQube](https://img.shields.io/badge/SonarQube-Local_Ready-4E9BCD?style=flat&logo=sonarqube)](http://localhost:9000)

**Microsserviço robusto de autenticação e autorização construído com Node.js, TypeScript e AWS Cognito, seguindo os princípios de Clean Architecture e práticas de desenvolvimento modernas.**

---

## 📋 Índice

1. [📖 Sobre o Projeto](#-sobre-o-projeto)
2. [🏗️ Arquitetura](#️-arquitetura)
3. [🚀 Tecnologias](#-tecnologias)
4. [⚡ Quick Start](#-quick-start)
5. [📁 Estrutura do Projeto](#-estrutura-do-projeto)
6. [🛣️ Rotas da API](#️-rotas-da-api)
7. [🔧 Configuração](#-configuração)
8. [� Qualidade de Código](#-qualidade-de-código)
9. [�🐳 Docker](#-docker)
10. [📊 Monitoramento](#-monitoramento)
11. [🚀 Deploy](#-deploy)
12. [🤝 Contribuição](#-contribuição)

---

## 📖 Sobre o Projeto

Este microsserviço de autenticação oferece uma solução completa e segura para gerenciamento de usuários, utilizando **AWS Cognito** como provedor de identidade e seguindo as melhores práticas de segurança e arquitetura de software.

### 🎯 Funcionalidades Principais

- ✅ **Autenticação Completa**: Login, registro, confirmação de conta
- 🔐 **Gestão de Senhas**: Recuperação e redefinição segura
- 🛡️ **Segurança Avançada**: Integração com AWS Cognito
- 📊 **Health Check**: Monitoramento de saúde do serviço
- 🔍 **Logging Estruturado**: Winston para rastreabilidade
- � **Qualidade de Código**: SonarQube + ESLint para análise contínua
- �🐳 **Docker Ready**: Containerização completa
- 📡 **Queue Integration**: Mensageria com RabbitMQ/Amazon MQ

### 🌟 Diferencial

- **Clean Architecture**: Separação clara de responsabilidades
- **Type Safety**: TypeScript em todo o projeto
- **Code Quality**: SonarQube para análise estática e detecção de vulnerabilidades
- **Validation**: Esquemas Zod para validação robusta
- **Scalability**: Suporte a clustering e load balancing
- **Observability**: Logs estruturados e health checks

---

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture**, organizando o código em camadas bem definidas:

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Controllers │  │   Routes    │  │ Middlewares │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Use Cases  │  │  Services   │  │   Schemas   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Database   │  │    Queue    │  │    HTTP     │     │
│  │   (Prisma)  │  │ (RabbitMQ)  │  │  (Express)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 🏛️ Camadas da Arquitetura

#### 1. **Presentation Layer** (Interface)

- **Controllers**: Gerenciam requests/responses HTTP
- **Routes**: Definição de endpoints da API
- **Middlewares**: Interceptadores (auth, logging, error handling)

#### 2. **Application Layer** (Casos de Uso)

- **Use Cases**: Lógica de negócio da aplicação
- **Services**: Orquestração de operações complexas
- **Schemas**: Validação e tipagem de dados

#### 3. **Infrastructure Layer** (Infraestrutura)

- **Database**: Acesso a dados via Prisma ORM
- **Queue**: Mensageria com RabbitMQ/Amazon MQ
- **HTTP**: Configuração do servidor Express

---

## 🚀 Tecnologias

### 🛠️ Core Technologies

| Tecnologia     | Versão | Propósito              |
| -------------- | ------ | ---------------------- |
| **Node.js**    | 19+    | Runtime JavaScript     |
| **TypeScript** | 5.2+   | Tipagem estática       |
| **Express**    | 4.18+  | Framework web          |
| **Prisma**     | 5.5+   | ORM e database toolkit |

### ☁️ AWS Services

| Serviço            | Propósito                  |
| ------------------ | -------------------------- |
| **AWS Cognito**    | Autenticação e autorização |
| **Amazon MQ**      | Sistema de mensageria      |
| **RDS PostgreSQL** | Banco de dados relacional  |

### 📦 Principais Dependências

#### **Production**

```json
{
  "@prisma/client": "^5.5.2",
  "amazon-cognito-identity-js": "^6.3.15",
  "amqplib": "^0.10.9",
  "aws-sdk": "^2.1692.0",
  "express": "^4.18.2",
  "winston": "^3.11.0",
  "zod": "^3.22.4"
}
```

#### **Development**

```json
{
  "tsx": "^4.1.1",
  "typescript": "^5.2.2"
}
```

---

## ⚡ Quick Start

### 📋 Pré-requisitos

- **Node.js** 19+
- **Docker** e **Docker Compose**
- **PostgreSQL** 15+
- **Yarn** ou **npm**

### 🚀 Instalação Rápida

```bash
# 1. Clone o repositório
git clone <repository-url>
cd auth-service

# 2. Instale as dependências
yarn install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 4. Inicie os serviços de infraestrutura
docker compose up -d

# 5. Execute as migrações do banco
npx prisma migrate deploy

# 6. Inicie o servidor em modo desenvolvimento
yarn dev
```

### 🔥 Verificação Rápida

```bash
# Verificar o health check
curl http://localhost:3333/health

# Resposta esperada:
{
  "status": "ok",
  "timestamp": "2025-09-21T10:30:00.000Z",
  "uptime": 1.234,
  "services": {
    "queue": {
      "connected": true,
      "status": "healthy"
    }
  }
}
```

---

## 📁 Estrutura do Projeto

```
auth-service/
├── 📂 src/                          # Código fonte principal
│   ├── 📂 @types/                   # Definições de tipos TypeScript
│   │   ├── auth.controller.d.ts
│   │   ├── express.d.ts
│   │   └── messaging.d.ts
│   │
│   ├── 📂 config/                   # Configurações da aplicação
│   │   ├── cognito.config.ts        # Configuração AWS Cognito
│   │   └── queue.config.ts          # Configuração de filas
│   │
│   ├── 📂 controllers/              # Controladores HTTP
│   │   ├── auth.controller.ts       # Autenticação e autorização
│   │   ├── health.controller.ts     # Health check
│   │   └── helloWorld.ts           # Endpoint de exemplo
│   │
│   ├── 📂 factory/                  # Padrão Factory
│   │   └── auth.factory.ts          # Factory de use cases de auth
│   │
│   ├── 📂 infra/                    # Camada de infraestrutura
│   │   ├── 📂 database/             # Configuração de banco
│   │   │   └── index.ts
│   │   ├── 📂 http/                 # Configuração HTTP
│   │   │   ├── 📂 middlewares/      # Middlewares Express
│   │   │   │   ├── errors.ts        # Tratamento de erros
│   │   │   │   ├── file_upload.ts   # Upload de arquivos
│   │   │   │   └── morgan.ts        # Logging de requests
│   │   │   └── routes.ts            # Definição de rotas
│   │   └── 📂 queue/                # Configuração de filas
│   │
│   ├── 📂 schemas/                  # Esquemas de validação (Zod)
│   │   └── auth.schema.ts           # Validações de autenticação
│   │
│   ├── 📂 services/                 # Serviços da aplicação
│   │   └── cognito.service.ts       # Serviços AWS Cognito
│   │
│   ├── 📂 useCases/                 # Casos de uso (Clean Architecture)
│   │   ├── confirm-forgot-password.auth.usecase.ts
│   │   ├── confirm-signup.auth.usecase.ts
│   │   ├── forgot-password.auth.usecase.ts
│   │   ├── login.auth.usecase.ts
│   │   ├── logout.auth.usecase.ts
│   │   ├── resend-confirmation-code.auth.usecase.ts
│   │   ├── signup.auth.usecase.ts
│   │   └── index.ts
│   │
│   ├── 📂 utils/                    # Utilitários
│   │   ├── error.ts                 # Classes de erro personalizadas
│   │   └── logger.ts                # Configuração do Winston
│   │
│   ├── app.ts                       # Configuração do Express
│   └── index.ts                     # Ponto de entrada da aplicação
│
│
├── 📂 prisma/                       # Configuração do Prisma ORM
│   ├── 📂 migrations/               # Migrações do banco
│   └── schema.prisma                # Schema do banco de dados
│
├── 📂 docker/                       # Arquivos Docker
|
│   └── 📂 pgdata/                   # Dados do PostgreSQL
│
│
├── 📂 logs/                         # Arquivos de log
│   ├── combined.log                 # Logs combinados
│   ├── error.log                    # Logs de erro
│   └── info.log                     # Logs informativos
│
├── 📂 coverage/                     # Relatórios de cobertura
│   └── lcov-report/                 # Relatório HTML
│
├── 📄 package.json                  # Dependências e scripts
├── 📄 tsconfig.json                 # Configuração TypeScript
├── 📄 jest.config.js                # Configuração Jest
├── 📄 docker-compose.yml            # Orquestração Docker
├── 📄 Dockerfile                    # Imagem Docker da aplicação
├── 📄 .env.example                  # Template de variáveis de ambiente
└── 📄 README.md                     # Este arquivo
```

---

## 🛣️ Rotas da API

### 🏠 **Rotas Básicas**

#### `GET /`

**Hello World Endpoint**

```http
GET /
```

**Resposta:**

```json
{
  "helloWorld": true
}
```

#### `GET /health`

**Health Check do Serviço**

```http
GET /health
```

**Resposta de Sucesso:**

```json
{
  "status": "ok",
  "timestamp": "2025-09-21T10:30:00.000Z",
  "uptime": 1234.567,
  "services": {
    "queue": {
      "connected": true,
      "status": "healthy"
    }
  }
}
```

**Resposta de Erro:**

```json
{
  "status": "error",
  "timestamp": "2025-09-21T10:30:00.000Z",
  "uptime": 1234.567,
  "services": {
    "queue": {
      "connected": false,
      "status": "error",
      "error": "Connection failed"
    }
  }
}
```

---

### 🔐 **Rotas de Autenticação**

#### `POST /login`

**Autenticação de usuário**

**Request:**

```http
POST /login
Content-Type: application/json

{
  "username": "usuario123",
  "password": "minhasenha123"
}
```

**Validações:**

- `username`: 3-30 caracteres
- `password`: 6-100 caracteres

**Resposta de Sucesso:**

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiI...",
  "refreshToken": "eyJjdHkiOiJKV1QiL...",
  "idToken": "eyJraWQiOiJVcDN...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "username": "usuario123",
    "email": "user@example.com",
    "name": "Nome do Usuário"
  }
}
```

#### `POST /signup`

**Registro de novo usuário**

**Request:**

```http
POST /signup
Content-Type: application/json

{
  "username": "novousuario",
  "password": "senha123456",
  "email": "user@example.com",
  "phoneNumber": "+5573999999999",
  "name": "Nome Completo"
}
```

**Validações:**

- `username`: 3-30 caracteres
- `password`: 6-100 caracteres
- `email`: formato válido de e-mail
- `phoneNumber`: formato internacional (+5573999999999) - opcional
- `name`: mínimo 2 caracteres

**Resposta de Sucesso:**

```json
{
  "message": "Usuário registrado com sucesso",
  "userSub": "12345678-1234-1234-1234-123456789abc",
  "confirmationRequired": true
}
```

#### `POST /confirm-signup`

**Confirmação de conta**

**Request:**

```http
POST /confirm-signup
Content-Type: application/json

{
  "username": "novousuario",
  "confirmationCode": "123456"
}
```

**Resposta de Sucesso:**

```json
{
  "message": "Conta confirmada com sucesso",
  "userConfirmed": true
}
```

#### `POST /resend-confirmation-code`

**Reenvio de código de confirmação**

**Request:**

```http
POST /resend-confirmation-code
Content-Type: application/json

{
  "username": "novousuario"
}
```

**Resposta de Sucesso:**

```json
{
  "message": "Código de confirmação reenviado",
  "destination": "u***@e***.com"
}
```

#### `POST /forgot-password`

**Solicitação de redefinição de senha**

**Request:**

```http
POST /forgot-password
Content-Type: application/json

{
  "username": "usuario123"
}
```

**Resposta de Sucesso:**

```json
{
  "message": "Código de redefinição enviado",
  "destination": "u***@e***.com"
}
```

#### `POST /confirm-forgot-password`

**Confirmação de nova senha**

**Request:**

```http
POST /confirm-forgot-password
Content-Type: application/json

{
  "username": "usuario123",
  "confirmationCode": "123456",
  "newPassword": "novasenha123"
}
```

**Resposta de Sucesso:**

```json
{
  "message": "Senha redefinida com sucesso"
}
```

#### `POST /logout`

**Logout do usuário**

**Request:**

```http
POST /logout
Content-Type: application/json

{
  "accessToken": "eyJhbGciOiJSUzI1NiI..."
}
```

**Resposta de Sucesso:**

```json
{
  "message": "Logout realizado com sucesso"
}
```

---

### 🚨 **Códigos de Status HTTP**

| Código | Descrição             | Quando Usar                    |
| ------ | --------------------- | ------------------------------ |
| `200`  | OK                    | Operação realizada com sucesso |
| `201`  | Created               | Recurso criado com sucesso     |
| `400`  | Bad Request           | Dados inválidos ou malformados |
| `401`  | Unauthorized          | Credenciais inválidas          |
| `403`  | Forbidden             | Acesso negado                  |
| `404`  | Not Found             | Recurso não encontrado         |
| `429`  | Too Many Requests     | Limite de taxa excedido        |
| `500`  | Internal Server Error | Erro interno do servidor       |

---

### 📝 **Exemplos de Uso com cURL**

```bash
# Health Check
curl -X GET http://localhost:3333/health

# Login
curl -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario123","password":"senha123"}'

# Registro
curl -X POST http://localhost:3333/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username":"novousuario",
    "password":"senha123456",
    "email":"user@example.com",
    "name":"Nome Completo"
  }'

# Confirmação de conta
curl -X POST http://localhost:3333/confirm-signup \
  -H "Content-Type: application/json" \
  -d '{"username":"novousuario","confirmationCode":"123456"}'
```

---

## 🔧 Configuração

### 📄 **Variáveis de Ambiente**

Copie o arquivo `.env.example` para `.env` e configure as seguintes variáveis:

```bash
# 📊 DATABASE CONFIGURATION
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5433/mydb?schema=public"

# 🌐 CORS CONFIGURATION
CORS_URLS="http://localhost:3001;http://localhost:3000"

# 📁 FILE UPLOAD CONFIGURATION
UPLOADS_PATH="/app/uploads"

# ☁️ AWS COGNITO CONFIGURATION
AWS_REGION="us-east-1"
COGNITO_USER_POOL_ID="us-east-1_xxxxxxxxx"
COGNITO_APP_CLIENT_ID="your-cognito-client-id"
COGNITO_APP_CLIENT_SECRET="your-cognito-client-secret"

# 📨 AMAZON MQ CONFIGURATION
AMAZON_MQ_USERNAME="your_amazon_mq_username"
AMAZON_MQ_PASSWORD="your_amazon_mq_password"
AMAZON_MQ_HOST="your_amazon_mq_host"
AMAZON_MQ_PORT="5671"
AMAZON_MQ_VIRTUAL_HOST="/"

# 🔄 APPLICATION CLUSTERS
APP_CLUSTERS="1"

# 🔧 NODE ENVIRONMENT
NODE_ENV="development"
```

### ⚙️ **Configuração do AWS Cognito**

#### 1. **Criação do User Pool**

```bash
# AWS CLI - Criar User Pool
aws cognito-idp create-user-pool \
  --pool-name "auth-service-pool" \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true
    }
  }'
```

#### 2. **Configuração do App Client**

```bash
# Criar App Client
aws cognito-idp create-user-pool-client \
  --user-pool-id "us-east-1_xxxxxxxxx" \
  --client-name "auth-service-client" \
  --generate-secret \
  --explicit-auth-flows ADMIN_NO_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH
```

### 📊 **Configuração do SonarQube**

#### **Variáveis de Ambiente (.env)**

```bash
# SonarQube Configuration
SONAR_HOST_URL=http://localhost:9000
SONAR_TOKEN=seu_token_aqui
SONAR_PROJECT_KEY=joneivison13_nodejs-boilerplate-ts
SONAR_ORGANIZATION=joneivison13

# Para SonarCloud (produção)
SONAR_HOST_URL=https://sonarcloud.io
SONAR_ORGANIZATION=sua_organizacao
```

#### **Arquivo sonar-project.properties**

```properties
# Identificação do projeto
sonar.projectKey=joneivison13_nodejs-boilerplate-ts
sonar.organization=joneivison13
sonar.projectName=AWS Auth Service - Node.js Boilerplate
sonar.projectVersion=1.0.0

# Configuração de código fonte
sonar.sources=src
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/logs/**
sonar.test.inclusions=**/*.test.ts,**/*.spec.ts

# TypeScript específico
sonar.typescript.node=node
sonar.sourceEncoding=UTF-8

# Relatórios ESLint
sonar.eslint.reportPaths=eslint-report.json

# Cobertura de testes (quando disponível)
sonar.javascript.lcov.reportPaths=coverage/lcov.info

# Quality Gate
sonar.qualitygate.wait=true

# Git integration
sonar.scm.provider=git
sonar.pullrequest.github.summary_comment=true
```

#### **Scripts Package.json**

```json
{
  "scripts": {
    "lint:sonar": "eslint src --ext .ts --format json -o eslint-report.json",
    "sonar": "sonar-scanner",
    "sonar:local": "docker run --rm -v \"$(pwd):/usr/src\" -w /usr/src sonarsource/sonar-scanner-cli",
    "sonar:up": "docker compose -f docker-compose.sonar.yml up -d",
    "sonar:down": "docker compose -f docker-compose.sonar.yml down",
    "quality:check": "npm run lint:sonar && npm run sonar"
  }
}
```

---

## 🐘 **Configuração do PostgreSQL**

#### Via Docker Compose:

```yaml
version: "3.8"
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: johndoe
      POSTGRES_PASSWORD: randompassword
      POSTGRES_DB: mydb
    ports:
      - 5433:5432
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

#### Migrações do Prisma:

```bash
# Gerar e aplicar migrações
npx prisma migrate dev --name init

# Aplicar migrações em produção
npx prisma migrate deploy

# Visualizar dados
npx prisma studio
```

---

## 🔍 Qualidade de Código

O projeto utiliza **SonarQube** para análise estática de código e **ESLint** para linting, garantindo alta qualidade e segurança.

### 📊 **Métricas Analisadas**

| Métrica                     | Descrição                         | Threshold |
| --------------------------- | --------------------------------- | --------- |
| **🐛 Bugs**                 | Problemas que podem causar falhas | 0         |
| **🔒 Vulnerabilities**      | Falhas de segurança               | 0         |
| **💨 Code Smells**          | Problemas de manutenibilidade     | Rating A  |
| **🔄 Duplicated Code**      | Código duplicado                  | < 3%      |
| **🧠 Cognitive Complexity** | Complexidade de compreensão       | < 15      |
| **📈 Maintainability**      | Facilidade de manutenção          | Rating A  |
| **🛡️ Security Rating**      | Classificação de segurança        | A         |
| **⚡ Reliability Rating**   | Classificação de confiabilidade   | A         |

### 🛠️ **Ferramentas de Análise**

#### **ESLint + SonarJS**

```bash
# Análise local do código
npm run lint

# Correção automática de problemas
npm run lint:fix

# Gerar relatório para SonarQube
npm run lint:sonar
```

#### **SonarCloud (Recomendado)**

1. **Configuração Inicial:**

   ```bash
   # 1. Acesse: https://sonarcloud.io
   # 2. Conecte com sua conta GitHub
   # 3. Importe o repositório
   # 4. Configure o token nos secrets do GitHub
   ```

2. **Análise Automática:**
   - Triggera automaticamente em push/PR
   - Dashboard online disponível 24/7
   - Quality Gates configurados
   - Integração com GitHub PRs

#### **SonarQube Local**

##### 🚀 **Inicialização do Ambiente**

```bash
# 1. Subir SonarQube + PostgreSQL
npm run sonar:up

# 2. Aguardar inicialização (pode levar 2-3 minutos)
# Verificar status:
docker compose -f docker-compose.sonar.yml ps

# 3. Verificar se está rodando
curl http://localhost:9000/api/system/status
```

##### 🔑 **Configuração Inicial**

1. **Primeiro Acesso:**

   ```bash
   # Abrir no navegador
   http://localhost:9000

   # Credenciais padrão
   Usuário: admin
   Senha: admin
   ```

2. **Alterar Senha (Obrigatório):**
   - No primeiro login, você será forçado a alterar a senha
   - Defina uma senha forte e anote-a

3. **Gerar Token de Análise:**

   ```bash
   # No SonarQube Web UI:
   # 1. User Menu → My Account → Security
   # 2. Generate Tokens → Name: "nodejs-boilerplate-token"
   # 3. Copy o token gerado
   ```

4. **Configurar Token no Projeto:**

   ```bash
   # Adicionar ao sonar-project.properties
   echo "sonar.token=SEU_TOKEN_AQUI" >> sonar-project.properties

   # OU definir variável de ambiente
   export SONAR_TOKEN=seu_token_aqui
   ```

##### 📊 **Executando Análises**

```bash
# Método 1: Script automatizado (recomendado)
npm run quality:check

# Método 2: Passos manuais
npm run lint:sonar        # Gerar relatório ESLint
npm run sonar            # Executar análise SonarQube

# Método 3: Docker (sem instalação local)
npm run sonar:local
```

##### 🎛️ **Dashboard e Métricas**

- **URL**: http://localhost:9000
- **Projeto**: `joneivison13_nodejs-boilerplate-ts`
- **Métricas Principais**:
  - 🐛 Bugs detectados
  - 🔒 Vulnerabilidades de segurança
  - 💨 Code smells (problemas de manutenibilidade)
  - 🔄 Duplicação de código
  - 🧠 Complexidade cognitiva

##### 🛠️ **Comandos Utilitários**

```bash
# Verificar logs do SonarQube
docker compose -f docker-compose.sonar.yml logs -f sonarqube

# Reiniciar apenas o SonarQube
docker compose -f docker-compose.sonar.yml restart sonarqube

# Limpar dados (reset completo)
npm run sonar:down
docker volume prune -f
npm run sonar:up

# Parar ambiente
npm run sonar:down
```

##### ⚡ **Configurações Avançadas**

```bash
# Análise com parâmetros específicos
sonar-scanner \
  -Dsonar.projectKey=auth-service \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=$SONAR_TOKEN

# Análise apenas de arquivos modificados
sonar-scanner \
  -Dsonar.pullrequest.key=123 \
  -Dsonar.pullrequest.branch=feature/nova-feature \
  -Dsonar.pullrequest.base=main
```

##### 🔍 **Interpretando Resultados**

**Quality Gate Status:**

- ✅ **PASSED**: Projeto aprovado nos critérios de qualidade
- ❌ **FAILED**: Projeto reprovado, correções necessárias

**Ratings (A-E):**

- **A**: Excelente (0-5% technical debt ratio)
- **B**: Bom (6-10% technical debt ratio)
- **C**: Regular (11-20% technical debt ratio)
- **D**: Ruim (21-50% technical debt ratio)
- **E**: Péssimo (>50% technical debt ratio)

##### 🚨 **Troubleshooting**

```bash
# SonarQube não inicia
docker compose -f docker-compose.sonar.yml logs sonarqube

# Erro de autenticação
# 1. Verificar se o token está correto
# 2. Regenerar token no web UI
# 3. Verificar permissões do usuário

# Erro de conexão
curl -v http://localhost:9000/api/system/status

# Limpar cache do SonarScanner
rm -rf ~/.sonar/cache
```

### 📋 **Quality Gates**

#### **Critérios Obrigatórios:**

- ✅ **New Code Coverage**: > 80%
- ✅ **Duplicated Lines**: < 3%
- ✅ **Maintainability Rating**: A
- ✅ **Reliability Rating**: A
- ✅ **Security Rating**: A
- ✅ **Security Hotspots Reviewed**: 100%

#### **Regras ESLint Ativas:**

```typescript
// Exemplos de regras configuradas
{
  "sonarjs/cognitive-complexity": ["error", 15],
  "sonarjs/no-duplicate-string": ["error", { "threshold": 3 }],
  "sonarjs/no-identical-functions": "error",
  "sonarjs/prefer-single-boolean-return": "error",
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/explicit-function-return-type": "warn"
}
```

### 🚀 **Workflow de Qualidade**

#### **1. Desenvolvimento Local:**

```bash
# Antes de commit
npm run lint:fix     # Corrige problemas automáticos
npm run build        # Verifica compilação
```

#### **2. CI/CD Pipeline:**

```yaml
# .github/workflows/sonarcloud.yml
- name: Code Quality Analysis
  run: |
    npm run lint:sonar
    # SonarCloud analysis automático
```

#### **3. Quality Gates:**

- **Pre-merge**: Análise obrigatória em PRs
- **Post-merge**: Análise completa em main
- **Blocking**: Deploy bloqueado se quality gate falhar

### 📊 **Dashboard e Relatórios**

#### **SonarCloud Dashboard:**

- **Overview**: Visão geral da qualidade
- **Issues**: Lista de problemas encontrados
- **Security Hotspots**: Pontos de atenção de segurança
- **Coverage**: Cobertura de testes (quando disponível)
- **Duplications**: Código duplicado

#### **Métricas Históricas:**

- **Tendências**: Evolução da qualidade ao longo do tempo
- **Technical Debt**: Tempo estimado para correções
- **Complexity**: Distribuição de complexidade

### 🔧 **Scripts Disponíveis**

| Script                  | Descrição              | Uso   |
| ----------------------- | ---------------------- | ----- |
| `npm run lint`          | Análise ESLint         | Local |
| `npm run lint:fix`      | Correção automática    | Local |
| `npm run lint:sonar`    | Relatório p/ SonarQube | CI/CD |
| `npm run sonar:up`      | SonarQube local        | Dev   |
| `npm run sonar:down`    | Parar SonarQube        | Dev   |
| `npm run quality:check` | Análise completa       | Local |

### 📈 **Benefícios Implementados**

#### **🛡️ Segurança:**

- Detecção automática de vulnerabilidades
- Análise de security hotspots
- Validação de práticas seguras de código

#### **🧹 Manutenibilidade:**

- Redução de code smells
- Diminuição de duplicação
- Complexidade controlada

#### **⚡ Performance:**

- Identificação de anti-patterns
- Otimização de algoritmos
- Redução de technical debt

#### **👥 Colaboração:**

- Padrões de código consistentes
- Reviews automáticos
- Feedback imediato para desenvolvedores

---

## 🐳 Docker

### 🏗️ **Desenvolvimento Local**

```bash
# Subir infraestrutura (PostgreSQL)
docker compose up -d

# Verificar status
docker compose ps

# Logs em tempo real
docker compose logs -f
```

### 🚀 **Build da Aplicação**

```bash
# Build da imagem
docker build -t auth-service:latest .

# Executar container
docker run -d \
  --name auth-service \
  -p 3333:3333 \
  --env-file .env \
  auth-service:latest
```

### 🧪 **Ambiente de Testes**

**Características do ambiente Docker para testes:**

- **Recursos limitados:** 2 CPUs, 1GB RAM
- **Infraestrutura temporária:** PostgreSQL + RabbitMQ
- **Armazenamento:** tmpfs (em memória)
- **Auto-destruição:** Limpeza automática

```bash
# Executar testes em Docker
npm run test:docker

# Monitorar recursos utilizados
docker stats

# Verificar logs detalhados
docker compose -f docker-compose.test.yml logs
```

### 📦 **Multi-stage Build**

O `Dockerfile` utiliza multi-stage para otimização:

```dockerfile
# Build stage
FROM node:19-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Production stage
FROM node:19-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3333
CMD ["node", "dist/src/index.js"]
```

### 🌐 **Networking**

```yaml
# docker-compose.yml
networks:
  auth-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

services:
  auth-service:
    networks:
      - auth-network
```

---

## 📊 Monitoramento

### 📈 **Health Checks**

**Endpoint:** `GET /health`

O health check monitora:

- ✅ Status da aplicação
- ✅ Conectividade com fila (RabbitMQ)
- ✅ Uptime do processo
- ✅ Timestamp da verificação

### 📋 **Logging Estruturado**

**Configuração Winston:**

```typescript
// src/utils/logger.ts
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});
```

**Tipos de Log:**

- `📄 combined.log` - Todos os logs
- `🚨 error.log` - Apenas erros
- `ℹ️ info.log` - Logs informativos
- `🖥️ Console` - Output em desenvolvimento

### 🔍 **Morgan HTTP Logging**

```typescript
// Formato personalizado de logs HTTP
morgan.format("DefaultFormat", (tokens, req, res) => {
  return [
    tokens["remote-addr"](req, res),
    tokens["method"](req, res),
    tokens["url"](req, res),
    tokens["status"](req, res),
    tokens["response-time"](req, res),
    "ms",
  ].join(" ");
});
```

### 📊 **Métricas Disponíveis**

- ⏱️ **Response Time** - Tempo de resposta das requisições
- 🔄 **Request Count** - Número de requisições
- 📈 **Uptime** - Tempo de atividade do processo
- 🔌 **Queue Status** - Status da conexão com RabbitMQ
- 💾 **Memory Usage** - Uso de memória (via `process.memoryUsage()`)

### 🚨 **Error Handling**

```typescript
// Middleware de tratamento de erros
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  res.status(error.statusCode || 500).json({
    error: error.message || "Internal Server Error",
  });
});
```

---

## � CI/CD e Integração Contínua

### 🤖 **GitHub Actions com SonarQube**

#### **Workflow de Quality Gate**

```yaml
# .github/workflows/sonarqube.yml
name: SonarQube Analysis

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  sonarqube:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint:sonar

      - name: SonarQube Scan
        uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        with:
          scanMetadataReportFile: target/sonar/report-task.txt

      - name: Quality Gate Check
        run: |
          if [ "${{ steps.sonarqube.outputs.quality-gate-status }}" != "PASSED" ]; then
            echo "Quality Gate failed"
            exit 1
          fi
```

#### **Configuração de Secrets**

No GitHub Repository → Settings → Secrets and Variables → Actions:

```bash
# Secrets obrigatórios
SONAR_TOKEN=squ_xxxxxxxxxxxxxxxxxxxxxxxx
SONAR_HOST_URL=https://sonarcloud.io

# Para SonarQube local (desenvolvimento)
SONAR_HOST_URL=http://localhost:9000
```

#### **Integração com Pull Requests**

```yaml
# Adicionar ao workflow acima
- name: SonarQube PR Analysis
  if: github.event_name == 'pull_request'
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  run: |
    npx sonar-scanner \
      -Dsonar.pullrequest.key=${{ github.event.number }} \
      -Dsonar.pullrequest.branch=${{ github.head_ref }} \
      -Dsonar.pullrequest.base=${{ github.base_ref }}
```

### 📊 **SonarCloud Integration**

#### **Setup Inicial**

1. **Conectar Repositório:**

   ```bash
   # 1. Acesse https://sonarcloud.io
   # 2. Login com GitHub
   # 3. Import repository: joneivison13/nodejs__boilerplate__ts
   # 4. Configure Organization
   ```

2. **Configurar Quality Gate:**

   ```bash
   # No SonarCloud:
   # 1. Project Settings → Quality Gates
   # 2. Criar/Selecionar: "Sonar way"
   # 3. Configurar condições:
   #    - Coverage on New Code: > 80%
   #    - Duplicated Lines on New Code: < 3%
   #    - Maintainability Rating: A
   #    - Reliability Rating: A
   #    - Security Rating: A
   ```

3. **Badge para README:**
   ```markdown
   [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=joneivison13_nodejs-boilerplate-ts&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=joneivison13_nodejs-boilerplate-ts)
   [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=joneivison13_nodejs-boilerplate-ts&metric=coverage)](https://sonarcloud.io/summary/new_code?id=joneivison13_nodejs-boilerplate-ts)
   [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=joneivison13_nodejs-boilerplate-ts&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=joneivison13_nodejs-boilerplate-ts)
   ```

### 🛡️ **Proteção de Branches**

#### **Branch Rules com Quality Gate**

```bash
# GitHub Repository Settings → Branches → Add rule
Branch name pattern: main
☑️ Restrict pushes that create files larger than 100MB
☑️ Require a pull request before merging
☑️ Require status checks to pass before merging
  ☑️ SonarQube Quality Gate
  ☑️ ESLint Analysis
☑️ Require branches to be up to date before merging
☑️ Require linear history
```

### 🔄 **Workflow Completo**

#### **Desenvolvimento → Produção**

```mermaid
graph TD
    A[Developer Push] --> B[GitHub Actions]
    B --> C[ESLint Analysis]
    B --> D[Build & Test]
    B --> E[SonarQube Scan]
    E --> F{Quality Gate}
    F -->|PASS| G[Merge Allowed]
    F -->|FAIL| H[Block Merge]
    G --> I[Deploy to Staging]
    I --> J[Integration Tests]
    J --> K[Deploy to Production]
```

#### **Scripts de Automação**

```bash
# pre-commit hook
#!/bin/sh
npm run lint:fix
npm run build
npm run lint:sonar

if [ $? -ne 0 ]; then
  echo "❌ Quality checks failed. Commit blocked."
  exit 1
fi

echo "✅ Quality checks passed. Proceeding with commit."
```

---

## �🚀 Deploy

### 🐳 **Docker Deployment**

#### 1. **Build de Produção**

```bash
# Build otimizado
docker build -t auth-service:v1.0.0 .

# Tag para registry
docker tag auth-service:v1.0.0 your-registry/auth-service:v1.0.0

# Push para registry
docker push your-registry/auth-service:v1.0.0
```

#### 2. **Deploy com Docker Compose**

```yaml
# docker-compose.prod.yml
version: "3.8"
services:
  auth-service:
    image: your-registry/auth-service:v1.0.0
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
    ports:
      - "3333:3333"
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
```

### ☁️ **AWS Deployment**

#### **ECS (Elastic Container Service)**

```json
{
  "family": "auth-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "auth-service",
      "image": "your-ecr-repo/auth-service:latest",
      "portMappings": [
        {
          "containerPort": 3333,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "DATABASE_URL", "valueFrom": "arn:aws:ssm:..." }
      ]
    }
  ]
}
```

#### **Elastic Beanstalk**

```json
// .ebextensions/nodecommand.config
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    NPM_CONFIG_PRODUCTION: true
```

### 🔄 **CI/CD Pipeline**

#### **GitHub Actions**

```yaml
# .github/workflows/deploy.yml
name: Deploy Auth Service

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Docker image
        run: |
          docker build -t ${{ secrets.ECR_REPO }}:latest .
          docker push ${{ secrets.ECR_REPO }}:latest
```

### 📊 **Monitoring em Produção**

#### **Health Check Configuration**

```yaml
# docker-compose.prod.yml
services:
  auth-service:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3333/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### **Load Balancer Configuration**

```yaml
# ALB Target Group Health Check
health_check:
  enabled: true
  healthy_threshold: 2
  interval: 30
  matcher: "200"
  path: "/health"
  port: "traffic-port"
  protocol: "HTTP"
  timeout: 5
  unhealthy_threshold: 2
```

### 🔐 **Segurança em Produção**

#### **Environment Variables**

```bash
# Nunca commitar secrets!
# Use AWS Systems Manager Parameter Store
AWS_COGNITO_CLIENT_SECRET=ssm:/auth-service/cognito/client-secret
DATABASE_URL=ssm:/auth-service/database/url
AMAZON_MQ_PASSWORD=ssm:/auth-service/mq/password
```

#### **Network Security**

```yaml
# VPC Security Groups
SecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Auth Service Security Group
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 3333
        ToPort: 3333
        SourceSecurityGroupId: !Ref LoadBalancerSecurityGroup
```

---

## 🤝 Contribuição

### 🛠️ **Setup para Desenvolvimento**

```bash
# 1. Fork e clone o repositório
git clone <your-fork-url>
cd auth-service

# 2. Instale dependências
yarn install

# 3. Configure ambiente local
cp .env.example .env.local

# 4. Inicie infraestrutura
docker compose up -d

# 5. Execute migrações
npx prisma migrate dev

# 6. Inicie em modo desenvolvimento
yarn dev
```

### 📝 **Padrões de Código**

#### **Commit Convention**

```bash
# Formato: <tipo>(<escopo>): <descrição>
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(health): correct queue status check"
git commit -m "docs(readme): update API documentation"
git commit -m "test(auth): add unit tests for login"
```

**Tipos de commit:**

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de build/config

#### **Branch Strategy**

```bash
# Feature branches
git checkout -b feature/password-reset
git checkout -b fix/health-check-bug
git checkout -b docs/api-documentation

# Naming convention:
# feature/<feature-name>
# fix/<bug-description>
# docs/<documentation-type>
# test/<test-description>
```

### 🔨 **Build Obrigatório**

Antes de abrir um Pull Request:

```bash
# Build do projeto
npm run build
```

### 📋 **Pull Request Template**

```markdown
## 🎯 Descrição

Breve descrição das mudanças realizadas.

## 🔧 Tipo de Mudança

- [ ] 🐛 Bug fix
- [ ] ✨ Nova funcionalidade
- [ ] 💥 Breaking change
- [ ] 📚 Documentação

## ✅ Checklist

- [ ] Build passando sem erros
- [ ] Documentação atualizada
- [ ] Commit messages seguem convenção
- [ ] Código segue padrões do projeto

## 🧪 Como Testar

Instruções para testar as mudanças.

## 📸 Screenshots (se aplicável)

Capturas de tela das mudanças visuais.
```

### 🔍 **Code Review Guidelines**

#### **Para Revisores:**

- ✅ Validar padrões de código
- ✅ Checar documentação
- ✅ Verificar localmente
- ✅ Verificar segurança

#### **Para Contribuidores:**

- ✅ Código auto-explicativo
- ✅ Documentação atualizada
- ✅ Changelog atualizado
- ✅ Performance considerada

### 🐛 **Reportar Issues**

```markdown
## 🐛 Bug Report

**Descrição do Bug**
Descrição clara do problema.

**Reprodução**
Passos para reproduzir:

1. Vá para '...'
2. Clique em '....'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Capturas de tela se aplicável.

**Ambiente:**

- OS: [ex. macOS, Linux]
- Node.js: [ex. 19.0.0]
- Docker: [ex. 20.10.0]
```

### 💡 **Feature Requests**

```markdown
## 💡 Feature Request

**Problema Relacionado**
Descreva o problema atual.

**Solução Proposta**
Descrição da funcionalidade desejada.

**Alternativas Consideradas**
Outras soluções avaliadas.

**Contexto Adicional**
Qualquer informação extra relevante.
```

---

## 📄 Licença

Este projeto está licenciado sob a **ISC License**.

```
Copyright (c) 2025 Joneivison

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 👨‍💻 Autor

**Joneivison Santos**

- 🌐 GitHub: [@joneivison13](https://github.com/joneivison13)
- 💼 LinkedIn: [Joneivison Oliveira](https://www.linkedin.com/in/dev-joneivison-oliveira/)

---

## 🙏 Agradecimentos

- **AWS Cognito Team** - Pelo excelente serviço de autenticação
- **Prisma Team** - Pela ferramenta ORM fantástica
- **Express.js Community** - Pelo framework confiável
- **Jest Community** - Pela framework de testes robusta
- **TypeScript Team** - Pela tipagem que salva vidas

---

## 📊 Status do Projeto

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Quality Gate](https://img.shields.io/badge/quality%20gate-passed-brightgreen)
![Code Quality](https://img.shields.io/badge/sonarqube-enabled-orange)
![License](https://img.shields.io/badge/license-ISC-blue)
![Node.js](https://img.shields.io/badge/node-%3E%3D19.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.2%2B-blue)

**🎉 Projeto em produção e mantido ativamente!**

---

<div align="center">
  <p><strong>Feito com ❤️ por <a href="https://github.com/joneivison13">Joneivison</a></strong></p>
  <p>⭐ Deixe uma estrela se este projeto te ajudou!</p>
</div>
