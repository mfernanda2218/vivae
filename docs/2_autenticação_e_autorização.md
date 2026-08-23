## 2. Autenticação e Autorização

### 2.1 Três Papéis Distintos (Organizador, Cliente, Portaria)

**Decisão:** Implementar três papéis distintos, mas com uma nuance: **a portaria é um usuário criado pelo organizador**, não um papel público.

**Por que:**
- **Realismo:** No mundo real, a portaria de um evento é composta por funcionários do organizador, não por usuários independentes.
- **Controle:** O organizador precisa ter controle sobre quem opera a portaria de seus eventos.
- **Segurança:** Ao criar a portaria, o organizador pode limitar quais eventos o usuário de portaria pode validar.

**Implementação:**
- O organizador cria usuários de portaria via endpoint `POST /users/gate`.
- O usuário de portaria tem acesso apenas à tela de validação (`/portaria`).
- O organizador pode associar a portaria a eventos específicos ou a todos os seus eventos.

### 2.2 Autenticação via JWT (Headers)

**Decisão:** Usar autenticação via JWT no header `x-user-id` em vez de cookies de sessão.

**Por que:**
- **Simplicidade:** O header `x-user-id` é fácil de implementar e depurar.
- **Compatibilidade:** Funciona bem com Next.js (que pode fazer requisições de servidor e cliente).
- **Flexibilidade:** O JWT pode ser usado em múltiplos serviços sem compartilhar sessões.

**Implementação:**
- O login retorna `{ accessToken, user }`.
- O frontend salva o token e o usuário no `localStorage`.
- As requisições API enviam `x-user-id` (e `x-organizer-id` quando aplicável).
- O middleware do Next.js verifica a presença do token para proteger rotas.

### 2.3 Middleware vs. RoleGuard

**Decisão:** Usar **RoleGuard no cliente** em vez de middleware global no servidor.

**Por que:**
- **Complexidade:** O middleware do Next.js tem limitações para verificar o estado de autenticação no cliente (localStorage).
- **Responsabilidade:** A proteção de rotas é melhor tratada no componente cliente (`RoleGuard`) porque precisa acessar o `localStorage`.
- **Flexibilidade:** O `RoleGuard` pode ser usado para proteger páginas individuais, sem afetar rotas públicas.

**Implementação:**
- `RoleGuard` é um componente cliente que verifica o `localStorage` e redireciona se o usuário não tiver permissão.
- Rotas públicas (`/`, `/eventos`, `/login`, `/cadastro`) não usam `RoleGuard`.
- Rotas protegidas (`/meus-ingressos`, `/dashboard`, `/portaria`, `/checkout`) usam `RoleGuard` com `allowedRoles`.
