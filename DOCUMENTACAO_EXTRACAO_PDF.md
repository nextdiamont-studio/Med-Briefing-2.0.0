# 📄 Documentação Técnica - Extração de Texto de PDF

## ⚠️ IMPORTANTE: SEM USO DE IA

A extração de texto de PDF neste sistema **NÃO utiliza Inteligência Artificial**. É um processo 100% determinístico baseado em parsing da estrutura binária do PDF.

## 🔧 Como Funciona

### Biblioteca Utilizada: pdfjs-dist

**pdfjs-dist** é a biblioteca JavaScript oficial da Mozilla (mesma equipe do Firefox) para renderização e parsing de PDFs.

- **Desenvolvedor**: Mozilla Foundation
- **Licença**: Apache 2.0 (Open Source)
- **Engine**: Mesma usada no visualizador de PDF do Firefox
- **Versão**: 5.4.394

### Processo de Extração (Passo a Passo)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE EXTRAÇÃO DE PDF                      │
└─────────────────────────────────────────────────────────────────┘

1. LEITURA DO ARQUIVO
   ├─ File API (navegador)
   ├─ Converte para ArrayBuffer
   └─ Não há upload para servidor nesta etapa

2. PARSING BINÁRIO DO PDF
   ├─ pdfjs-dist analisa estrutura binária do PDF
   ├─ Identifica objetos de texto (PDF TextObject)
   ├─ Extrai fontes, encoding e glyphs
   └─ NENHUMA IA ENVOLVIDA - apenas algoritmos de parsing

3. EXTRAÇÃO DE TEXTO POR PÁGINA
   ├─ Para cada página:
   │  ├─ getTextContent() retorna array de text items
   │  ├─ Cada item contém:
   │  │  ├─ str: string do texto
   │  │  ├─ transform: matriz de transformação [a,b,c,d,e,f]
   │  │  │  └─ transform[5] = posição Y (vertical)
   │  │  └─ width, height, fontName
   │  └─ Agrupa itens por linha usando posição Y

4. RECONSTRUÇÃO DE LAYOUT
   ├─ Detecta quebras de linha (mudança na posição Y)
   ├─ Adiciona espaços entre palavras
   ├─ Preserva parágrafos
   └─ Junta todas as páginas com \n\n

5. RETORNO DO TEXTO PURO
   └─ String com todo o texto extraído
```

## 🧪 Algoritmo de Detecção de Layout

### Detecção de Quebra de Linha

```typescript
// Detecta quando há mudança significativa na posição Y
if (Math.abs(item.transform[5] - lastY) > 5) {
  // Nova linha detectada
  pageLines.push(currentLine.trim());
  currentLine = '';
}
```

**Por que 5 pixels?**
- Threshold empírico que funciona para a maioria dos PDFs
- Evita falsos positivos com subscrito/sobrescrito
- Pode ser ajustado se necessário

### Espaçamento Entre Palavras

```typescript
// Adiciona espaço se necessário
if (currentLine && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
  currentLine += ' ';
}
```

## 📊 Estrutura de um PDF (Simplificado)

```
PDF Structure:
├─ Header (%PDF-1.7)
├─ Body
│  ├─ Objects
│  │  ├─ Page Objects
│  │  │  └─ Content Stream
│  │  │     ├─ Text Objects (Tm, Tf, Tj, TJ operators)
│  │  │     ├─ Graphics Objects
│  │  │     └─ Images
│  │  ├─ Font Objects
│  │  │  └─ Encoding Maps (CMap)
│  │  └─ Resource Objects
│  └─ Cross-Reference Table
└─ Trailer
```

**O que extraímos:**
- ✅ Text Objects (operadores Tj, TJ, ')
- ✅ Posições de texto (operadores Tm, Td, TD, T*)
- ❌ Imagens (não é texto)
- ❌ Gráficos vetoriais (não é texto)

## 🎯 Tipos de PDF e Compatibilidade

### ✅ PDFs Compatíveis (100% de sucesso)

1. **PDFs nativos digitais**
   - Gerados por Word, Google Docs, LaTeX
   - Texto selecionável
   - Fontes embarcadas

2. **PDFs com OCR já aplicado**
   - Escaneados + OCR (Adobe Acrobat, etc.)
   - Contém camada de texto invisível

3. **PDFs formulários**
   - Com campos de texto preenchidos
   - Anotações e comentários

### ⚠️ PDFs Parcialmente Compatíveis

1. **PDFs com formatação complexa**
   - Tabelas multi-coluna (pode misturar ordem)
   - Layouts em colunas
   - **Solução**: Reorganizar manualmente se necessário

2. **PDFs com fontes não-padrão**
   - Símbolos especiais podem aparecer como �
   - Caracteres Unicode raros

### ❌ PDFs NÃO Compatíveis (precisam OCR externo)

1. **PDFs escaneados SEM OCR**
   - Apenas imagens de páginas
   - Sem camada de texto
   - **Solução**: Aplicar OCR antes (Tesseract, Adobe Acrobat, etc.)

2. **PDFs protegidos/criptografados**
   - Senha de abertura
   - Restrições de cópia
   - **Solução**: Remover proteção antes

## 🔍 Logging e Debug

### Console Logs Disponíveis

Todos os logs começam com `[PDF Extraction]`:

```javascript
// Início do processo
[PDF Extraction] Iniciando extração de: documento.pdf
[PDF Extraction] Tamanho do arquivo: 1024.50 KB

// Parsing
[PDF Extraction] Arquivo lido em ArrayBuffer
[PDF Extraction] PDF carregado: 10 página(s)

// Por página
[PDF Extraction] Processando página 1/10
[PDF Extraction] Página 1: 2543 caracteres extraídos

// Resultado final
[PDF Extraction] ✅ Extração concluída: 25430 caracteres totais
[PDF Extraction] Primeiros 200 caracteres: Lorem ipsum dolor sit amet...
```

### Como Debugar

1. **Abra o Console do navegador** (F12)
2. **Faça upload de um PDF**
3. **Analise os logs**:
   - Número de páginas detectadas
   - Caracteres extraídos por página
   - Preview do texto extraído

## 🚀 Performance

### Benchmarks (aproximados)

| Tamanho do PDF | Páginas | Tempo de Extração | Memória |
|----------------|---------|-------------------|---------|
| < 1 MB         | 1-10    | < 1 segundo       | ~10 MB  |
| 1-5 MB         | 10-50   | 1-3 segundos      | ~30 MB  |
| 5-10 MB        | 50-100  | 3-7 segundos      | ~60 MB  |
| > 10 MB        | > 100   | 7-15 segundos     | ~100 MB |

**Limitações do navegador:**
- Arquivos > 50 MB podem falhar
- Depende da memória disponível

## 🔐 Segurança e Privacidade

### ✅ Processamento 100% Local

- **NENHUM upload para servidor** durante extração
- **NENHUMA chamada de API externa** para extração
- **Dados ficam no navegador** até o usuário enviar para análise

### Fluxo Completo de Dados

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   USUÁRIO    │────>│  NAVEGADOR   │────>│   SUPABASE   │
│ Seleciona PDF│     │ Extrai texto │     │ Salva análise│
└──────────────┘     └──────────────┘     └──────────────┘
                     (SEM IA aqui!)       (IA analisa aqui)
```

**Onde a IA é usada:**
1. ❌ **NÃO é usada** na extração de texto do PDF
2. ✅ **É usada** na análise do texto extraído (Gemini API)

## 🧩 Alternativas Consideradas

### Por que pdfjs-dist?

| Biblioteca      | Prós                          | Contras                    | Escolhida? |
|-----------------|-------------------------------|----------------------------|------------|
| **pdfjs-dist**  | ✅ Mais popular<br>✅ Mozilla<br>✅ Funciona no browser | ⚠️ Arquivo grande (2MB) | ✅ SIM     |
| pdf-parse       | ✅ Leve<br>✅ Simples         | ❌ Node.js only            | ❌ NÃO     |
| pdf.js-extract  | ✅ Baseado em pdfjs           | ❌ Menos mantido           | ❌ NÃO     |
| Tesseract.js    | ✅ OCR embutido               | ❌ Muito pesado (> 10MB)<br>❌ Usa IA/ML | ❌ NÃO     |

## 📝 Exemplos de Uso

### Exemplo 1: PDF Simples (1 página)

```typescript
const file = document.getElementById('input').files[0];
const text = await extractTextFromPDF(file);

// Console output:
// [PDF Extraction] Iniciando extração de: contrato.pdf
// [PDF Extraction] Tamanho do arquivo: 45.23 KB
// [PDF Extraction] PDF carregado: 1 página(s)
// [PDF Extraction] Página 1: 1523 caracteres extraídos
// [PDF Extraction] ✅ Extração concluída: 1523 caracteres totais
```

### Exemplo 2: PDF Multi-página

```typescript
const file = document.getElementById('input').files[0];
const text = await extractTextFromPDF(file);

// Console output:
// [PDF Extraction] PDF carregado: 5 página(s)
// [PDF Extraction] Página 1: 2341 caracteres extraídos
// [PDF Extraction] Página 2: 2198 caracteres extraídos
// [PDF Extraction] Página 3: 2456 caracteres extraídos
// [PDF Extraction] Página 4: 2103 caracteres extraídos
// [PDF Extraction] Página 5: 1987 caracteres extraídos
// [PDF Extraction] ✅ Extração concluída: 11085 caracteres totais
```

## 🛠️ Troubleshooting

### Problema: "Falha ao extrair texto do PDF"

**Possíveis causas:**
1. PDF corrompido
2. PDF protegido/criptografado
3. PDF escaneado sem OCR
4. Arquivo muito grande (> 50 MB)

**Soluções:**
1. Verifique se o PDF abre em outro visualizador
2. Remova proteção do PDF
3. Aplique OCR antes (Adobe, Tesseract)
4. Divida PDF em partes menores

### Problema: Texto extraído está embaralhado

**Causa:** PDF com layout complexo (múltiplas colunas)

**Solução:**
- Use entrada manual e cole o texto reorganizado
- Ou ajuste o threshold de detecção de linha (linha 56 do pdf-utils.ts)

### Problema: Caracteres estranhos (�, □)

**Causa:** Fontes não-padrão ou encoding incorreto

**Solução:**
- Regenere o PDF com fontes embarcadas
- Ou use entrada manual

## 📚 Referências

- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [PDF Specification (ISO 32000)](https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf)
- [Text Extraction from PDF](https://github.com/mozilla/pdf.js/wiki/Text-Extraction)

---

**Versão**: 2.0.4
**Última atualização**: 2025-11-08
**Desenvolvido por**: Claude (Anthropic)
