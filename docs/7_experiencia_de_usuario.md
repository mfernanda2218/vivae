## 7. Experiência do Usuário (UI/UX)

### 7.1 Tema Dark com Accent Verde

**Decisão:** Usar tema dark com accent verde (`#A3E635`) para toda a aplicação.

**Por que:**
- **Identidade visual:** O verde neon cria uma identidade única e moderna.
- **Contraste:** O tema dark com texto branco oferece boa legibilidade.
- **Consistência:** Todas as telas seguem o mesmo design system (`globals.css`).

### 7.2 Componentes Reutilizáveis

**Decisão:** Criar componentes reutilizáveis (`EmptyState`, `ErrorState`, `LoadingState`, `RoleGuard`, `ToastProvider`).

**Por que:**
- **Consistência:** Todos os estados vazios, erros e carregamentos seguem o mesmo padrão visual.
- **Manutenção:** Mudanças em um componente refletem em todas as páginas.
- **Testabilidade:** Componentes isolados são mais fáceis de testar.

### 7.3 Feedback Visual com Toasts

**Decisão:** Usar toasts para feedback de ações (login, compra, cancelamento, etc.).

**Por que:**
- **Feedback imediato:** O usuário vê confirmação ou erro sem precisar navegar.
- **Não intrusivo:** Os toasts aparecem no canto da tela sem bloquear o conteúdo.
- **Consistência:** Todas as ações importantes têm feedback visual.
