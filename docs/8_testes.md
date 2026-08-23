## 8. Testes

### 8.1 Testes de Rotas com Vitest + Testing Library

**Decisão:** Criar testes de rotas com Vitest e Testing Library.

**Por que:**
- **Cobertura:** Testar os fluxos de navegação garante que as rotas estejam funcionando corretamente.
- **Confiança:** Os testes verificam que o `RoleGuard` protege as rotas corretamente.
- **Regressão:** Mudanças futuras no código não quebram os fluxos existentes.

**Implementação:**
- Testes para cliente: verificar que pode acessar `/eventos`, `/meus-ingressos`, `/checkout`.
- Testes para organizador: verificar que pode acessar `/dashboard`, `/eventos`, `/portaria`.
- Testes de bloqueio: verificar que cliente não pode acessar `/dashboard` e organizador não pode acessar `/meus-ingressos`.