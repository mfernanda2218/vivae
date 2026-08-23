## 1. Arquitetura Geral

### 1.1 Frontend: Next.js 16 com App Router

**Decisão:** Usar Next.js com App Router em vez de Vite ou CRA.

**Por que:**
- **SSR/SSG nativo:** O App Router permite renderização no servidor por página, o que é essencial para SEO e performance em páginas de eventos (que precisam ser indexadas).
- **File-based routing:** A estrutura de pastas (`app/eventos/[id]/page.tsx`) torna o código mais organizado e escalável.
- **Middleware:** O App Router suporta middleware nativo para proteção de rotas, algo que seria mais complexo em Vite.
- **Integração com Next.js:** O ecossistema Next.js oferece ferramentas como `next/navigation`, `next/link` e `next/image` que simplificam o desenvolvimento.

### 1.2 Backend: NestJS com Prisma ORM

**Decisão:** Usar NestJS com Prisma ORM em vez de Express simples ou Fastify.

**Por que:**
- **Estrutura modular:** O NestJS organiza o código em módulos (`UsersModule`, `EventsModule`, `GateModule`, etc.), o que facilita a manutenção e escalabilidade.
- **Injeção de dependência:** O NestJS usa DI nativamente, o que torna o código mais testável e desacoplado.
- **Prisma ORM:** O Prisma oferece type-safety e migrations declarativas, o que reduz erros de banco de dados e simplifica a evolução do schema.
- **Validação com class-validator:** O NestJS integra facilmente `class-validator` e `class-transformer` para validar DTOs.

### 1.3 Banco de Dados: PostgreSQL (Supabase)

**Decisão:** Usar PostgreSQL hospedado no Supabase.

**Por que:**
- **PostgreSQL:** Banco relacional robusto, ideal para dados com relacionamentos complexos (usuários, eventos, reservas, pagamentos, ingressos).
- **Supabase:** Oferece hospedagem gratuita, backups automáticos e uma interface de administração (Studio) fácil de usar.
- **Realtime (opcional):** O Supabase oferece recursos de tempo real que podem ser usados no futuro para atualizar mapas de assentos em tempo real.
