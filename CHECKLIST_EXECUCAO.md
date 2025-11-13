# ✅ CHECKLIST DE EXECUÇÃO - Med Briefing 2.0 v3.0

**Tempo Total:** ~10 minutos
**Data:** 11/11/2025

---

## 🚀 EXECUÇÃO RÁPIDA (4 Passos)

### ☐ PASSO 1: Migration SQL (1 min)

```
1. Acesse: https://supabase.com/dashboard
2. Database > SQL Editor > New Query
3. Copie: supabase/migrations/20250112_framework_v3_15_steps.sql
4. Cole e clique em "Run"
5. ✅ Verifique "Success"
```

**Verificação:**
```sql
SELECT version, is_active FROM analysis_frameworks WHERE version = '3.0';
-- Deve retornar: version = '3.0', is_active = true
```

---

### ☐ PASSO 2: Deploy Edge Function (2 min)

```bash
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"
supabase functions deploy analyze-consultation-v3
```

**Verificação:**
```bash
supabase functions list
# Deve mostrar: analyze-consultation-v3  Active
```

---

### ☐ PASSO 3: Verificar API Key (1 min)

```bash
supabase secrets list
# Deve mostrar: GEMINI_API_KEY  ********
```

**Se não estiver configurada:**
```bash
supabase secrets set GEMINI_API_KEY=SUA_CHAVE
```

---

### ☐ PASSO 4: Testar (5 min)

**Via Interface Web:**
```
1. Acesse Med Briefing 2.0
2. Análises > Nova Análise
3. Crie análise de teste
4. ✅ Verifique: frameworkVersion = "3.0"
5. ✅ Verifique: 15 etapas (não 16)
```

**Via Logs:**
```bash
supabase functions logs analyze-consultation-v3 --follow
# Deve mostrar: "Using Framework v3.0"
```

---

## ✅ VALIDAÇÃO FINAL

Marque cada item após verificar:

### Framework v3.0:
- [ ] Migration executada sem erros
- [ ] Framework v3.0 está ativo (is_active = true)
- [ ] Tem 15 etapas (SELECT jsonb_array_length = 15)
- [ ] Perfis DISC atualizados com scripts

### Edge Function:
- [ ] Função deployada (supabase functions list mostra Active)
- [ ] GEMINI_API_KEY configurada
- [ ] Logs não mostram erros
- [ ] Teste de análise funcionou

### Análises:
- [ ] Análise retorna frameworkVersion: "3.0"
- [ ] Score é /150 (não /160)
- [ ] Tem 15 etapas na resposta
- [ ] Componentes novos renderizam (FrequencyAnalysisCard)

### Gravações:
- [ ] Interface mostra "Duração: Ilimitada ∞"
- [ ] Interface mostra "Armazenamento: Ilimitado"
- [ ] Não há mais mensagem de "5 horas máximo"

---

## 🎯 CRITÉRIO DE SUCESSO

**TUDO FUNCIONANDO SE:**

✅ Análise retorna: `frameworkVersion: "3.0"`
✅ Análise tem 15 etapas
✅ Score total é /150
✅ Gravações mostram "Ilimitada"
✅ Sem erros nos logs

---

## 🔄 SE ALGO DER ERRADO

### Rollback para v2.0:
```sql
UPDATE analysis_frameworks SET is_active = false WHERE version = '3.0';
UPDATE analysis_frameworks SET is_active = true WHERE version = '2.0';
```

### Ver erros da Edge Function:
```bash
supabase functions logs analyze-consultation-v3 --limit 100
```

### Resetar e tentar de novo:
```bash
# Re-deploy da função
supabase functions delete analyze-consultation-v3
supabase functions deploy analyze-consultation-v3
```

---

## 📚 DOCUMENTAÇÃO

Se tiver dúvidas, consulte:
- **Guia Completo:** `GUIA_IMPLANTACAO_MANUAL.md`
- **Resumo:** `RESUMO_IMPLEMENTACAO_COMPLETA.md`

---

**Status:** ☐ Não Iniciado | ⏳ Em Progresso | ✅ Concluído
