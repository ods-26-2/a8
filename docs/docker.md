# Docker

Como rodar o componente **a8** em containers, o que cada serviço faz e como resolver os problemas mais comuns. A versão curta está no [`README.md`](../README.md).

Todos os componentes do projeto rodam em containers Docker puros (sem Dev Containers) para evitar incompatibilidade de bibliotecas e de sistema operacional.

## 1. Visão geral

O `docker-compose.yml` da raiz sobe três serviços na mesma rede interna:

| Serviço | Container | Imagem | Porta no PC | Função |
|---|---|---|---|---|
| `backend` | `a8-backend` | build de `./backend` (Node 22 Alpine) | 3000 | API |
| `frontend` | `a8-frontend` | build de `./frontend` (Node 22 Alpine) | 8081 | App web (Expo) |
| `mysql` | `a8-mysql` | `mysql:8.4` | nenhuma | Banco de dados |

Pontos importantes:

- O `backend` só inicia depois que o `mysql` fica saudável (`healthcheck`).
- Os dados do banco ficam no volume `mysql_data`, então sobrevivem a `docker compose down`.
- Dentro da rede do Docker, os serviços se encontram pelo **nome do serviço**. Por isso o backend acessa o banco em `mysql`, e não em `localhost`.
- O banco **não** é acessível de fora do Docker (porta não publicada). Veja a seção 5 se precisar de um cliente como Workbench.

## 2. Pré-requisitos

- Docker Engine ou Docker Desktop instalado e **rodando** (nos computadores do lab já vem configurado).
- Portas **3000** e **8081** livres no PC.

Confira com:

```bash
docker --version
docker compose version
```

## 3. Primeira execução

**3.1. Crie `backend/.env`.** Ele está no `.gitignore`, então cada pessoa cria o seu:

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

| Variável | Observação |
|---|---|
| `DB_HOST` | tem que ser `mysql` (nome do serviço). Com `localhost` a API não encontra o banco dentro do Docker |
| `DB_NAME` | tem que ser `a8` (nome criado pelo `docker-compose.yml`) |
| `DB_USER` / `DB_PASSWORD` | `root` / `root`, a mesma senha definida em `MYSQL_ROOT_PASSWORD` |
| `JWT_SECRET` | segredo para assinar os tokens; use um valor próprio |

**3.2. Suba os containers:**

```bash
docker compose up --build -d
```

**3.3. Carregue as tabelas.** O MySQL sobe com o banco `a8` **vazio**, e o `database.sql` precisa ser aplicado uma vez.

PowerShell:
```powershell
Get-Content database.sql | docker exec -i a8-mysql mysql -uroot -proot
```

Bash / CMD:
```bash
docker exec -i a8-mysql mysql -uroot -proot < database.sql
```

> No PowerShell não existe o operador `<`: usar a forma com `Get-Content ... |`.
> O aviso `Using a password on the command line interface can be insecure` é só um aviso, não um erro.

**3.4. Confira:**

```bash
docker compose ps
docker exec a8-mysql mysql -uroot -proot a8 -e "SHOW TABLES;"
```

- `docker compose ps`: os três serviços em `running` (o `mysql` como `healthy`).
- `SHOW TABLES`: lista `Empresa`, `Usuario`, `Veiculo`, `Veiculo_Convidado` etc.
- http://localhost:3000/api/health deve responder `{"api":"ok","database":"ok"}`.
- http://localhost:8081 abre o app.

## 4. Comandos do dia a dia

| Para quê | Comando |
|---|---|
| Subir tudo (recriando as imagens) | `docker compose up --build -d` |
| Subir só um serviço | `docker compose up -d --build backend` |
| Ver o estado | `docker compose ps` |
| Ver logs (todos, ao vivo) | `docker compose logs -f` |
| Ver logs do backend | `docker logs a8-backend --tail 50` |
| Reiniciar um serviço | `docker compose restart backend` |
| Recriar após mudar o `.env` | `docker compose up -d --force-recreate backend` |
| Parar (mantém os dados) | `docker compose down` |
| Parar e **apagar o banco** | `docker compose down -v` |
| Terminal dentro do backend | `docker exec -it a8-backend sh` |
| Cliente MySQL | `docker exec -it a8-mysql mysql -uroot -proot a8` |

**As imagens guardam uma cópia do código.** Não há volumes de código no compose, então toda alteração em `backend/` ou `frontend/` só aparece depois de reconstruir:

```bash
docker compose up -d --build
```

Mudar apenas o `backend/.env` não exige `--build`, mas exige recriar o container (`--force-recreate`).

## 5. Banco de dados

**O `database.sql` só roda na criação.** Alterações nele não afetam um banco que já existe. Para aplicar uma mudança de estrutura, há duas saídas:

- **Manter os dados:** rodar o script de migração correspondente (`migracao-*.sql`, na raiz), com o mesmo comando da seção 3.3.
- **Recomeçar do zero (perde os dados de teste):**
  ```bash
  docker compose down -v
  docker compose up --build -d
  ```
  e carregar o `database.sql` de novo (seção 3.3). Se o `database.sql` já traz as mudanças, **não** rode a migração por cima.

**Consultas rápidas:**

```bash
docker exec a8-mysql mysql -uroot -proot a8 -e "SELECT email, Nome FROM Usuario;"
```

**Cliente gráfico (Workbench, DBeaver):** o banco não publica porta. Se precisar, adicione ao serviço `mysql` no `docker-compose.yml`:

```yaml
    ports:
      - "3307:3306"
```
e conecte em `localhost:3307` (usuário `root`, senha `root`). Usamos 3307 para não conflitar com um MySQL instalado no PC.

**Aplicar o `database.sql` automaticamente (opcional):** para dispensar o passo 3.3 em bancos novos, monte o arquivo na pasta de inicialização do MySQL, no serviço `mysql`:

```yaml
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database.sql:/docker-entrypoint-initdb.d/01-database.sql:ro
```
Isso também só vale para bancos criados do zero.

## 6. Frontend no Docker

- O app abre no navegador em http://localhost:8081.
- O endereço da API usado pelo app vem de `EXPO_PUBLIC_API_URL`. Se a variável não existir, o app usa `http://localhost:3000`, que funciona no navegador do mesmo PC.
- O arquivo `frontend/.env.local` **não entra na imagem** (está no `.dockerignore`). Para mudar o endereço da API dentro do Docker, defina a variável no serviço `frontend` do compose:
  ```yaml
      environment:
        EXPO_PUBLIC_API_URL: http://localhost:3000
  ```
- **Celular (Expo Go):** `localhost` no celular é o próprio celular. Use o IP do PC na rede (ex.: `192.168.0.10`) em `EXPO_PUBLIC_API_URL: http://192.168.0.10:3000` e informe também `REACT_NATIVE_PACKAGER_HOSTNAME: 192.168.0.10` para o QR code apontar para o PC. PC e celular precisam estar na mesma rede.

## 7. Solução de problemas

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Login com `Failed to fetch` | o backend caiu ou está reiniciando em loop | `docker logs a8-backend --tail 50` e corrigir o erro mostrado |
| `Cannot find module './src/...'` | arquivo ausente ou com maiúsculas/minúsculas diferentes (o container é Linux e diferencia) | conferir o nome e a pasta do arquivo e rodar `docker compose up -d --build backend` |
| `ECONNREFUSED 127.0.0.1:3306` | `DB_HOST=localhost` no `.env` | trocar para `DB_HOST=mysql` e recriar o backend |
| `Table '...' doesn't exist` ou `Unknown database` | tabelas não carregadas, ou `DB_NAME` diferente de `a8` | seção 3.3 e conferir o `.env` |
| `Erro interno no servidor` | erro dentro da API; a mensagem real só aparece no log | `docker logs a8-backend --tail 50` |
| Mudei o código e nada mudou | a imagem ainda tem a cópia antiga | `docker compose up -d --build` |
| Mudei o `database.sql` e nada mudou | ele só roda na criação do banco | seção 5 |
| `port is already allocated` / porta em uso | outro programa usa a 3000, 8081 ou 3307 | fechar o programa (ex.: um `npm run dev` esquecido) ou trocar a porta à esquerda do `:` no compose |
| `Operador '<' reservado para uso futuro` | `<` não existe no PowerShell | usar `Get-Content arquivo.sql \| docker exec -i ...` |
| Hash com `$` quebrado ao inserir senha pelo PowerShell | o `$` é tratado como variável em strings com aspas duplas | colocar o SQL num arquivo `.sql`, ou usar aspas simples |
| `docker: error during connect` | o Docker Desktop não está rodando | abrir o Docker Desktop e esperar iniciar |

## 8. Referência rápida

```bash
# subir
docker compose up --build -d
# carregar o banco (primeira vez, PowerShell)
Get-Content database.sql | docker exec -i a8-mysql mysql -uroot -proot
# acompanhar
docker compose logs -f
# parar
docker compose down
```
