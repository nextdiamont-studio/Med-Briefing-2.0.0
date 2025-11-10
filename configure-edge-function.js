// Script para configurar Edge Function via API
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pjbthsrnpytdaivchwqe.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnRoc3JucHl0ZGFpdmNod3FlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUxNzg0OSwiZXhwIjoyMDc4MDkzODQ5fQ.BB2Dw-kqMsSRtq77GwHROJV0JNayBgKlnQGovx45W2Q';
const GEMINI_API_KEY = 'AIzaSyDxVRN2rCsl4fw9PMOYDLshWDXNtpaIBHs';
const PROJECT_REF = 'pjbthsrnpytdaivchwqe';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function configureEdgeFunction() {
  console.log('🔧 Configurando Edge Function...\n');

  // Como não podemos fazer deploy via API facilmente, vamos criar
  // um guia passo a passo para o usuário executar

  console.log('📋 INSTRUÇÕES PARA DEPLOY DA EDGE FUNCTION:\n');

  console.log('1️⃣ INSTALAR SUPABASE CLI (escolha um método):\n');
  console.log('   Windows (PowerShell como Administrador):');
  console.log('   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git');
  console.log('   scoop install supabase\n');

  console.log('   OU via NPX (sem instalação):');
  console.log('   Pode usar npx diretamente nos comandos abaixo\n');

  console.log('2️⃣ FAZER LOGIN NO SUPABASE:\n');
  console.log('   supabase login\n');

  console.log('3️⃣ LINKAR AO PROJETO:\n');
  console.log(`   cd "${process.cwd()}"`);
  console.log(`   supabase link --project-ref ${PROJECT_REF}\n`);

  console.log('4️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE:\n');
  console.log('   No Dashboard do Supabase:');
  console.log(`   https://${PROJECT_REF}.supabase.co/project/_/settings/functions\n`);
  console.log('   Adicionar secret:');
  console.log('   Name: GEMINI_API_KEY');
  console.log(`   Value: ${GEMINI_API_KEY}\n`);

  console.log('5️⃣ FAZER DEPLOY DA FUNÇÃO:\n');
  console.log('   supabase functions deploy transcribe-recording\n');

  console.log('6️⃣ VERIFICAR DEPLOY:\n');
  console.log('   supabase functions list\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('💡 ALTERNATIVA RÁPIDA (se tiver problema com CLI):\n');
  console.log('Você pode fazer o deploy manual via Dashboard:');
  console.log(`1. Acessar: https://${PROJECT_REF}.supabase.co/project/_/functions`);
  console.log('2. Criar nova função: transcribe-recording');
  console.log('3. Copiar código de: supabase/functions/transcribe-recording/index.ts');
  console.log('4. Configurar variável GEMINI_API_KEY nas Settings\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Vamos pelo menos configurar o secret via API se possível
  console.log('🔐 Tentando configurar GEMINI_API_KEY via API...\n');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/_internal/secrets`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'GEMINI_API_KEY',
          value: GEMINI_API_KEY
        })
      }
    );

    if (response.ok) {
      console.log('✅ GEMINI_API_KEY configurada com sucesso!\n');
    } else {
      const error = await response.text();
      console.log('⚠️  Não foi possível configurar via API:', error);
      console.log('Configure manualmente no Dashboard (instruções acima)\n');
    }
  } catch (error) {
    console.log('⚠️  Erro ao configurar secret:', error.message);
    console.log('Configure manualmente no Dashboard (instruções acima)\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✨ Após o deploy, execute: node test-edge-function.js\n');
}

configureEdgeFunction().catch(console.error);
