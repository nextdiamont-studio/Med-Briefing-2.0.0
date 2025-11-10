# 🚀 Instruções Rápidas - Corrigir Erro de Gravações

## ❌ Problema
As gravações não estão salvando porque a tabela `recordings` no banco de dados tem estrutura diferente do esperado.

## ✅ Solução (3 passos)

### PASSO 1: Atualizar Banco de Dados

1. Acesse: **https://pjbthsrnpytdaivchwqe.supabase.co**
2. Faça login
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie TODO o conteúdo do arquivo: `supabase/migrations/EXECUTE_THIS_NOW.sql`
6. Cole no editor
7. Clique em **RUN** (ou pressione Ctrl+Enter)
8. ✅ Deve aparecer "Success. No rows returned"

### PASSO 2: Criar Buckets de Storage

#### Bucket 1: recordings

1. No menu lateral, clique em **Storage**
2. Clique em **New bucket**
3. Preencha:
   - **Name**: `recordings`
   - **Public bucket**: ✅ MARCAR (importante!)
   - **File size limit**: 50 MB
4. Clique em **Create bucket**

#### Bucket 2: transcriptions

1. Clique em **New bucket** novamente
2. Preencha:
   - **Name**: `transcriptions`
   - **Public bucket**: ✅ MARCAR (importante!)
   - **File size limit**: 10 MB
3. Clique em **Create bucket**

### PASSO 3: Verificar se Funcionou

1. No **SQL Editor**, crie uma **New Query**
2. Copie o conteúdo de: `supabase/migrations/VERIFY_SETUP.sql`
3. Cole e clique em **RUN**
4. Verifique os resultados:
   - ✅ Primeira consulta: deve mostrar 12 colunas
   - ✅ Segunda consulta: deve mostrar 4 políticas
   - ✅ Terceira consulta: deve mostrar 3 índices
   - ✅ Quarta consulta: rowsecurity = true
   - ✅ Quinta consulta: deve mostrar 2 buckets (recordings e transcriptions)

## 🎉 Pronto!

Agora teste a gravação:

1. Abra o app: http://localhost:5173
2. Faça login
3. Vá em **Gravações** > **Nova Gravação**
4. Digite um nome e grave alguns segundos
5. Clique em **Salvar Gravação**
6. ✅ Deve salvar sem erros!

## 🆘 Se Ainda Houver Erro

Abra o DevTools (F12) e:
1. Vá na aba **Console**
2. Copie a mensagem de erro completa
3. Me envie para eu ajudar

---

## 📋 Checklist Rápido

- [ ] Executei o SQL `EXECUTE_THIS_NOW.sql`
- [ ] Criei o bucket `recordings` (público)
- [ ] Criei o bucket `transcriptions` (público)
- [ ] Executei o SQL `VERIFY_SETUP.sql`
- [ ] Testei gravar um áudio
- [ ] ✅ Funcionou!
