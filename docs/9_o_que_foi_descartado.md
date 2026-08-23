## 9. O que foi descartado

### 9.1 Mapa de Assentos

**Decisão:** Não implementar mapa de assentos (cinema/teatro).

**Por que:**
- **Complexidade:** Mapa de assentos exigiria gerenciamento de assentos individuais e conflitos de reserva.
- **Escopo:** O desafio permite escolher entre mapa de assentos ou quantidade (pista).
- **Tempo:** Priorizamos o fluxo completo de compra por quantidade.

### 9.2 Docker Compose

**Decisão:** Não usar Docker Compose.

**Por que:**
- **Hospedagem:** O projeto usa Supabase (banco) e Render (backend), ambos gerenciados.
- **Simplicidade:** Docker Compose adicionaria complexidade sem benefício imediato para este escopo.

### 9.3 Recuperação de Senha

**Decisão:** Não implementar recuperação de senha.

**Por que:**
- **Fora do escopo:** O desafio explicitamente diz "Não precisa fazer: recuperação de senha".
- **Tempo:** Priorizamos funcionalidades core do fluxo.