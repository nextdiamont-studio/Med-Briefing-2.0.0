# 🚀 Quick Start - Servidores MCP

## Configuração em 5 Minutos

### 1️⃣ Execute o Script de Configuração

```powershell
# No diretório do projeto
.\setup-mcp.ps1
```

O script irá:
- ✅ Verificar Node.js
- ✅ Verificar Claude Desktop
- ✅ Criar arquivo de configuração
- ✅ Testar servidores MCP
- ✅ Configurar Claude Desktop (opcional)

### 2️⃣ Obtenha os Tokens

#### GitHub Token
1. Acesse: https://github.com/settings/tokens
2. **Generate new token (classic)**
3. Selecione: `repo`, `read:org`, `read:user`
4. Copie o token

#### Supabase Token
1. Acesse: https://supabase.com/dashboard/account/tokens
2. **Generate new token**
3. Copie o token

### 3️⃣ Configure os Tokens

Edite o arquivo `.mcp\.env.mcp`:

```bash
GITHUB_TOKEN=ghp_seu_token_aqui
SUPABASE_ACCESS_TOKEN=seu_token_aqui
SUPABASE_PROJECT_ID=pjbthsrnpytdaivchwqe
```

### 4️⃣ Configure o Claude Desktop

#### Opção A: Automática (via script)
```powershell
.\setup-mcp.ps1
# Escolha "s" quando perguntado sobre configurar o Claude
```

#### Opção B: Manual

Edite: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "SEU_TOKEN_AQUI"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "SEU_TOKEN_AQUI",
        "SUPABASE_PROJECT_ID": "pjbthsrnpytdaivchwqe"
      }
    }
  }
}
```

### 5️⃣ Reinicie o Claude Desktop

Feche completamente e abra novamente.

---

## ✅ Teste Rápido

No Claude Desktop, teste:

```
Liste os repositórios do meu GitHub
```

```
Mostre as tabelas do banco de dados Med Briefing
```

```
Quais Edge Functions estão deployadas no Supabase?
```

---

## 🎯 Comandos Úteis

### GitHub
- `Liste meus repositórios`
- `Mostre o último commit do repositório X`
- `Crie uma issue no repositório Y`
- `Busque por código que contém "AudioRecorder"`

### Supabase
- `Liste as tabelas do banco`
- `Mostre a estrutura da tabela recordings`
- `Execute: SELECT * FROM recordings LIMIT 5`
- `Liste as Edge Functions deployadas`
- `Mostre os logs da função transcribe-recording`

---

## 📚 Documentação Completa

Para mais detalhes, consulte: **CONFIGURACAO_MCP.md**

---

## 🐛 Problemas?

### Servidores não aparecem
1. Verifique o arquivo de configuração do Claude
2. Confirme que o JSON está válido
3. Reinicie o Claude Desktop

### Erro de autenticação
1. Verifique se os tokens estão corretos
2. Confirme as permissões dos tokens
3. Gere novos tokens se necessário

### Node.js não encontrado
1. Instale Node.js 18+: https://nodejs.org
2. Reinicie o terminal
3. Execute o script novamente

---

**Tempo estimado**: 5 minutos  
**Dificuldade**: Fácil  
**Pré-requisitos**: Node.js 18+, Claude Desktop
