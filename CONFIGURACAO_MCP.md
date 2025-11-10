# Configuração de Servidores MCP - Med Briefing

## 🎯 O que são Servidores MCP?

O **Model Context Protocol (MCP)** é um protocolo que permite ao Claude Desktop e outras ferramentas de IA acessarem recursos externos como GitHub, Supabase, sistemas de arquivos, etc.

Este projeto está configurado com dois servidores MCP:

1. **GitHub MCP Server** - Acesso a repositórios, issues, PRs e código
2. **Supabase MCP Server** - Gerenciamento de banco de dados, storage e edge functions

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Claude Desktop instalado
- Conta GitHub com token de acesso
- Conta Supabase com access token

---

## 🚀 Configuração Passo a Passo

### Passo 1: Obter Token do GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** > **"Generate new token (classic)"**
3. Configure o token:
   - **Note**: "Med Briefing MCP Access"
   - **Expiration**: 90 days (ou conforme preferir)
   - **Scopes** (permissões necessárias):
     - ✅ `repo` (Full control of private repositories)
     - ✅ `read:org` (Read org and team membership)
     - ✅ `read:user` (Read user profile data)
4. Clique em **"Generate token"**
5. **Copie o token** (você não poderá vê-lo novamente!)

### Passo 2: Obter Access Token do Supabase

#### Opção A: Access Token da Conta
1. Acesse: https://supabase.com/dashboard/account/tokens
2. Clique em **"Generate new token"**
3. Dê um nome: "Med Briefing MCP"
4. Copie o token gerado

#### Opção B: Service Role Key do Projeto
1. Acesse: https://supabase.com/dashboard/project/pjbthsrnpytdaivchwqe/settings/api
2. Localize **"Service Role Key"** (secret)
3. Clique em **"Copy"**

**⚠️ IMPORTANTE**: O Service Role Key tem acesso total ao projeto. Use com cuidado!

### Passo 3: Configurar Variáveis de Ambiente

1. Navegue até a pasta `.mcp` do projeto:
   ```bash
   cd "c:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing\.mcp"
   ```

2. Copie o arquivo de exemplo:
   ```bash
   copy .env.example .env.mcp
   ```

3. Edite o arquivo `.env.mcp` e adicione seus tokens:
   ```bash
   GITHUB_TOKEN=ghp_seu_token_real_aqui
   SUPABASE_ACCESS_TOKEN=seu_token_real_aqui
   SUPABASE_PROJECT_ID=pjbthsrnpytdaivchwqe
   ```

### Passo 4: Configurar Claude Desktop

#### Windows

1. Localize o arquivo de configuração do Claude Desktop:
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. Abra o arquivo em um editor de texto

3. Adicione ou atualize a seção `mcpServers`:
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-github"],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "SEU_GITHUB_TOKEN_AQUI"
         }
       },
       "supabase": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-supabase"],
         "env": {
           "SUPABASE_ACCESS_TOKEN": "SEU_SUPABASE_TOKEN_AQUI",
           "SUPABASE_PROJECT_ID": "pjbthsrnpytdaivchwqe"
         }
       }
     }
   }
   ```

4. Substitua `SEU_GITHUB_TOKEN_AQUI` e `SEU_SUPABASE_TOKEN_AQUI` pelos tokens reais

5. Salve o arquivo

#### macOS

1. Localize o arquivo de configuração:
   ```
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

2. Siga os mesmos passos do Windows

#### Linux

1. Localize o arquivo de configuração:
   ```
   ~/.config/Claude/claude_desktop_config.json
   ```

2. Siga os mesmos passos do Windows

### Passo 5: Reiniciar Claude Desktop

1. Feche completamente o Claude Desktop
2. Abra novamente
3. Os servidores MCP devem estar disponíveis

---

## ✅ Verificar Configuração

### No Claude Desktop

Após reiniciar, você deve ver os servidores MCP disponíveis. Teste com comandos como:

```
Liste os repositórios do meu GitHub
```

```
Mostre as tabelas do banco de dados do Med Briefing
```

```
Quais são as Edge Functions deployadas no Supabase?
```

### Verificar Logs (se houver problemas)

#### Windows
```powershell
# Logs do Claude Desktop
Get-Content "$env:APPDATA\Claude\logs\mcp*.log" -Tail 50
```

#### macOS/Linux
```bash
# Logs do Claude Desktop
tail -f ~/Library/Application\ Support/Claude/logs/mcp*.log
```

---

## 🔧 Funcionalidades Disponíveis

### GitHub MCP Server

- ✅ Listar repositórios
- ✅ Ler conteúdo de arquivos
- ✅ Criar/atualizar arquivos
- ✅ Criar branches
- ✅ Criar Pull Requests
- ✅ Gerenciar Issues
- ✅ Buscar código
- ✅ Ver commits e histórico

### Supabase MCP Server

- ✅ Executar queries SQL
- ✅ Listar tabelas e schemas
- ✅ Criar/aplicar migrations
- ✅ Gerenciar Edge Functions
- ✅ Configurar Storage buckets
- ✅ Ver logs do projeto
- ✅ Gerenciar branches de desenvolvimento
- ✅ Buscar na documentação do Supabase

---

## 📚 Exemplos de Uso

### Exemplo 1: Criar Issue no GitHub

```
Crie uma issue no repositório med-briefing com o título 
"Implementar cache de transcrições" e descrição detalhada
```

### Exemplo 2: Verificar Estrutura do Banco

```
Mostre a estrutura da tabela recordings no Supabase, 
incluindo todos os campos e tipos
```

### Exemplo 3: Deploy de Edge Function

```
Faça deploy da Edge Function transcribe-recording 
com o código atualizado
```

### Exemplo 4: Criar Migration

```
Crie uma migration para adicionar índice na coluna 
user_id da tabela recordings
```

### Exemplo 5: Buscar Código

```
Encontre onde está sendo feito o upload de áudio 
no código do projeto
```

---

## 🐛 Troubleshooting

### Erro: "MCP server not found"

**Causa**: Servidores MCP não foram instalados ou configurados corretamente.

**Solução**:
1. Verifique se o Node.js está instalado: `node --version`
2. Teste a instalação manual:
   ```bash
   npx -y @modelcontextprotocol/server-github
   npx -y @modelcontextprotocol/server-supabase
   ```

### Erro: "Authentication failed"

**Causa**: Tokens inválidos ou expirados.

**Solução**:
1. Verifique se os tokens foram copiados corretamente
2. Gere novos tokens se necessário
3. Confirme que os tokens têm as permissões corretas

### Erro: "Project not found"

**Causa**: ID do projeto Supabase incorreto.

**Solução**:
1. Confirme que o ID é: `pjbthsrnpytdaivchwqe`
2. Verifique se você tem acesso ao projeto
3. Use o Access Token correto

### Servidores não aparecem no Claude

**Solução**:
1. Verifique o arquivo de configuração do Claude Desktop
2. Confirme que o JSON está válido (sem vírgulas extras, etc.)
3. Reinicie completamente o Claude Desktop
4. Verifique os logs para erros

---

## 🔒 Segurança

### Boas Práticas

1. **Nunca commite tokens** no Git
   - O arquivo `.env.mcp` já está no `.gitignore`
   
2. **Use tokens com escopo mínimo**
   - GitHub: Apenas as permissões necessárias
   - Supabase: Prefira Access Token ao Service Role Key quando possível

3. **Rotacione tokens regularmente**
   - Configure expiração de 90 dias
   - Gere novos tokens periodicamente

4. **Revogue tokens não utilizados**
   - GitHub: https://github.com/settings/tokens
   - Supabase: https://supabase.com/dashboard/account/tokens

### Tokens Comprometidos

Se um token for exposto:

1. **GitHub**: Revogue imediatamente em https://github.com/settings/tokens
2. **Supabase**: Revogue em https://supabase.com/dashboard/account/tokens
3. Gere novos tokens
4. Atualize a configuração do Claude Desktop

---

## 📖 Documentação Oficial

- **MCP Protocol**: https://modelcontextprotocol.io
- **GitHub MCP Server**: https://github.com/modelcontextprotocol/servers/tree/main/src/github
- **Supabase MCP Server**: https://github.com/modelcontextprotocol/servers/tree/main/src/supabase
- **Claude Desktop**: https://claude.ai/download

---

## 🎉 Próximos Passos

Após configurar os servidores MCP:

1. ✅ Teste comandos básicos no Claude Desktop
2. ✅ Explore as funcionalidades disponíveis
3. ✅ Integre com seu workflow de desenvolvimento
4. ✅ Automatize tarefas repetitivas

---

## 💡 Dicas de Uso

### Comandos Úteis

```
# Verificar status do projeto
Mostre o status do projeto Med Briefing no Supabase

# Listar arquivos recentes
Quais foram os últimos commits no repositório?

# Verificar erros
Mostre os logs de erro da Edge Function transcribe-recording

# Criar backup
Exporte o schema do banco de dados

# Análise de código
Analise o código do componente AudioRecorder e sugira melhorias
```

### Workflows Automatizados

1. **Deploy Completo**:
   ```
   1. Crie uma branch feature/nova-funcionalidade
   2. Faça as alterações necessárias
   3. Crie uma migration se necessário
   4. Deploy da Edge Function
   5. Crie um PR com as mudanças
   ```

2. **Troubleshooting**:
   ```
   1. Verifique os logs de erro
   2. Analise o código relacionado
   3. Sugira correções
   4. Aplique as correções
   5. Teste e valide
   ```

---

**Configuração criada em**: 09/11/2025  
**Projeto**: Med Briefing  
**Versão**: 1.0
