// PDF text extraction utilities using pdfjs-dist
// ⚠️ IMPORTANTE: Esta biblioteca NÃO usa IA - apenas parsing determinístico de PDF
// pdfjs-dist é desenvolvida pela Mozilla e é a mesma engine usada no Firefox

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - usando versão local do node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Extract text from a PDF file with improved formatting preservation
 *
 * Esta função usa APENAS algoritmos de parsing de PDF (SEM IA):
 * - Analisa a estrutura binária do PDF
 * - Extrai objetos de texto e suas posições
 * - Reconstroi o texto preservando layout e parágrafos
 *
 * @param file - PDF file to extract text from
 * @returns Promise with extracted text
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  console.log(`[PDF Extraction] Iniciando extração de: ${file.name}`);
  console.log(`[PDF Extraction] Tamanho do arquivo: ${(file.size / 1024).toFixed(2)} KB`);

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('[PDF Extraction] Arquivo lido em ArrayBuffer');

    // Load PDF document (parsing binário, SEM IA)
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log(`[PDF Extraction] PDF carregado: ${pdf.numPages} página(s)`);

    const textParts: string[] = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`[PDF Extraction] Processando página ${pageNum}/${pdf.numPages}`);

      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Improved text extraction with layout preservation
      const items = textContent.items as any[];
      const pageLines: string[] = [];
      let currentLine = '';
      let lastY = 0;

      // Group text items by line based on Y position
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (!item.str) continue;

        // Detect line break (when Y position changes significantly)
        if (lastY !== 0 && Math.abs(item.transform[5] - lastY) > 5) {
          if (currentLine.trim()) {
            pageLines.push(currentLine.trim());
          }
          currentLine = '';
        }

        // Add space between words if needed
        if (currentLine && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
          currentLine += ' ';
        }

        currentLine += item.str;
        lastY = item.transform[5];
      }

      // Add last line
      if (currentLine.trim()) {
        pageLines.push(currentLine.trim());
      }

      // Join lines with newlines
      const pageText = pageLines.join('\n');

      if (pageText.trim()) {
        textParts.push(pageText);
        console.log(`[PDF Extraction] Página ${pageNum}: ${pageText.length} caracteres extraídos`);
      }
    }

    // Join all pages with double newline
    const finalText = textParts.join('\n\n');
    console.log(`[PDF Extraction] ✅ Extração concluída: ${finalText.length} caracteres totais`);
    console.log(`[PDF Extraction] Primeiros 200 caracteres: ${finalText.substring(0, 200)}...`);

    return finalText;
  } catch (error) {
    console.error('[PDF Extraction] ❌ Erro ao extrair texto do PDF:', error);
    throw new Error('Falha ao extrair texto do PDF. Verifique se o arquivo é um PDF válido.');
  }
}

/**
 * Extract text from a TXT file
 * @param file - TXT file to read
 * @returns Promise with file content
 */
export async function extractTextFromTXT(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error('Falha ao ler arquivo TXT'));
    };

    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Extract text from file (auto-detects PDF or TXT)
 * @param file - File to extract text from
 * @returns Promise with extracted text
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (fileExtension === 'pdf') {
    return extractTextFromPDF(file);
  } else if (fileExtension === 'txt') {
    return extractTextFromTXT(file);
  } else {
    throw new Error('Formato de arquivo não suportado. Use PDF ou TXT.');
  }
}

/**
 * Validate if file is PDF or TXT
 * @param file - File to validate
 * @returns true if file is PDF or TXT
 */
export function isValidFileType(file: File): boolean {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return fileExtension === 'pdf' || fileExtension === 'txt';
}

/**
 * Get file type display name
 * @param file - File to check
 * @returns Display name for file type
 */
export function getFileTypeDisplay(file: File): string {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  switch (fileExtension) {
    case 'pdf':
      return 'PDF';
    case 'txt':
      return 'TXT';
    default:
      return 'Desconhecido';
  }
}
