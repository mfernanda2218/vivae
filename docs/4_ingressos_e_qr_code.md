## 4. Ingressos e QR Code

### 4.1 Geração de QR Code Seguro

**Decisão:** Gerar QR Code com token aleatório (`qrToken`) e hash SHA-256 (`qrTokenHash`).

**Por que:**
- **Segurança:** O QR Code contém um token aleatório que não pode ser forjado.
- **Verificação:** O hash SHA-256 é armazenado no banco para verificação, garantindo que o token não foi alterado.
- **Compartilhamento:** O link gerado (`/ingresso/{qrToken}`) pode ser compartilhado e validado pela portaria.

**Implementação:**
- `qrToken` é um UUID aleatório (`randomBytes(32).toString('hex')`).
- `qrTokenHash` é o hash SHA-256 do token (`createHash('sha256').update(token).digest('hex')`).
- O QR Code é gerado com `qrcode` e exibido na área "Meus ingressos".

### 4.2 Download do Ingresso (Salvar)

**Decisão:** Substituir o botão "Compartilhar" por "Salvar", que permite baixar a imagem do ingresso com QR Code.

**Por que:**
- **Uso prático:** O usuário pode salvar o ingresso no celular para apresentar na entrada.
- **Experiência:** Baixar uma imagem é mais útil do que apenas compartilhar um link.
- **Simplicidade:** O download é feito via canvas no cliente, sem necessidade de backend.

**Implementação:**
- O botão "Salvar" gera um canvas com as informações do evento e o QR Code.
- O canvas é convertido em PNG e baixado pelo navegador.
- O arquivo é nomeado como `ingresso-{codigo}.png`.
