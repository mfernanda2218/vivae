## 3. Fluxo de Compra

### 3.1 Rota de Compra: `/eventos/[id]/comprar`

**Decisão:** Usar uma rota aninhada (`/eventos/[id]/comprar`) em vez de uma rota separada (`/checkout?eventId=...`).

**Por que:**
- **URL mais limpa:** `/eventos/123/comprar` é mais intuitiva e fácil de compartilhar.
- **SEO:** O URL inclui o ID do evento, o que melhora a indexação.
- **Contexto:** A rota aninhada mantém o contexto do evento no URL, facilitando o rastreamento.

**Implementação:**
- O link "Comprar ingresso" leva para `/eventos/${event.id}/comprar`.
- A página de compra exibe o `CheckoutClient` com as informações do evento.
- Após o pagamento, o usuário é redirecionado para `/eventos/${event.id}/comprar/sucesso` ou `/eventos/${event.id}/comprar/erro`.

### 3.2 Seleção de Quantidade (Pista)

**Decisão:** Implementar seleção de quantidade de ingressos (pista) em vez de mapa de assentos.

**Por que:**
- **Simplicidade:** A seleção por quantidade é mais simples de implementar e atende ao requisito do desafio.
- **Uso comum:** Eventos de música e festivais geralmente usam pista (sem assentos definidos).
- **Escalabilidade:** O mapa de assentos exigiria gerenciamento de assentos individuais, o que é mais complexo e não é necessário para todos os eventos.

**Implementação:**
- O usuário seleciona a quantidade de ingressos (1 a 10).
- O estoque é decrementado automaticamente após a reserva.
- O total é calculado com base na quantidade × preço.

### 3.3 Pagamento Simulado com Confirmação e Recusa

**Decisão:** Implementar pagamento simulado com dois botões: "Pagar agora" (aprova) e "Simular recusa".

**Por que:**
- **Demonstração:** O desafio pede explicitamente para contemplar confirmação e recusa.
- **Teste:** Os dois botões permitem testar ambos os fluxos facilmente.
- **Feedback:** O usuário vê claramente o resultado do pagamento (aprovado ou recusado).

**Implementação:**
- O botão "Pagar agora" envia `outcome: 'APPROVED'`.
- O botão "Simular recusa" envia `outcome: 'DECLINED'`.
- Após o pagamento, o backend devolve o estoque se recusado e gera ingressos com QR Code se aprovado.

---