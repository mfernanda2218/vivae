# Vivae

Vivae é uma plataforma de eventos com catálogo público, checkout simulado, emissão de ingressos com QR Code, portaria para validação/cancelamento e dashboard operacional para organizadores.

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

- Catálogo de eventos com busca, categorias e filtros por cidade, data e preço.
- Dashboard do organizador com eventos, ingressos, estoque, cancelamentos e check-ins.
- Checkout com reserva transacional de estoque, pagamento aprovado/recusado e emissão de ingressos.
- Meus ingressos com QR Code, link público e cancelamento de reserva com devolução de estoque.
- Portaria com validação manual, leitura de QR quando suportada pelo navegador e cancelamento de ingresso.
- Estados de loading, empty, error, toasts, animações discretas e microinterações.
- Tratamento global de erros, DTOs, validações, logs e headers básicos de segurança no backend.

## Requisitos

- Node.js 20+
- npm
- PostgreSQL

## Variáveis de ambiente

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
- `users`: listagem operacional, perfil atual, detalhe, atualização e remoção protegida.
- `events`: CRUD de eventos, publicação, cancelamento e filtros.
- `reservations`: reserva de ingressos com baixa de estoque e cancelamento com devolução.
- `payments`: pagamento simulado, emissão de tickets e devolução de estoque em recusa/expiração.
- `tickets`: listagem de ingressos, detalhe, compartilhamento e página pública por token.
- `gate`: validação/cancelamento de ingresso e dashboard operacional.
- `catalog`: busca externa via Ticketmaster quando configurada.

### Autenticação e Autorização

- JWT tokens são gerados no login/registro e devem ser enviados no header `Authorization: Bearer <token>`
- Guards JWT aplicados em todas as rotas protegidas
- Role-based access control (RBAC) para CUSTOMER, ORGANIZER, GATE, ADMIN

### Estoque e cancelamento

- Criar reserva decrementa `availableTickets` dentro de transação.
- Pagamento recusado ou reserva expirada devolve estoque.
- Cancelar reserva cancela tickets ativos, recusa pagamento pendente e devolve ao estoque os ingressos elegíveis.
- Cancelar ingresso na portaria devolve uma unidade ao estoque e encerra a reserva se todos os tickets ficarem fechados.
- Eventos esgotados voltam para `PUBLISHED` quando estoque é devolvido.

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
- `POST /reservations/tickets/:ticketId/cancel`
- `POST /payments/:reservationId`
- `GET /tickets`
- `GET /tickets/:id`
- `GET /tickets/public/:token`
- `GET /tickets/:id/share`
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
- `/ingresso/[token]`: ingresso público compartilhável.
- `/portaria`: validação e cancelamento de ingressos.
- `/dashboard`: métricas do organizador.

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

Os testes unitários de `users` cobrem as funções principais do service e a delegação do controller: listar, perfil atual, buscar por id, atualizar e remover.

## Observações de segurança

- Senhas são armazenadas com bcrypt.
- Respostas de usuário não retornam `passwordHash`.
- DTOs usam whitelist global e bloqueiam campos extras.
- Filtro global normaliza erros HTTP e erros Prisma conhecidos.
- Headers de segurança básicos são aplicados no bootstrap.
- Guards JWT e Roles aplicados em todas as rotas protegidas.
- QR Codes com assinatura criptográfica HMAC-SHA256 para prevenção de falsificação.
- Timing-safe comparison para verificação de assinaturas de QR Code.

