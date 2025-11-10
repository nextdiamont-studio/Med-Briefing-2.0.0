// Transcription Service - Transcrição de áudio usando Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

// ====================================================
// CONFIGURAÇÃO
// ====================================================

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('[Transcription] VITE_GEMINI_API_KEY não configurada');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// ====================================================
// TIPOS
// ====================================================

export interface TranscriptionResult {
  transcriptionText: string;
  transcriptionUrl: string;
  transcriptionFilePath: string;
  duration?: number;
}

export interface TranscriptionProgress {
  stage: 'downloading' | 'converting' | 'transcribing' | 'uploading' | 'saving';
  progress: number;
  message: string;
}

// ====================================================
// FUNÇÕES AUXILIARES
// ====================================================

/**
 * Converte áudio blob para base64
 */
async function audioToBase64(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remover o prefixo "data:audio/...;base64,"
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
}

/**
 * Faz download do áudio do Storage do Supabase
 */
async function downloadAudioFromStorage(audioFilePath: string): Promise<Blob> {
  try {
    console.log('[Transcription] Downloading audio from storage:', audioFilePath);

    const { data, error } = await supabase.storage
      .from('recordings')
      .download(audioFilePath);

    if (error) {
      console.error('[Transcription] Download error:', error);
      throw new Error(`Erro ao baixar áudio: ${error.message}`);
    }

    console.log('[Transcription] Audio downloaded successfully, size:', data.size);
    return data;
  } catch (error) {
    console.error('[Transcription] Error downloading audio:', error);
    throw error;
  }
}

/**
 * Upload de transcrição para o Storage
 */
async function uploadTranscriptionToStorage(
  userId: string,
  recordingName: string,
  transcriptionText: string
): Promise<{ transcriptionUrl: string; transcriptionFilePath: string }> {
  try {
    // Sanitizar nome do arquivo
    const sanitizedName = recordingName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);

    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}-${sanitizedName}.txt`;

    console.log('[Transcription] Uploading transcription to storage:', fileName);

    // Criar blob de texto
    const blob = new Blob([transcriptionText], { type: 'text/plain;charset=utf-8' });

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('transcriptions')
      .upload(fileName, blob, {
        contentType: 'text/plain;charset=utf-8',
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      console.error('[Transcription] Upload error:', error);
      throw new Error(`Erro ao fazer upload da transcrição: ${error.message}`);
    }

    console.log('[Transcription] Transcription uploaded successfully:', data.path);

    // Gerar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('transcriptions')
      .getPublicUrl(fileName);

    return {
      transcriptionUrl: publicUrl,
      transcriptionFilePath: fileName,
    };
  } catch (error) {
    console.error('[Transcription] Error uploading transcription:', error);
    throw error;
  }
}

// ====================================================
// FUNÇÃO PRINCIPAL DE TRANSCRIÇÃO
// ====================================================

/**
 * Transcreve áudio usando Gemini API
 * @param recordingId - ID da gravação
 * @param onProgress - Callback para atualizar progresso (opcional)
 */
export async function transcribeAudio(
  recordingId: string,
  onProgress?: (progress: TranscriptionProgress) => void
): Promise<TranscriptionResult> {
  try {
    console.log('[Transcription] Starting transcription for recording:', recordingId);

    // 1. Buscar dados da gravação
    onProgress?.({
      stage: 'downloading',
      progress: 10,
      message: 'Buscando gravação...',
    });

    const { data: recording, error: recordingError } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recordingId)
      .single();

    if (recordingError || !recording) {
      throw new Error('Gravação não encontrada');
    }

    console.log('[Transcription] Recording found:', recording.name);

    // 2. Download do áudio
    onProgress?.({
      stage: 'downloading',
      progress: 20,
      message: 'Baixando áudio...',
    });

    const audioBlob = await downloadAudioFromStorage(recording.audio_file_path);

    // 3. Converter áudio para base64
    onProgress?.({
      stage: 'converting',
      progress: 40,
      message: 'Convertendo áudio...',
    });

    const audioBase64 = await audioToBase64(audioBlob);
    console.log('[Transcription] Audio converted to base64');

    // 4. Transcrever com Gemini
    onProgress?.({
      stage: 'transcribing',
      progress: 50,
      message: 'Transcrevendo com IA...',
    });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: audioBlob.type || 'audio/webm',
          data: audioBase64,
        },
      },
      {
        text: `Transcreva este áudio de uma consulta médica em português brasileiro.

INSTRUÇÕES:
1. Transcreva TUDO que for dito no áudio
2. Identifique os falantes como "Médico:" e "Paciente:"
3. Mantenha a ordem cronológica exata da conversa
4. Inclua pausas significativas como [pausa]
5. Marque trechos inaudíveis como [inaudível]
6. Use pontuação adequada
7. Corrija erros gramaticais óbvios, mas mantenha o vocabulário original
8. NÃO resuma, NÃO omita nada, transcreva palavra por palavra

Formato esperado:
Médico: [texto]
Paciente: [texto]
Médico: [texto]
...

Comece a transcrição agora:`,
      },
    ]);

    const transcriptionText = result.response.text();
    console.log('[Transcription] Transcription completed, length:', transcriptionText.length);

    if (!transcriptionText || transcriptionText.trim().length === 0) {
      throw new Error('Transcrição vazia - o áudio pode estar corrompido ou sem conteúdo');
    }

    // 5. Upload da transcrição
    onProgress?.({
      stage: 'uploading',
      progress: 80,
      message: 'Salvando transcrição...',
    });

    const { transcriptionUrl, transcriptionFilePath } = await uploadTranscriptionToStorage(
      recording.user_id,
      recording.name,
      transcriptionText
    );

    // 6. Atualizar registro no banco
    onProgress?.({
      stage: 'saving',
      progress: 90,
      message: 'Finalizando...',
    });

    const { error: updateError } = await supabase
      .from('recordings')
      .update({
        transcription_url: transcriptionUrl,
        transcription_text: transcriptionText,
        status: 'completed',
        error_message: null,
      })
      .eq('id', recordingId);

    if (updateError) {
      console.error('[Transcription] Error updating recording:', updateError);
      throw new Error(`Erro ao atualizar gravação: ${updateError.message}`);
    }

    onProgress?.({
      stage: 'saving',
      progress: 100,
      message: 'Concluído!',
    });

    console.log('[Transcription] Transcription process completed successfully');

    return {
      transcriptionText,
      transcriptionUrl,
      transcriptionFilePath,
      duration: recording.duration_seconds || undefined,
    };
  } catch (error: any) {
    console.error('[Transcription] Error:', error);

    // Atualizar status como falhou
    try {
      await supabase
        .from('recordings')
        .update({
          status: 'failed',
          error_message: error.message || 'Erro desconhecido na transcrição',
        })
        .eq('id', recordingId);
    } catch (updateError) {
      console.error('[Transcription] Error updating failed status:', updateError);
    }

    throw error;
  }
}

/**
 * Download de transcrição do Storage
 */
export async function downloadTranscription(transcriptionFilePath: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('transcriptions')
      .download(transcriptionFilePath);

    if (error) throw error;

    const text = await data.text();
    return text;
  } catch (error) {
    console.error('[Transcription] Error downloading transcription:', error);
    throw new Error('Erro ao baixar transcrição');
  }
}

/**
 * Obter URL pública de transcrição
 */
export function getTranscriptionPublicUrl(transcriptionFilePath: string): string {
  const { data } = supabase.storage
    .from('transcriptions')
    .getPublicUrl(transcriptionFilePath);

  return data.publicUrl;
}
