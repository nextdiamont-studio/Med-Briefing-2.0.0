// Script para configurar Supabase automaticamente
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pjbthsrnpytdaivchwqe.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnRoc3JucHl0ZGFpdmNod3FlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUxNzg0OSwiZXhwIjoyMDc4MDkzODQ5fQ.BB2Dw-kqMsSRtq77GwHROJV0JNayBgKlnQGovx45W2Q';

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('🚀 Iniciando setup do Supabase...\n');

  // 1. Criar buckets de Storage
  console.log('📦 Criando buckets de Storage...');

  try {
    // Bucket recordings
    console.log('  - Criando bucket "recordings"...');
    const { data: recordingsBucket, error: recordingsError } = await supabase.storage.createBucket('recordings', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg']
    });

    if (recordingsError) {
      if (recordingsError.message.includes('already exists')) {
        console.log('    ✓ Bucket "recordings" já existe');
      } else {
        console.error('    ✗ Erro:', recordingsError.message);
      }
    } else {
      console.log('    ✓ Bucket "recordings" criado com sucesso');
    }

    // Bucket transcriptions
    console.log('  - Criando bucket "transcriptions"...');
    const { data: transcriptionsBucket, error: transcriptionsError } = await supabase.storage.createBucket('transcriptions', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['text/plain']
    });

    if (transcriptionsError) {
      if (transcriptionsError.message.includes('already exists')) {
        console.log('    ✓ Bucket "transcriptions" já existe');
      } else {
        console.error('    ✗ Erro:', transcriptionsError.message);
      }
    } else {
      console.log('    ✓ Bucket "transcriptions" criado com sucesso');
    }
  } catch (error) {
    console.error('  ✗ Erro ao criar buckets:', error.message);
  }

  // 2. Listar buckets para verificação
  console.log('\n📋 Verificando buckets criados...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    console.log('  Buckets disponíveis:');
    buckets.forEach(bucket => {
      console.log(`    - ${bucket.name} (public: ${bucket.public})`);
    });
  } catch (error) {
    console.error('  ✗ Erro ao listar buckets:', error.message);
  }

  // 3. Verificar se tabela recordings existe
  console.log('\n🗄️  Verificando tabela "recordings"...');
  try {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('  ⚠️  Tabela "recordings" não existe ainda');
        console.log('  📝 Execute o SQL manualmente no Dashboard:');
        console.log('     https://pjbthsrnpytdaivchwqe.supabase.co/project/_/sql');
        console.log('     Arquivo: CREATE_RECORDINGS_TABLE.sql');
      } else {
        console.error('  ✗ Erro:', error.message);
      }
    } else {
      console.log('  ✓ Tabela "recordings" existe');
      console.log(`    Registros: ${data?.length || 0}`);
    }
  } catch (error) {
    console.error('  ✗ Erro ao verificar tabela:', error.message);
  }

  console.log('\n✅ Setup concluído!');
  console.log('\n📚 Próximos passos:');
  console.log('  1. Se a tabela "recordings" não existe, execute o SQL no Dashboard');
  console.log('  2. Obtenha uma Gemini API Key: https://aistudio.google.com/apikey');
  console.log('  3. Deploy da Edge Function: supabase functions deploy transcribe-recording');
  console.log('  4. Configure o webhook no Dashboard');
}

main().catch(console.error);
