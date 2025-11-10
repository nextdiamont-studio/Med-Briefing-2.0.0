// Storage Service - Upload e gerenciamento de arquivos no Supabase Storage
import { supabase } from './supabase';

// ====================================================
// CONSTANTES
// ====================================================

const STORAGE_BUCKETS = {
  RECORDINGS: 'recordings',
  TRANSCRIPTIONS: 'transcriptions',
} as const;

const MAX_FILE_SIZE = {
  AUDIO: 52428800, // 50MB
  TRANSCRIPTION: 10485760, // 10MB
} as const;

const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
];

// ====================================================
// TIPOS
// ====================================================

export interface UploadResult {
  audioUrl: string;
  filePath: string;
  fileSize: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ====================================================
// VALIDAÇÕES
// ====================================================

/**
 * Valida se o arquivo de áudio está dentro dos limites permitidos
 */
function validateAudioFile(audioBlob: Blob): void {
  // Validar tamanho
  if (audioBlob.size > MAX_FILE_SIZE.AUDIO) {
    const maxSizeMB = (MAX_FILE_SIZE.AUDIO / 1024 / 1024).toFixed(0);
    const fileSizeMB = (audioBlob.size / 1024 / 1024).toFixed(2);
    throw new Error(
      `Arquivo muito grande (${fileSizeMB}MB). Tamanho máximo: ${maxSizeMB}MB`
    );
  }

  // Validar tipo MIME
  if (!ALLOWED_AUDIO_TYPES.includes(audioBlob.type)) {
    throw new Error(
      `Tipo de arquivo não suportado: ${audioBlob.type}. Tipos permitidos: ${ALLOWED_AUDIO_TYPES.join(', ')}`
    );
  }

  // Validar se não está vazio
  if (audioBlob.size === 0) {
    throw new Error('Arquivo de áudio vazio');
  }
}

/**
 * Sanitiza o nome do arquivo removendo caracteres especiais
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100); // Limitar tamanho do nome
}

/**
 * Gera um nome de arquivo único com timestamp
 */
function generateFileName(userId: string, recordingName: string, extension: string = 'webm'): string {
  const sanitizedName = sanitizeFileName(recordingName);
  const timestamp = Date.now();
  return `${userId}/${timestamp}-${sanitizedName}.${extension}`;
}

// ====================================================
// FUNÇÕES DE UPLOAD
// ====================================================

/**
 * Upload de gravação de áudio para o Supabase Storage
 * @param userId - ID do usuário
 * @param recordingName - Nome da gravação
 * @param audioBlob - Blob do áudio
 * @returns URL pública, caminho do arquivo e tamanho
 */
export async function uploadRecording(
  userId: string,
  recordingName: string,
  audioBlob: Blob
): Promise<UploadResult> {
  try {
    console.log('[Storage] Starting upload process...');
    console.log('[Storage] User ID:', userId);
    console.log('[Storage] Recording name:', recordingName);
    console.log('[Storage] File size:', (audioBlob.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('[Storage] File type:', audioBlob.type);

    // 1. Validar arquivo
    validateAudioFile(audioBlob);

    // 2. Gerar nome único do arquivo
    const fileName = generateFileName(userId, recordingName);
    console.log('[Storage] Generated file name:', fileName);

    // 3. Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.RECORDINGS)
      .upload(fileName, audioBlob, {
        contentType: audioBlob.type,
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      console.error('[Storage] Upload error:', error);
      throw new Error(`Falha no upload: ${error.message}`);
    }

    console.log('[Storage] Upload successful:', data.path);

    // 4. Gerar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.RECORDINGS)
      .getPublicUrl(fileName);

    console.log('[Storage] Public URL:', publicUrl);

    return {
      audioUrl: publicUrl,
      filePath: fileName,
      fileSize: audioBlob.size,
    };
  } catch (error) {
    console.error('[Storage] Error in uploadRecording:', error);
    throw error;
  }
}

/**
 * Upload de gravação de consulta (wrapper para uploadRecording)
 * Mantém compatibilidade com código existente
 */
export async function uploadConsultationRecording(
  userId: string,
  patientName: string,
  audioBlob: Blob
): Promise<UploadResult> {
  const recordingName = `consulta_${patientName}`;
  return uploadRecording(userId, recordingName, audioBlob);
}

/**
 * Download de arquivo de transcrição
 * @param filePath - Caminho do arquivo no storage
 * @returns Conteúdo do arquivo
 */
export async function downloadTranscription(filePath: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('transcriptions')
      .download(filePath);

    if (error) throw error;

    const text = await data.text();
    return text;
  } catch (error) {
    console.error('[Storage] Error downloading transcription:', error);
    throw new Error('Falha ao baixar transcrição');
  }
}

/**
 * Deletar gravação e transcrição associada
 * @param audioFilePath - Caminho do áudio
 * @param transcriptionFilePath - Caminho da transcrição (opcional)
 */
export async function deleteRecording(
  audioFilePath: string,
  transcriptionFilePath?: string
): Promise<void> {
  try {
    // Deletar áudio
    const { error: audioError } = await supabase.storage
      .from('recordings')
      .remove([audioFilePath]);

    if (audioError) {
      console.error('[Storage] Error deleting audio:', audioError);
    }

    // Deletar transcrição se existir
    if (transcriptionFilePath) {
      const { error: transcriptionError } = await supabase.storage
        .from('transcriptions')
        .remove([transcriptionFilePath]);

      if (transcriptionError) {
        console.error('[Storage] Error deleting transcription:', transcriptionError);
      }
    }

    console.log('[Storage] Files deleted successfully');
  } catch (error) {
    console.error('[Storage] Error in deleteRecording:', error);
    throw error;
  }
}

/**
 * Obter URL de download de transcrição
 * @param filePath - Caminho do arquivo
 * @returns URL para download
 */
export function getTranscriptionDownloadUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('transcriptions')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
