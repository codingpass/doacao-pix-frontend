# Checkout de Doacao via PIX (Frontend Next.js)

Interface mobile-first em Next.js (App Router) + Tailwind CSS para checkout de doacao via PIX.

---

## 🚀 Como Executar Localmente

### 1. Pre-requisitos
Certifique-se de que a API backend Spring Boot esta rodando em `http://localhost:8080`:
```bash
cd pix-donation-api
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

---

### 2. Configurar Variavel de Ambiente
Crie ou edite o arquivo `.env.local` na raiz do projeto com o endereco da API backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

### 3. Instalar Dependencias e Iniciar o Servidor Dev

```bash
npm install
npm run dev
```

Acesse no navegador: **http://localhost:3000** (ou **http://localhost:3000/donate**)

---

## 🧪 Fluxo de Teste da Doacao

1. Escolha um valor rapido (R$ 15, R$ 30, R$ 50, R$ 100) ou digite um valor personalizado.
2. Clique em **Gerar PIX**.
3. O sistema exibe o QR Code, a chave Copia e Cola e o timer de 30 minutos.
4. O frontend consulta o backend a cada 3 segundos (`GET /api/donations/{id}`).
5. Para simular a confirmacao do pagamento no backend:
   ```bash
   curl -X POST http://localhost:8080/api/dev/donations/{ID_DA_DOACAO}/simulate-paid
   ```
6. O frontend detecta a mudanca e exibe instantaneamente a tela de **"Obrigado pela doacao!"**.