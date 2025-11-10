# 🔧 Troubleshooting - Extração de PDF

## 🚨 Problemas Comuns e Soluções

### ❌ Erro: "Failed to load PDF worker"

**Sintoma:**
```
Error: Setting up fake worker failed: "Cannot read properties of undefined"
```

**Causa:** O worker do PDF.js não foi carregado corretamente

**Solução 1: Limpar cache do navegador**
```bash
1. Pressione Ctrl+Shift+Delete
2. Selecione "Cached images and files"
3. Clique em "Clear data"
4. Recarregue a página (F5)
```

**Solução 2: Verificar console**
```javascript
// Abra o console (F12) e execute:
console.log(pdfjsLib.version);
// Deve mostrar: "5.4.394" ou similar
```

**Solução 3: Forçar reload do worker**
```bash
# Pare o servidor (Ctrl+C)
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"
rm -rf node_modules/.vite
pnpm dev
```

---

### ❌ Erro: "Formato de arquivo não suportado"

**Sintoma:**
```
Formato de arquivo não suportado. Use apenas arquivos PDF ou TXT.
```

**Causa:** Arquivo não é PDF ou TXT

**Soluções:**
1. **Verificar extensão do arquivo**
   - Arquivo deve terminar em `.pdf` ou `.txt`
   - Windows pode esconder extensões (ative em "View" > "File name extensions")

2. **Converter arquivo**
   - Word (.docx): Salvar como > PDF
   - Google Docs: File > Download > PDF
   - Imagem escaneada: Use Adobe Acrobat com OCR

---

### ❌ Erro: "Falha ao extrair texto do PDF"

**Sintoma:**
```
Falha ao extrair texto do PDF. Verifique se o arquivo é um PDF válido.
```

**Possíveis causas:**

#### 1. PDF Corrompido
**Como verificar:**
- Tente abrir em Adobe Reader ou Chrome
- Se não abrir, arquivo está corrompido

**Solução:**
- Regenerar o PDF
- Ou usar ferramenta de reparo: https://www.ilovepdf.com/repair-pdf

#### 2. PDF Protegido/Criptografado
**Como verificar:**
- PDF pede senha ao abrir
- Ou mostra "Protected" no nome

**Solução:**
```bash
# Remover proteção (se você tem direito):
# Use Adobe Acrobat ou: https://www.ilovepdf.com/unlock_pdf
```

#### 3. PDF Escaneado (SEM OCR)
**Como verificar:**
- Tente selecionar texto no PDF
- Se não conseguir selecionar, não tem OCR

**Solução:**
```bash
# Aplicar OCR antes:
# - Adobe Acrobat: Tools > Enhance Scans > Recognize Text
# - Online: https://www.onlineocr.net/
# - Tesseract (local): tesseract input.pdf output -l por pdf
```

---

### ❌ Erro: "Invalid PDF structure"

**Sintoma:**
```
Error: Invalid PDF structure
```

**Causa:** PDF tem estrutura não-padrão ou corrompida

**Soluções:**

**Opção 1: Reimprimir para PDF**
```bash
1. Abra o PDF em Chrome/Edge
2. Ctrl+P (Print)
3. "Destination" > "Save as PDF"
4. Salve como novo arquivo
```

**Opção 2: Usar ferramenta online**
- https://www.ilovepdf.com/repair-pdf
- https://smallpdf.com/repair-pdf

---

### ❌ Erro: Texto extraído está embaralhado

**Sintoma:**
```
Texto sai assim:
"João Silva
consulta
médica
de
Paciente:"

Deveria ser:
"Paciente: João Silva
Consulta médica de..."
```

**Causa:** PDF tem layout complexo (múltiplas colunas, tabelas)

**Soluções:**

**Opção 1: Ajustar threshold de linha**
```typescript
// Em src/lib/pdf-utils.ts, linha 56:
// Mude de:
if (Math.abs(item.transform[5] - lastY) > 5) {
// Para:
if (Math.abs(item.transform[5] - lastY) > 10) {
// Número maior = mais tolerante a variações
```

**Opção 2: Usar entrada manual**
- Copie o texto do PDF
- Cole diretamente no campo "Entrada Manual"
- Organize manualmente se necessário

---

### ❌ Erro: Caracteres estranhos (�, □, ?)

**Sintoma:**
```
Texto extraído: "Paciente: Jo�o Silva"
Deveria ser: "Paciente: João Silva"
```

**Causa:** Encoding de fonte não-padrão

**Soluções:**

**Opção 1: Regenerar PDF com fontes embarcadas**
```bash
# No Word:
File > Options > Save
☑ Embed fonts in the file
```

**Opção 2: Usar entrada manual**
- Copie do PDF original (com Ctrl+C)
- Cole no campo manual
- Caracteres devem aparecer corretamente

---

### ⚠️ Aviso: Arquivo muito grande

**Sintoma:**
```
Navegador trava ou mostra erro de memória
```

**Causa:** PDF > 50 MB

**Soluções:**

**Opção 1: Comprimir PDF**
```bash
# Online:
https://www.ilovepdf.com/compress_pdf

# Ou Adobe Acrobat:
File > Save As Other > Reduced Size PDF
```

**Opção 2: Dividir PDF**
```bash
# Dividir em partes menores:
https://www.ilovepdf.com/split_pdf

# Processar cada parte separadamente
```

**Opção 3: Extrair texto manualmente**
```bash
# Usar ferramenta de linha de comando:
pdftotext arquivo.pdf arquivo.txt

# Depois fazer upload do TXT
```

---

### ❌ Erro: "Network error" ou timeout

**Sintoma:**
```
Erro ao processar análise (timeout)
```

**Causa:** Gemini API demorou > 25 segundos

**Soluções:**

**Opção 1: Reduzir tamanho do texto**
- Transcrições > 10.000 palavras podem dar timeout
- Resuma ou divida em partes

**Opção 2: Verificar internet**
- Teste: https://fast.com
- Velocidade mínima: 5 Mbps

**Opção 3: Tentar novamente**
- Erro pode ser temporário
- Aguarde 1 minuto e tente de novo

---

## 🧪 Como Testar se Está Funcionando

### Teste 1: PDF Simples

**Arquivo de teste:**
1. Abra Word ou Google Docs
2. Digite:
```
CONSULTA TESTE

Paciente: João Silva
Data: 08/11/2025

Médico: Como posso ajudar?
Paciente: Tenho dor de cabeça.
```
3. Salve como PDF
4. Faça upload

**Resultado esperado:**
```
[PDF Extraction] Iniciando extração de: teste.pdf
[PDF Extraction] PDF carregado: 1 página(s)
[PDF Extraction] ✅ Extração concluída: ~90 caracteres
```

---

### Teste 2: Verificar Console

**Passo a passo:**
```bash
1. Abra http://localhost:5742
2. Pressione F12
3. Vá na aba "Console"
4. Faça upload de um PDF
5. Veja os logs [PDF Extraction]
```

**Logs corretos:**
```
[PDF Extraction] Iniciando extração de: arquivo.pdf
[PDF Extraction] Tamanho do arquivo: 123.45 KB
[PDF Extraction] Arquivo lido em ArrayBuffer
[PDF Extraction] PDF carregado: 3 página(s)
[PDF Extraction] Processando página 1/3
[PDF Extraction] Página 1: 2341 caracteres extraídos
...
[PDF Extraction] ✅ Extração concluída
```

**Se não aparecer nada:**
- Problema no worker
- Siga "Solução 3" do primeiro erro acima

---

### Teste 3: Arquivo TXT

**Criar arquivo teste:**
```bash
# Crie arquivo: teste.txt
Consulta de teste
Paciente: Maria Santos
Médico: Olá, como posso ajudar?
```

**Fazer upload:**
1. Selecione teste.txt
2. Deve aparecer: "✓ teste.txt (TXT) - ~75 caracteres extraídos"

---

## 🔍 Logs de Debug Detalhados

### Habilitar Logs Verbosos

**Abra console (F12) e execute:**
```javascript
// Ver versão do PDF.js
console.log('PDF.js version:', pdfjsLib.version);

// Ver worker URL
console.log('Worker URL:', pdfjsLib.GlobalWorkerOptions.workerSrc);

// Testar extração manual
const file = document.querySelector('input[type="file"]').files[0];
const text = await extractTextFromFile(file);
console.log('Texto extraído:', text);
```

---

## 📊 Métricas de Performance

### Tempos Esperados

| Tipo de PDF | Páginas | Tamanho | Tempo de Extração |
|-------------|---------|---------|-------------------|
| Simples     | 1-5     | < 1 MB  | < 1 segundo      |
| Médio       | 5-20    | 1-5 MB  | 1-3 segundos     |
| Grande      | 20-50   | 5-10 MB | 3-7 segundos     |
| Muito grande| > 50    | > 10 MB | 7-15 segundos    |

**Se demorar muito mais:**
- PDF pode estar corrompido
- Ou ter estrutura muito complexa
- Tente comprimir ou regenerar

---

## 🆘 Ainda Não Funciona?

### Checklist Final

- [ ] Navegador atualizado (Chrome/Edge/Firefox)
- [ ] Cache limpo (Ctrl+Shift+Delete)
- [ ] Console sem erros (F12)
- [ ] PDF abre em outro visualizador
- [ ] Arquivo < 50 MB
- [ ] Extensão é .pdf ou .txt
- [ ] Internet funcionando (> 5 Mbps)
- [ ] Servidor rodando (http://localhost:5742)

### Se ainda assim não funcionar:

1. **Tire screenshot do erro**
   - Console (F12)
   - Mensagem de erro na tela

2. **Teste com arquivo exemplo**
   - Baixe: https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
   - Tente fazer upload

3. **Verifique versão do Node.js**
   ```bash
   node --version
   # Deve ser >= 18.0.0
   ```

4. **Reinstale dependências**
   ```bash
   cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"
   rm -rf node_modules
   pnpm install
   pnpm dev
   ```

---

**Última atualização**: 2025-11-08
**Próxima revisão**: Após primeiros usuários em produção
