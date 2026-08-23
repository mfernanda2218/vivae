# Vivae

Vivae e uma plataforma de eventos com catalogo publico, checkout simulado, emissao de ingressos com QR Code, portaria para validacao/cancelamento e dashboard operacional para organizadores.

## Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, lucide-react.
- Backend: NestJS 11, Prisma, PostgreSQL, Swagger, class-validator.
- Testes: Jest no backend.

## Estrutura

```txt
vivae/
  backend/   API NestJS, Prisma, regras de negocio e testes
  frontend/  Aplicacao Next.js, paginas e componentes visuais
```

## Funcionalidades

- Catalogo de eventos com busca, categorias e filtros por cidade, data e preco.
- Dashboard do organizador com eventos, ingressos, estoque, cancelamentos e check-ins.
- Checkout com reserva transacional de estoque, pagamento aprovado/recusado e emissao de ingressos.
- Meus ingressos com QR Code, link publico e cancelamento de reserva com devolucao de estoque.
- Portaria com validacao manual, leitura de QR quando suportada pelo navegador e cancelamento de ingresso.
- Estados de loading, empty, error, toasts, animacoes discretas e microinteracoes.
- Tratamento global de erros, DTOs, validacoes, logs e headers basicos de seguranca no backend.

## Requisitos

- Node.js 20+
- npm
- PostgreSQL

## Variaveis de ambiente

Backend (`backend/.env`):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vivae"
DIRECT_URL="postgresql://user:password@localhost:5432/vivae"
JWT_SECRET="troque-em-producao"
FRONTEND_URL="http://localhost:3001"
PORT=3000
```

Frontend (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Instalar e rodar

Backend:

```bash
cd backend
npm install
npm run build
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

URLs locais:

- Frontend: `http://localhost:3001` quando iniciado com `next dev -p 3001`.
- Backend: `http://localhost:3000`.
- Swagger: `http://localhost:3000/api/docs`.

## Dados demo

O seed cria:

- Organizador: `organizer@vivae.com`
- Clientes: `cliente1@vivae.com`, `cliente2@vivae.com`
- Portaria: `portaria@vivae.com`
- Senha demo: `password123`

## Backend

Modulos principais:

- `auth`: registro, login e JWT.
- `users`: listagem operacional, perfil atual, detalhe, atualizacao e remocao protegida.
- `events`: CRUD de eventos, publicacao, cancelamento e filtros.
- `reservations`: reserva de ingressos com baixa de estoque e cancelamento com devolucao.
- `payments`: pagamento simulado, emissao de tickets e devolucao de estoque em recusa/expiracao.
- `tickets`: listagem de ingressos, detalhe, compartilhamento e pagina publica por token.
- `gate`: validacao/cancelamento de ingresso e dashboard operacional.
- `catalog`: busca externa via Ticketmaster quando configurada.

### Headers operacionais

Enquanto nao ha guard JWT aplicado nas rotas, a API usa headers explicitos para simular contexto:

- `x-user-id`: cliente, portaria, organizador ou admin nas rotas de usuario/reserva/ticket/gate.
- `x-organizer-id`: organizador dono do evento nas rotas administrativas de eventos.

### Estoque e cancelamento

- Criar reserva decrementa `availableTickets` dentro de transacao.
- Pagamento recusado ou reserva expirada devolve estoque.
- Cancelar reserva cancela tickets ativos, recusa pagamento pendente e devolve ao estoque os ingressos elegiveis.
- Cancelar ingresso na portaria devolve uma unidade ao estoque e encerra a reserva se todos os tickets ficarem fechados.
- Eventos esgotados voltam para `PUBLISHED` quando estoque e devolvido.

## Endpoints principais

- `POST /auth/register`
- `POST /auth/login`
- `GET /users`
- `GET /users/me`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `GET /events`
- `GET /events/:id`
- `POST /events`
- `PATCH /events/:id`
- `DELETE /events/:id`
- `POST /events/:id/publish`
- `POST /events/:id/cancel`
- `POST /reservations`
- `GET /reservations`
- `GET /reservations/:id`
- `POST /reservations/:id/cancel`
- `POST /payments/:reservationId`
- `GET /tickets`
- `GET /tickets/:id`
- `GET /tickets/public/:token`
- `POST /tickets/:id/share`
- `POST /gate/validate`
- `POST /gate/cancel`
- `GET /gate/dashboard`

## Frontend

Paginas principais:

- `/`: home com hero, categorias e eventos.
- `/eventos`: busca e filtros.
- `/eventos/[id]`: detalhe e compra.
- `/checkout`: fluxo de reserva/pagamento.
- `/checkout/sucesso` e `/checkout/erro`: resultado do pagamento.
- `/meus-ingressos`: ingressos emitidos, QR Code, compartilhamento e cancelamento.
- `/ingresso/[token]`: ingresso publico compartilhavel.
- `/portaria`: validacao e cancelamento de ingressos.
- `/dashboard`: metricas do organizador.

Componentes compartilhados:

- `EmptyState`, `ErrorState`, `LoadingState`.
- `ToastProvider`.
- `Header`, `Footer`, `SearchBar`, `Filters`, `EventsGrid`, `EventCard`.

## Testes e qualidade

Backend:

```bash
cd backend
npm test
npm run build
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Os testes unitarios de `users` cobrem as funcoes principais do service e a delegacao do controller: listar, perfil atual, buscar por id, atualizar e remover.

## Observacoes de seguranca

- Senhas sao armazenadas com bcrypt.
- Respostas de usuario nao retornam `passwordHash`.
- DTOs usam whitelist global e bloqueiam campos extras.
- Filtro global normaliza erros HTTP e erros Prisma conhecidos.
- Headers de seguranca basicos sao aplicados no bootstrap.
- Em producao, substitua os headers simulados por guards JWT/roles em todas as rotas protegidas.

