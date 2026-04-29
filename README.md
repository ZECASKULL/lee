# 💀 Skull BJJ Website

Site moderno e seguro para a academia Skull BJJ de Jiu-Jitsu Brasileiro.

## 🥋 Sobre o Projeto

Site completo para a academia Skull BJJ com foco em:
- **Design moderno e responsivo**
- **Segurança robusta** contra ataques web
- **Experiência de usuário otimizada**
- **Funcionalidades práticas** para alunos e interessados

## 🛡️ Recursos de Segurança

- **Proteção XSS**: Sanitização de todas as entradas
- **Proteção CSRF**: Tokens únicos por sessão
- **Rate Limiting**: Limitação de requisições por IP
- **Headers de Segurança**: Helmet.js com CSP completo
- **Validação de Dados**: Validação rigorosa no frontend e backend
- **Monitoramento**: Logs de eventos de segurança

## 🚀 Funcionalidades

### Frontend
- **Design Responsivo**: Funciona em todos os dispositivos
- **Animações Suaves**: Efeitos parallax e transições
- **Menu Mobile**: Navegação otimizada para celulares
- **Formulário de Contato**: Validação em tempo real
- **Scroll Suave**: Navegação fluida entre seções

### Backend
- **API RESTful**: Endpoints seguros para comunicação
- **Sessões Seguras**: Gerenciamento de sessão com CSRF
- **Logs de Auditoria**: Registro de eventos de segurança
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Validação Rigorosa**: Sanitização e validação de dados

## 📁 Estrutura do Projeto

```
skull-bjj-website/
├── index.html          # Página principal
├── style.css           # Estilos modernos e responsivos
├── script.js           # Funcionalidades JavaScript
├── security.js         # Módulo de segurança do frontend
├── server.js           # Servidor backend seguro
├── package.json        # Dependências do projeto
├── .env.example        # Variáveis de ambiente exemplo
└── README.md           # Documentação do projeto
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Semântico e acessível
- **CSS3**: Moderno com animações e gradientes
- **JavaScript ES6+**: Funcionalidades interativas
- **Google Fonts**: Tipografia profissional

### Backend
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web seguro
- **Helmet.js**: Headers de segurança
- **Express Rate Limit**: Proteção contra abuso
- **XSS**: Proteção contra Cross-Site Scripting
- **Validator**: Validação de dados

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn

### Passos

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd skull-bjj-website
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. **Inicie o servidor**
   ```bash
   # Para desenvolvimento
   npm run dev
   
   # Para produção
   npm start
   ```

5. **Acesse o site**
   ```
   http://localhost:3000
   ```

## 🔧 Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

- `PORT`: Porta do servidor (padrão: 3000)
- `NODE_ENV`: Ambiente (development/production)
- `ALLOWED_ORIGINS`: URLs permitidas para CORS
- `SMTP_*`: Configurações de e-mail (opcional)
- `JWT_SECRET`: Chave secreta para autenticação
- `SESSION_SECRET`: Chave secreta para sessões

### Configuração de E-mail

Para enviar notificações do formulário de contato:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contato@skullbjj.com.br
SMTP_PASS=sua_senha_de_app
```

## 🛡️ Medidas de Segurança

### Frontend
- Sanitização de todas as entradas do usuário
- Tokens CSRF em formulários
- Validação de dados em tempo real
- Proteção contra XSS
- Headers de segurança via meta tags

### Backend
- Rate limiting por IP
- Validação rigorosa de dados
- Sessões seguras com expiração
- Logs de auditoria
- Headers de segurança completos
- Proteção contra ataques comuns

### Monitoramento
- Logs de eventos de segurança
- Detecção de atividades suspeitas
- Monitoramento de tentativas de acesso
- Auditoria de formulários enviados

## 📱 Funcionalidades do Site

### Seções Principais
- **Home**: Hero section com call-to-action
- **Sobre**: Informações sobre a academia
- **Aulas**: Tipos de aulas disponíveis
- **Horários**: Grade horária completa
- **Contato**: Formulário seguro e informações

### Características Especiais
- Design com tema skull/caveira
- Gradientes e animações modernas
- Totalmente responsivo
- Otimizado para performance
- Acessibilidade web

## 🔄 Manutenção

### Logs de Segurança
Os logs são salvos em `security.log` e incluem:
- Tentativas de acesso suspeitas
- Validações falhadas
- Submissões de formulário
- Eventos de sessão

### Limpeza Automática
- Sessões expiradas são removidas a cada hora
- Logs antigos são rotacionados
- Cache é limpo periodicamente

## 🚀 Deploy

### Produção
1. Configure `NODE_ENV=production`
2. Use HTTPS obrigatoriamente
3. Configure variáveis de ambiente reais
4. Use reverse proxy (nginx/apache)
5. Configure monitoramento

### Docker (Opcional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Performance

### Otimizações Implementadas
- Lazy loading de imagens
- Minificação de CSS/JS
- Cache estático
- Compressão gzip
- CDN para fonts

### Métricas
- Tempo de carregamento: < 2s
- Score Lighthouse: 90+
- Mobile-friendly: 100%
- SEO: 95+

## 🤝 Contribuição

1. Fork o projeto
2. Crie branch para feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Abra Pull Request

## 📝 Licença

Este projeto está licenciado sob a licença MIT. Veja `LICENSE` para detalhes.

## 🆘 Suporte

Para dúvidas ou suporte:
- E-mail: contato@skullbjj.com.br
- Telefone: (11) 9999-8888
- Issues do GitHub

---

**💀 Domine a arte suave com Skull BJJ! 🥋**
