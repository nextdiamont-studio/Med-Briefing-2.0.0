# 🎙️ Como Testar a Transcrição com Gemini

## ✅ Pré-requisitos

Antes de testar, certifique-se de que:

1. ✅ Executou o SQL `EXECUTE_THIS_NOW.sql` no Supabase
2. ✅ Criou os buckets `recordings` e `transcriptions` no Storage
3. ✅ A chave da API do Gemini está configurada no `.env`:
   ```
   VITE_GEMINI_API_KEY=AIzaSyDxVRN2rCsl4fw9PMOYDLshWDXNtpaI
   ```

## 🚀 Passo a Passo para Testar

### 1. Iniciar o Projeto

```bash
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"
npm run dev
```

Acesse: http://localhost:5173

### 2. Fazer Login

Use suas credenciais para fazer login no sistema.

### 3. Criar uma Nova Gravação

1. Vá para a página **Gravações**
2. Clique em **Nova Gravação**
3. Digite um nome (ex: "Teste Transcrição")
4. Clique em **Iniciar Gravação**
5. Fale algo no microfone (ex: "Olá, este é um teste de transcrição")
6. Aguarde pelo menos 5 segundos
7. Clique em **Parar Gravação**
8. Clique em **Salvar Gravação**
9. ✅ Deve aparecer na lista com status "Salvo"

### 4. Transcrever o Áudio

1. Localize a gravação que você acabou de criar
2. Clique no botão **Transcrever com IA** (azul)
3. Aguarde o processo (pode levar de 10-30 segundos):
   - 🔄 "Buscando gravação..."
   - 🔄 "Baixando áudio..."
   - 🔄 "Convertendo áudio..."
   - 🔄 "Transcrevendo com IA..." ← Aqui o Gemini trabalha
   - 🔄 "Salvando transcrição..."
   - ✅ "Concluído!"
4. Deve aparecer um alerta: "✅ Transcrição concluída com sucesso!"
5. O status do card muda para **Transcrito** (verde)

### 5. Acessar a Transcrição

1. Agora você verá dois novos botões no card:
   - **Ver** (pequeno, verde claro)
   - **Acessar Transcrição** (grande, verde escuro)

2. Clique em **Acessar Transcrição**

3. Um modal abrirá mostrando:
   - 📄 Texto completo da transcrição
   - 📊 Estatísticas (palavras, caracteres)
   - ⏱️ Duração do áudio

### 6. Funcionalidades do Modal

No modal de transcrição você pode:

- 📋 **Copiar**: Copia toda a transcrição para a área de transferência
- 💾 **Baixar TXT**: Baixa a transcrição como arquivo `.txt`
- 📊 **Fazer Análise Agora**: Usa a transcrição para criar um briefing/diagnóstico

## 🎯 O que o Gemini Faz?

O Gemini:

1. **Recebe o áudio** em formato base64
2. **Transcreve palavra por palavra** tudo que foi dito
3. **Identifica falantes** como "Médico:" e "Paciente:"
4. **Mantém ordem cronológica** exata
5. **Marca pausas** e trechos inaudíveis
6. **Corrige gramática** mas mantém vocabulário original

## 📝 Exemplo de Transcrição

```
Médico: Bom dia! Como está se sentindo hoje?
Paciente: Bom dia, doutor. Estou com uma dor nas costas que não passa.
Médico: Entendo. Há quanto tempo você está com essa dor?
Paciente: Já faz uns três dias. Começou depois que carreguei peso.
[pausa]
Médico: Vou examinar. Pode deitar aqui na maca?
```

## 🐛 Solução de Problemas

### Erro: "Transcrição vazia"
**Causa**: Áudio pode estar corrompido ou sem conteúdo
**Solução**: Grave novamente com pelo menos 5 segundos de fala clara

### Erro: "Bucket não encontrado"
**Causa**: Buckets não foram criados no Supabase
**Solução**: Veja `INSTRUCOES_RAPIDAS.md` - Passo 2

### Erro: "API key inválida"
**Causa**: Chave do Gemini incorreta ou não configurada
**Solução**: Verifique o `.env` e reinicie o servidor (Ctrl+C e `npm run dev`)

### Erro: "Column does not exist"
**Causa**: Tabela `recordings` não foi atualizada
**Solução**: Execute `EXECUTE_THIS_NOW.sql` no Supabase

### A transcrição está incompleta
**Causa**: Áudio muito longo ou má qualidade
**Solução**:
- Grave áudios menores (máx 5 minutos)
- Fale mais próximo do microfone
- Evite ruídos de fundo

## 📊 Métricas de Performance

- ⚡ Áudio de 30s: ~10 segundos para transcrever
- ⚡ Áudio de 2min: ~20 segundos para transcrever
- ⚡ Áudio de 5min: ~40 segundos para transcrever

## 🎉 Resultado Esperado

Após seguir todos os passos, você deve ter:

1. ✅ Uma gravação salva com sucesso
2. ✅ Transcrição completa visível no modal
3. ✅ Arquivo TXT disponível para download
4. ✅ Opção de fazer análise direta da transcrição

## 📸 Checklist Visual

- [ ] Card da gravação mostra status "Transcrito" (badge verde)
- [ ] Botão "Acessar Transcrição" está visível
- [ ] Modal abre ao clicar no botão
- [ ] Transcrição está formatada e legível
- [ ] Estatísticas aparecem no topo do modal
- [ ] Todos os botões (Copiar, Baixar, Analisar) funcionam
- [ ] Arquivo .txt baixado contém o texto completo

---

## 🆘 Precisa de Ajuda?

Se encontrar qualquer erro:

1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Procure por mensagens com `[Transcription]`
4. Copie o erro completo e me envie

Exemplo de log de sucesso:
```
[Transcription] Starting transcription for recording: xxx
[Transcription] Recording found: Teste Transcrição
[Transcription] Audio downloaded successfully, size: 45123
[Transcription] Audio converted to base64
[Transcription] Transcription completed, length: 523
[Transcription] Transcription uploaded successfully
[Transcription] Transcription process completed successfully
```
