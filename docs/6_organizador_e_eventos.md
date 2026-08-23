## 6. Organizador e Eventos

### 6.1 Associação de Eventos ao Organizador

**Decisão:** Cada evento pertence a um organizador específico (`organizerId`).

**Por que:**
- **Isolamento:** Organizadores só veem e gerenciam seus próprios eventos.
- **Controle:** O organizador pode criar, editar, publicar e cancelar apenas seus eventos.
- **Segurança:** Impede que um organizador acesse eventos de outro.

**Implementação:**
- O campo `organizerId` é obrigatório no modelo `Event`.
- O backend filtra eventos por `organizerId` quando o header `x-organizer-id` está presente.
- O frontend envia `x-organizer-id` em todas as requisições quando o usuário é organizador.

### 6.2 Criação de Portaria pelo Organizador

**Decisão:** O organizador pode criar usuários de portaria.

**Por que:**
- **Controle:** O organizador decide quem opera a portaria.
- **Flexibilidade:** O organizador pode associar a portaria a eventos específicos.
- **Realismo:** Espelha o fluxo real de contratação de staff para eventos.

**Implementação:**
- Endpoint `POST /users/gate` cria um usuário com role `GATE`.
- O organizador informa nome, email, senha e eventos autorizados.
- A portaria é associada ao organizador via `createdById`.
