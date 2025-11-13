# Guia de Teste Rápido

## Como Testar as Mudanças Agora

### Pré-requisitos
- ✅ Build completado com sucesso
- ✅ Variáveis de ambiente configuradas (.env)
- ✅ Chave da API Gemini válida

---

## 1. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Aguarde a mensagem:
```
  VITE v6.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 2. Acessar a Aplicação

Abra o navegador em: `http://localhost:5173/`

---

## 3. Teste #1: Análise de Venda Perdida

### Passo a Passo

1. **Login** (se necessário)

2. **Criar Nova Análise**
   - Clique em "Nova Análise" ou botão similar
   - Selecione "Análise de Performance"

3. **Preencher Formulário**
   ```
   Nome do Paciente: Ana Silva
   Resultado: Venda Perdida
   Valor do Ticket: 5000
   ```

4. **Inserir Transcrição de Teste**
   ```
   Médico: Oi Ana, tudo bem?
   Paciente: Oi, tudo sim.
   Médico: Então, você quer fazer harmonização facial né? Vai dar R$ 5000.
   Paciente: Nossa, é caro. Vou pensar.
   Médico: Tá bom, qualquer coisa me liga.
   ```

5. **Processar Análise**
   - Clique em "Analisar" ou "Processar"
   - Aguarde o processamento (5-10 segundos)

6. **Verificar Relatório**
   - ✅ Relatório deve aparecer sem emojis
   - ✅ Deve mostrar "[OK]", "[X]", "[ERRO]" ao invés de ✓, ✗, !
   - ✅ Números devem aparecer como [1], [2], [3]

---

## 4. Teste #2: Análise de Venda Realizada

### Passo a Passo

1. **Criar Nova Análise**
   - Clique em "Nova Análise"
   - Selecione "Análise de Performance"

2. **Preencher Formulário**
   ```
   Nome do Paciente: Julia Costa
   Resultado: Venda Realizada
   Valor do Ticket: 8000
   ```

3. **Inserir Transcrição de Teste**
   ```
   Médico: Oi Julia, que prazer te conhecer! Vi que você tem uma filha linda no Instagram.
   Paciente: Ah sim! É a Maria, ela tem 5 anos.
   Médico: Que fofa! E Julia, me conta, o que mais tem te incomodado?
   Paciente: Ah, são essas linhas de expressão aqui na testa...
   Médico: E como você se sente com isso?
   Paciente: Me sinto mais velha, sabe? Fico triste quando me olho no espelho.
   Médico: Imagino que seja difícil... E quando você imagina resolvendo isso, como você quer se sentir?
   Paciente: Quero me sentir mais confiante, mais bonita!
   Médico: Perfeito! Então vou te mostrar como vamos fazer você se sentir MAIS CONFIANTE e MAIS BONITA.
   (continua com apresentação do protocolo)
   Paciente: Adorei! Vamos fazer!
   ```

4. **Processar e Verificar**
   - ✅ Relatório sem emojis
   - ✅ Visual minimalista
   - ✅ Análise detalhada

---

## 5. Checklist de Validação Visual

Ao visualizar qualquer relatório, verifique:

### ❌ NÃO deve aparecer:
- ❌ ✓ (check)
- ❌ ✗ (x)
- ❌ ! (exclamação)
- ❌ • (bullet)
- ❌ Emojis coloridos
- ❌ 🎯 📊 💡 etc

### ✅ DEVE aparecer:
- ✅ [OK]
- ✅ [X]
- ✅ [ERRO]
- ✅ - (hífen)
- ✅ [1], [2], [3]
- ✅ Texto limpo e profissional

---

## 6. Verificar Console do Navegador

Abra o DevTools (F12) e verifique:

### Console (aba Console)
Deve mostrar:
```
[Direct AI Service] Iniciando análise direta...
[Direct AI Service] Paciente: Ana Silva
[Direct AI Service] Resultado: Venda Perdida
[Direct AI Service] Chamando Gemini API...
[Direct AI Service] Resposta recebida da Gemini API
[Direct AI Service] Análise concluída com sucesso
```

### Network (aba Network)
Deve mostrar:
- ✅ Chamada para `generativelanguage.googleapis.com`
- ✅ Status 200 (sucesso)
- ✅ Tempo de resposta ~5-8 segundos

---

## 7. Verificar Banco de Dados

### No Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Vá para o projeto
3. Abra "Table Editor"
4. Verifique tabela `performance_analyses`

Deve mostrar:
- ✅ Nova linha criada
- ✅ `patient_name` correto
- ✅ `outcome` correto
- ✅ `analysis_results` (JSON) preenchido
- ✅ `created_at` com timestamp recente

---

## 8. Teste de Erros

### Teste #1: Sem transcrição
1. Tente criar análise sem preencher transcrição
2. ✅ Deve mostrar erro: "Preencha todos os campos obrigatórios"

### Teste #2: API Key inválida
1. Temporariamente mude a chave no .env para inválida
2. Tente processar análise
3. ✅ Deve mostrar erro relacionado à API

---

## 9. Comparação Visual

### Relatório Antigo (com emojis)
```
✅ Performance Geral
Score: 85/150

✓ Conexão estabelecida
✗ Mapeamento incompleto
! Erro fatal identificado

Próximos passos:
• Revisar conexão
• Praticar perguntas
• Focar em individualização
```

### Relatório Novo (minimalista)
```
Performance Geral
Score: 85/150

[OK] Conexão estabelecida
[X] Mapeamento incompleto
[ERRO] Erro fatal identificado

Próximos passos:
- Revisar conexão
- Praticar perguntas
- Focar em individualização
```

---

## 10. Teste de Performance

Meça o tempo de processamento:

1. **Anote o horário** quando clicar em "Processar"
2. **Anote o horário** quando o relatório aparecer
3. **Calcule a diferença**

**Tempo esperado:** 5-10 segundos
**Tempo aceitável:** até 15 segundos
**Se > 15 segundos:** Verifique conexão com internet e API Gemini

---

## Resultados Esperados

### ✅ Sucesso Total
- [ ] Build sem erros
- [ ] Servidor dev inicia
- [ ] Nova análise pode ser criada
- [ ] Processamento funciona (5-10s)
- [ ] Relatório aparece sem emojis
- [ ] Visual minimalista aplicado
- [ ] Dados salvos no banco
- [ ] Console sem erros críticos

### ⚠️ Atenção Necessária
Se qualquer checkbox acima falhar:
1. Verifique o console do navegador (F12)
2. Verifique variáveis de ambiente (.env)
3. Verifique chave da API Gemini
4. Consulte o arquivo ATUALIZACAO_API_DIRETA.md

---

## Comandos Úteis

### Ver logs em tempo real
```bash
# Terminal 1: Servidor dev
npm run dev

# Terminal 2: Seguir logs (se aplicável)
tail -f logs/*.log
```

### Limpar cache (se necessário)
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules
npm install

# Limpar cache do Vite
rm -rf .vite
```

### Verificar variáveis de ambiente
```bash
# Windows
type .env

# Linux/Mac
cat .env
```

---

## Próximos Passos Após Teste

### Se tudo funcionou ✅
1. Marcar esta implementação como aprovada
2. Documentar em CHANGELOG.md
3. Considerar commit com mensagem descritiva
4. Planejar migração para Edge Function protegida (futuro)

### Se algo falhou ❌
1. Anotar exatamente o erro
2. Verificar console e network
3. Consultar documentação de troubleshooting
4. Considerar rollback se necessário

---

## Contato de Suporte

Se precisar de ajuda:
1. Verifique primeiro: ATUALIZACAO_API_DIRETA.md
2. Verifique também: RESUMO_VISUAL_MUDANCAS.md
3. Revise este guia completamente
4. Anote mensagens de erro específicas

---

**Boa sorte nos testes!** 🚀

**Tempo estimado total de teste:** 15-30 minutos
