# Configuração MCP - Med Briefing

Esta pasta contém a configuração dos servidores MCP (Model Context Protocol) para o projeto Med Briefing.

## 📁 Arquivos

- **`config.json`** - Configuração dos servidores MCP
- **`.env.example`** - Exemplo de variáveis de ambiente
- **`.env.mcp`** - Suas credenciais (não commitado no Git)

## 🔧 Configuração

1. Copie `.env.example` para `.env.mcp`
2. Preencha com seus tokens:
   - GitHub Personal Access Token
   - Supabase Access Token

## 🚀 Uso

Os servidores MCP são usados pelo Claude Desktop para:

- **GitHub**: Gerenciar repositórios, issues, PRs e código
- **Supabase**: Gerenciar banco de dados, storage e edge functions

## 📚 Documentação

Veja o arquivo `CONFIGURACAO_MCP.md` na raiz do projeto para instruções detalhadas.

## 🔒 Segurança

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env.mcp` no Git!

Este arquivo contém tokens sensíveis que dão acesso total aos seus recursos.
