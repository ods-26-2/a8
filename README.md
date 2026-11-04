# a8 · ParkFlow

Controle de acesso de veículos para **empresas e condomínios**. Empresas cadastram seus usuários, veículos e veículos convidados (com o período em que a entrada é permitida); usuários consultam e gerenciam os próprios veículos nas empresas em que estão vinculados.

O componente é composto por um **app (web/mobile)**, uma **API** e um **banco de dados**, cada um em um container Docker. 

## Tecnologias

| Parte | Tecnologia |
|---|---|
| Frontend | Expo / React Native (Expo Router, TypeScript) |
| Backend | Node.js 22, Express 5, JWT |
| Banco de dados | MySQL 8.4 |
| Execução | Docker e Docker Compose |

## Estrutura do repositório

```
a8/
├── backend/              API (Node.js)
│   ├── server.js
│   └── src/              routes, controllers, models, middlewares, config
├── frontend/             App (Expo)
│   └── src/              app (rotas), view, controllers, models, services, components, contexts
├── docs/                 documentação aprofundada (ver docs/docker.md)
├── database.sql          criação das tabelas
└── docker-compose.yml
```

O frontend segue o padrão **model → service → controller (hook) → view**, e cada rota em `src/app/` apenas reexporta uma view.

## Execução rápida

**Pré-requisito:** Docker Engine ou Docker Desktop instalado e rodando.

**1. Crie o arquivo `backend/.env`** (ele não vai para o repositório, cada pessoa cria o seu):

```env
PORT=3000

DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=a8

JWT_SECRET=troque-este-segredo
JWT_EXPIRES_IN=7d
```

**2. Suba os containers** (na raiz do projeto):

```bash
docker compose up --build -d
```

**3. Na primeira vez, carregue as tabelas no banco.**

PowerShell (Windows):
```powershell
Get-Content database.sql | docker exec -i a8-mysql mysql -uroot -proot
```

Bash / CMD:
```bash
docker exec -i a8-mysql mysql -uroot -proot < database.sql
```

**4. Confira:**

| O quê | Endereço | Esperado |
|---|---|---|
| API | http://localhost:3000/api/health | `{"api":"ok","database":"ok"}` |
| App (web) | http://localhost:8081 | tela de acesso |

Para parar: `docker compose down` (mantém os dados). Mais comandos e solução de problemas em [`docs/docker.md`](docs/docker.md).

## Uso por outras equipes

Este componente roda inteiro em containers; não é preciso instalar Node nem MySQL.

| Serviço | Container | Porta | Para que serve |
|---|---|---|---|
| `backend` | `a8-backend` | 3000 | API HTTP (JSON) |
| `frontend` | `a8-frontend` | 8081 | App web |
| `mysql` | `a8-mysql` | interna (3306) | Banco de dados |

Para quem só precisa consumir a API: siga a **Execução rápida** acima e use `http://localhost:3000`. A autenticação é por JWT, enviado no cabeçalho `Authorization: Bearer <token>`.

Principais rotas:

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | estado da API e do banco |
| POST | `/api/login` | login de empresa ou usuário (devolve o token) |
| POST | `/api/empresas` | cadastro de empresa/condomínio |
| GET | `/api/usuarios/empresas` | empresas e condomínios do usuário logado |
| POST | `/api/usuarios/entrar-empresa` | escolhe uma empresa (token com empresa e função) |
| POST | `/api/usuarios` | cadastro de usuário (empresa ou adm) |
| GET, POST, DELETE | `/api/veiculos/...` | veículos do usuário e veículos vinculados a uma empresa |
| POST | `/api/veiculos-convidados` | cadastro de veículo convidado |

## Perfis de acesso

| Perfil | Como entra | O que acessa |
|---|---|---|
| **Empresa / condomínio** | login da empresa | tudo da própria empresa |
| **Usuário adm** | login de usuário + escolhe a empresa | cadastra usuários, veículos e convidados da empresa |
| **Usuário comum** | login de usuário + escolhe a empresa | cadastra convidados e, se a empresa permitir, os próprios veículos |

## Convenções do repositório

- `main` é a branch estável; o desenvolvimento acontece em outras branches e entra na `main` por Pull Request.
- Credenciais e dependências não vão para o repositório (`.gitignore`): `backend/.env` e `node_modules/` ficam de fora.
- Detalhes de arquitetura e de execução ficam em `docs/`.

## Documentação

- [`docs/docker.md`](docs/docker.md): containers, comandos do dia a dia, banco de dados e solução de problemas.
