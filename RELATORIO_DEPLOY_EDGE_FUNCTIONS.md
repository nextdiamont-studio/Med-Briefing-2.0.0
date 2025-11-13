# Relatório de Deploy Manual - Edge Functions
## Atualizações de Análises da IA - Med Briefing 2.0

**Data:** 11/01/2025
**Versão:** 2.0 - Prompts Minimalistas
**Método:** Deploy Manual via Supabase Dashboard

---

## 📊 RESUMO DAS ALTERAÇÕES

### Arquivo Modificado Principal:
**`supabase/functions/_shared/prompt-templates-v3.ts`**

### Alterações Realizadas:
1. ✅ Removidos TODOS os emojis dos prompts (❌, ✅, ⚠️, 🎯, etc.)
2. ✅ Linguagem mais objetiva e profissional
3. ✅ Simplificação de textos em CAPS LOCK
4. ✅ Manutenção completa da estrutura e funcionalidade

### Principais Mudanças:
```
ANTES                           →  DEPOIS
❌ VENDA PERDIDA                →  VENDA PERDIDA
✅ VENDA REALIZADA              →  VENDA REALIZADA
BRUTALMENTE HONESTA             →  honesta
SIM/NÃO                         →  Sim/Não
CALOU A BOCA                    →  Manteve silêncio
Quem fala primeiro PERDE!       →  Quem fala primeiro perde.
```

---

## 🎯 EDGE FUNCTION A ATUALIZAR

### Nome da Função:
**`analyze-consultation-v3`**

### Project REF:
**`pjbthsrnpytdaivchwqe`**

### Dependências (arquivos que a função importa):
1. `_shared/prompt-templates-v3.ts` ← **ARQUIVO MODIFICADO**
2. `_shared/validation-schemas-v3.ts` (sem alterações)

---

## 📋 OPÇÕES DE DEPLOY MANUAL

### OPÇÃO 1: Via Supabase CLI (Terminal/PowerShell)

**Requisitos:**
- Supabase CLI instalado
- Acesso ao projeto no Supabase

**Comandos:**

```powershell
# 1. Navegar para a pasta do projeto
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"

# 2. Login no Supabase (se necessário)
supabase login

# 3. Linkar ao projeto
supabase link --project-ref pjbthsrnpytdaivchwqe

# 4. Deploy da função
supabase functions deploy analyze-consultation-v3 --no-verify-jwt
```

**Usando o executável local:**
```powershell
# Se o comando global não funcionar, use o executável local:
.\supabase.exe login
.\supabase.exe link --project-ref pjbthsrnpytdaivchwqe
.\supabase.exe functions deploy analyze-consultation-v3 --no-verify-jwt
```

---

### OPÇÃO 2: Via GitHub + Supabase (Recomendado se tiver Git)

**Passo a Passo:**

1. **Commit as alterações:**
```bash
git add supabase/functions/_shared/prompt-templates-v3.ts
git commit -m "refactor: remover emojis e aplicar linguagem minimalista nos prompts da IA"
git push origin main
```

2. **Configurar Deploy Automático no Supabase:**
   - Acesse: https://supabase.com/dashboard/project/pjbthsrnpytdaivchwqe
   - Vá em **Settings** → **Integrations**
   - Conecte ao GitHub
   - Configure deploy automático das Edge Functions

3. **Aguardar deploy automático** (1-2 minutos)

---

### OPÇÃO 3: Copiar e Colar no Dashboard (Última Alternativa)

⚠️ **ATENÇÃO:** Este método é mais trabalhoso e propenso a erros.

**Limitações:**
- O Dashboard do Supabase pode não ter editor inline para Edge Functions
- Dependências da pasta `_shared` podem não ser resolvidas automaticamente
- Requer upload de múltiplos arquivos

**Se disponível no seu projeto:**

1. Acesse: https://supabase.com/dashboard/project/pjbthsrnpytdaivchwqe/functions
2. Clique em `analyze-consultation-v3`
3. Se houver botão **"Edit"** ou **"Deploy new version"**, clique
4. Faça upload ou cole o conteúdo dos arquivos:
   - `analyze-consultation-v3/index.ts`
   - `_shared/prompt-templates-v3.ts` ← **MODIFICADO**
   - `_shared/validation-schemas-v3.ts`

---

## 📁 LOCALIZAÇÃO DOS ARQUIVOS

### Arquivo Principal Modificado:
```
C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing\supabase\functions\_shared\prompt-templates-v3.ts
```

### Arquivo da Função:
```
C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing\supabase\functions\analyze-consultation-v3\index.ts
```

### Arquivo de Validação (dependência):
```
C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing\supabase\functions\_shared\validation-schemas-v3.ts
```

---

## ✅ VERIFICAÇÃO PÓS-DEPLOY

### Como confirmar que funcionou:

1. **Verificar no Dashboard:**
   - Acesse: https://supabase.com/dashboard/project/pjbthsrnpytdaivchwqe/functions
   - Veja se `analyze-consultation-v3` mostra status **"Active"**
   - Verifique a data do último deploy

2. **Testar na Aplicação:**
   - Faça uma **NOVA** análise de consulta
   - Aguarde o processamento
   - Abra o relatório gerado
   - Verifique se o texto está **sem emojis** e com **linguagem objetiva**

3. **Verificar nos Logs:**
   - Dashboard → Edge Functions → `analyze-consultation-v3` → **Logs**
   - Procure por: `[Analyze-v3] Framework version: 3.0`
   - Verifique se não há erros

### O que esperar nos novos relatórios:

**Textos da IA agora terão:**
- ✅ Linguagem profissional e direta
- ✅ Sem emojis nos prompts internos
- ✅ Textos em maiúsculas reduzidos
- ✅ Tom mais objetivo

**Exemplo de mudança:**
```
ANTES:
"⚠️ CRÍTICO: Médico fez a pergunta? (SIM/NÃO)"

DEPOIS:
"Médico fez a pergunta? (Sim/Não)"
```

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Erro: "Cannot find project ref"
**Solução:**
```powershell
supabase link --project-ref pjbthsrnpytdaivchwqe
```

### Erro: "Entrypoint path does not exist"
**Causa:** Dashboard não consegue resolver dependências da pasta `_shared`
**Solução:** Use CLI (Opção 1) ou GitHub (Opção 2)

### Erro: "Permission denied"
**Solução:**
```powershell
# Execute PowerShell como Administrador
supabase login
```

### Erro: "Invalid JSON in config"
**Solução:**
```powershell
# Renomeie config antigo
Rename-Item supabase\config.toml supabase\config.toml.old
# Relinque para criar novo
supabase link --project-ref pjbthsrnpytdaivchwqe
```

### Mudanças não aparecem
**Possíveis causas:**
1. Deploy não foi concluído com sucesso
2. Análise testada é antiga (foi gerada antes do deploy)
3. Cache do navegador

**Solução:**
1. Verifique logs no Dashboard
2. Faça uma **NOVA** análise
3. Limpe cache (Ctrl+Shift+Del)

---

## 📞 COMANDOS RÁPIDOS

### Verificar se Supabase está instalado:
```powershell
supabase --version
# ou
.\supabase.exe --version
```

### Ver lista de funções:
```powershell
supabase functions list
```

### Ver logs da função:
```powershell
supabase functions logs analyze-consultation-v3
```

---

## 🎯 CHECKLIST DE DEPLOY

Marque conforme for completando:

**Pré-Deploy:**
- [ ] Arquivo `prompt-templates-v3.ts` foi modificado
- [ ] Tenho acesso ao Dashboard do Supabase
- [ ] Tenho Supabase CLI instalado (se usar Opção 1)

**Durante Deploy:**
- [ ] Login no Supabase realizado
- [ ] Projeto linkado corretamente
- [ ] Comando de deploy executado
- [ ] Mensagem de sucesso recebida

**Pós-Deploy:**
- [ ] Status "Active" no Dashboard
- [ ] Data de deploy atualizada
- [ ] Nova análise criada para teste
- [ ] Relatório gerado sem emojis
- [ ] Linguagem objetiva confirmada

---

## 📊 INFORMAÇÕES TÉCNICAS

### Dados do Projeto:
- **Project ID:** pjbthsrnpytdaivchwqe
- **URL do Projeto:** https://supabase.com/dashboard/project/pjbthsrnpytdaivchwqe
- **Região:** Não especificada (padrão Supabase)

### Função Atualizada:
- **Nome:** analyze-consultation-v3
- **Runtime:** Deno
- **Versão Framework:** 3.0 (15 etapas)
- **Arquivo Principal:** index.ts
- **Dependências:** prompt-templates-v3.ts, validation-schemas-v3.ts

### Variáveis de Ambiente Necessárias:
- `GEMINI_API_KEY` (já configurada no Supabase)

---

## 🔄 ROLLBACK (Se necessário)

Se algo der errado e você quiser voltar à versão anterior:

### Via CLI:
```powershell
# Não há comando direto de rollback
# Você precisaria fazer novo deploy com código antigo
```

### Via Dashboard:
1. Acesse Edge Functions
2. Veja histórico de deploys
3. Selecione versão anterior (se disponível)

### Via Git:
```bash
# Reverter commit
git revert HEAD
git push origin main
# Fazer novo deploy
supabase functions deploy analyze-consultation-v3 --no-verify-jwt
```

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Análises antigas não mudam:**
   - Relatórios já gerados mantêm formato antigo
   - Apenas novas análises usarão novos prompts

2. **Deploy é por função:**
   - Você está atualizando apenas `analyze-consultation-v3`
   - Outras funções não são afetadas

3. **Sem impacto no frontend:**
   - Esta alteração é apenas no backend (IA)
   - Frontend já foi atualizado anteriormente

4. **Compatibilidade:**
   - 100% compatível com dados existentes
   - Nenhuma migração de banco necessária
   - Estrutura JSON de resposta mantida

---

## 🎉 CONCLUSÃO

### Método Recomendado:
**OPÇÃO 1 - Via CLI** é o mais confiável e direto.

### Tempo Estimado:
- Via CLI: 2-3 minutos
- Via GitHub: 5-10 minutos (setup inicial)
- Via Dashboard: Pode não funcionar devido a dependências

### Próximos Passos Após Deploy:
1. ✅ Teste com nova análise
2. ✅ Verifique relatórios gerados
3. ✅ Confirme ausência de emojis
4. ✅ Valide linguagem objetiva

---

**Relatório gerado em:** 11/01/2025
**Status:** Pronto para deploy
**Versão:** 1.0 - Completo
