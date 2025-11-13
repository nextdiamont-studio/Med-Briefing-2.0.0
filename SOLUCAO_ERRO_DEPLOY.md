# Solução para Erro de Deploy: "Entrypoint path does not exist"

## ❌ Erro Encontrado

```
Failed to deploy edge function: Entrypoint path does not exist -
/tmp/user_fn_pjbthsrnpytdaivchwqe_646025c6-69d5-4882-943d-75ab29c822ba_1/source/index.ts
```

## 🔍 Causa do Problema

O Supabase Dashboard não consegue resolver as dependências da pasta `_shared` automaticamente quando você faz upload apenas do `index.ts`.

A função `analyze-consultation-v3/index.ts` importa:
- `../shared/prompt-templates-v3.ts` ← ARQUIVO QUE MODIFICAMOS
- `../_shared/validation-schemas-v3.ts`

---

## ✅ SOLUÇÃO MAIS FÁCIL: Deploy via CLI

### Passo 1: Corrigir o arquivo de configuração

O erro "invalid keys: edge_functions" indica que o `config.toml` está desatualizado.

Execute este comando para criar/atualizar:

```bash
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"

# Criar/atualizar config.toml
echo [project]
project_id = "pjbthsrnpytdaivchwqe"

[api]
enabled = true
port = 54321

[functions]
enabled = true
> supabase\config.toml
```

### Passo 2: Fazer login no Supabase

```bash
./supabase.exe login
```

Isso abrirá o navegador para você fazer login.

### Passo 3: Linkar o projeto

```bash
./supabase.exe link --project-ref pjbthsrnpytdaivchwqe
```

### Passo 4: Deploy da função

```bash
./supabase.exe functions deploy analyze-consultation-v3 --no-verify-jwt
```

---

## ✅ SOLUÇÃO ALTERNATIVA: Usar Supabase CLI Global

Se o executável local não funcionar, instale globalmente:

### No PowerShell (Como Administrador):

```powershell
# Instalar via npm
npm install -g supabase

# Depois:
supabase login
supabase link --project-ref pjbthsrnpytdaivchwqe
supabase functions deploy analyze-consultation-v3 --no-verify-jwt
```

---

## ✅ SOLUÇÃO MANUAL: Editar Diretamente no Dashboard

Se NADA funcionar, você pode editar o prompt diretamente:

### Passo 1: Acessar o Dashboard
1. Vá em: https://supabase.com/dashboard/project/pjbthsrnpytdaivchwqe
2. Clique em **Edge Functions** no menu lateral
3. Clique em `analyze-consultation-v3`

### Passo 2: Editar via SQL Editor (Workaround)

Como o prompt está em um arquivo compartilhado, você pode:

1. Ir em **SQL Editor** no Dashboard
2. Criar uma nova query
3. Copiar TODO o conteúdo do arquivo `prompt-templates-v3.ts`
4. Salvar como snippet para referência

**MAS** isso não resolve o deploy. Precisamos do CLI.

---

## 🎯 SOLUÇÃO DEFINITIVA: Comandos Corretos

Execute UM POR VEZ no PowerShell (na pasta do projeto):

```powershell
# 1. Navegar para a pasta
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"

# 2. Instalar Supabase CLI globalmente (se não tiver)
npm install -g supabase

# 3. Login
supabase login

# 4. Linkar projeto
supabase link --project-ref pjbthsrnpytdaivchwqe

# 5. Deploy
supabase functions deploy analyze-consultation-v3 --no-verify-jwt

# 6. Verificar deploy
supabase functions list
```

---

## 🔧 Se der erro "invalid keys: edge_functions"

Renomeie ou delete o arquivo de configuração antigo:

```powershell
# Renomear config antigo
Rename-Item -Path "supabase\config.toml" -NewName "supabase\config.toml.old"

# Relinkar (isso cria novo config)
supabase link --project-ref pjbthsrnpytdaivchwqe
```

---

## 🧪 Verificar se Funcionou

Após o deploy bem-sucedido, você verá:

```
Deploying function analyze-consultation-v3 (project ref: pjbthsrnpytdaivchwqe)
✓ Function deployed successfully
```

Então:
1. Faça uma NOVA análise na aplicação
2. Verifique se o relatório está sem emojis
3. Verifique linguagem mais objetiva

---

## ❓ Ainda com Problemas?

### Erro: "command not found: supabase"

**Solução:**
```powershell
npm install -g supabase
```

### Erro: "Permission denied"

**Solução:** Execute PowerShell como Administrador

### Erro: "Cannot connect to Supabase"

**Solução:** Verifique sua internet e tente:
```powershell
supabase login --debug
```

---

## 📊 Resumo dos Comandos (Copie e Cole)

```powershell
# Tudo de uma vez (cole isso no PowerShell):
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"
npm install -g supabase
supabase login
supabase link --project-ref pjbthsrnpytdaivchwqe
supabase functions deploy analyze-consultation-v3 --no-verify-jwt
```

---

## 🎉 Após Deploy Bem-Sucedido

1. **Reinicie o frontend:**
   ```bash
   npm run dev
   ```

2. **Teste com uma NOVA análise:**
   - Crie uma nova consulta
   - Faça análise
   - Verifique se está sem emojis e com linguagem objetiva

3. **Lembre-se:**
   - Análises antigas mantêm formato antigo
   - Apenas novas análises usam o novo prompt

---

**Data:** 11/01/2025
**Status:** Guia de Solução Completo
