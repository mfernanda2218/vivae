## 5. Portaria

### 5.1 Validação com Câmera (QR Scanner)

**Decisão:** Implementar leitura de QR Code pela câmera usando a API `BarcodeDetector` do navegador.

**Por que:**
- **Padrão emergente:** A API `BarcodeDetector` é suportada em navegadores modernos (Chrome, Edge).
- **Simplicidade:** Usar a API nativa do navegador evita dependências de bibliotecas de terceiros.
- **Fallback:** A digitação manual está disponível como alternativa.

**Implementação:**
- O componente `GateClient` usa `BarcodeDetector` para ler QR Codes da câmera.
- Se o `BarcodeDetector` não estiver disponível, o usuário pode digitar o código manualmente.
- O resultado da validação é exibido com feedback visual claro (válido, inválido, já utilizado, etc.).

### 5.2 Verificação de Permissão da Portaria

**Decisão:** A portaria só pode validar ingressos de eventos do organizador que a criou.

**Por que:**
- **Segurança:** Impede que uma portaria valide ingressos de eventos de outro organizador.
- **Controle:** O organizador define quais eventos a portaria pode acessar.
- **Isolamento:** Cada portaria é vinculada ao organizador que a criou via `createdById`.

**Implementação:**
- `verifyGateAccess` verifica se o usuário é GATE e se tem permissão para o evento.
- Se a portaria não tem eventos associados, ela pode validar todos os eventos do organizador que a criou.
- Se a portaria tem eventos associados, ela só pode validar esses eventos.
