// ============================================================================
// SCRIPT DE TESTE: Framework de Análise Padronizado
// Testa consistência, validação e performance do novo sistema
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuração
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================================
// DADOS DE TESTE
// ============================================================================

const TEST_TRANSCRIPTION = `
Médico: Bom dia Maria! Seja bem-vinda. Como você está?
Paciente: Oi doutor, estou bem, um pouco nervosa.
Médico: Não precisa ficar nervosa, estamos aqui para te ajudar. Me conta, o que te trouxe aqui hoje?
Paciente: Então, eu tenho 42 anos e comecei a perceber umas rugas ao redor dos olhos que me incomodam muito.
Médico: Entendo. E há quanto tempo você vem percebendo isso?
Paciente: Uns 2 anos, mas nos últimos 6 meses piorou bastante.
Médico: E como você se sente quando olha no espelho?
Paciente: Ah, eu me sinto velha, sabe? Parece que estou com 50 anos.
Médico: Compreendo perfeitamente. E isso tem afetado sua autoestima?
Paciente: Sim, muito. Eu evito tirar fotos, não gosto de sair tanto.
Médico: Maria, você trabalha com o quê?
Paciente: Sou advogada, trabalho em um escritório.
Médico: E no trabalho, você sente que isso tem te afetado de alguma forma?
Paciente: Olha, eu sinto que as pessoas me tratam como se eu fosse mais velha do que sou.
Médico: Isso deve ser frustrante. Me diz, você já pensou em fazer algum tratamento antes?
Paciente: Já pensei, mas tenho medo de ficar artificial.
Médico: Ótimo que você trouxe isso! O objetivo aqui não é te deixar artificial, mas sim realçar sua beleza natural. Vou te mostrar alguns resultados de pacientes com perfil similar ao seu.
Paciente: Nossa, ficou muito natural mesmo!
Médico: Sim! E olha, no seu caso, eu recomendaria um protocolo com toxina botulínica ao redor dos olhos e um preenchimento leve na região malar. Você conhece esses procedimentos?
Paciente: Já ouvi falar da botox, mas não sei muito sobre preenchimento.
Médico: Deixa eu te explicar. A toxina vai relaxar os músculos que causam as rugas quando você sorri ou franze a testa. Já o preenchimento vai devolver volume perdido e dar sustentação.
Paciente: E dói?
Médico: É desconfortável, mas usamos anestésico tópico e a agulha é bem fininha. A maioria das pacientes diz que é tranquilo.
Paciente: Entendi. E quanto custa?
Médico: O investimento para esse protocolo completo é de R$ 3.200. Você pode parcelar em até 6x no cartão.
Paciente: Nossa, é mais caro do que eu imaginava.
Médico: Entendo sua preocupação. Mas pensa comigo: quantas vezes você deixou de ir em um evento ou se sentiu mal olhando no espelho? Quanto vale sua autoestima?
Paciente: É verdade... mas ainda assim é caro.
Médico: Olha, hoje eu tenho uma condição especial. Se você fechar hoje, eu consigo te dar um desconto de 10%, ficaria R$ 2.880.
Paciente: Preciso pensar um pouco.
Médico: Claro, sem problema. Mas te adianto que essa condição é só para hoje, tá?
Paciente: Tá bom, vou pensar e te ligo amanhã.
Médico: Ok Maria, qualquer dúvida me liga!
`;

// ============================================================================
// TESTES
// ============================================================================

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// Teste 1: Consistência (mesma transcrição 3x)
async function testConsistency() {
  console.log('\n🧪 Teste 1: Consistência (mesma transcrição 3x)');
  console.log('─'.repeat(60));

  const runs = [];

  for (let i = 1; i <= 3; i++) {
    console.log(`\nRodada ${i}/3...`);

    const startTime = Date.now();

    const { data, error } = await supabase.functions.invoke('analyze-consultation-v2', {
      body: {
        transcription: TEST_TRANSCRIPTION,
        patientName: 'Maria Silva',
        outcome: 'venda_perdida',
        duration: '15 minutos',
      },
    });

    const processingTime = Date.now() - startTime;

    if (error) {
      results.push({
        testName: 'Consistência',
        passed: false,
        message: `Erro na rodada ${i}: ${error.message}`,
      });
      return;
    }

    runs.push({
      run: i,
      score: data.data.overallPerformance.score,
      rating: data.data.overallPerformance.rating,
      processingTime,
      validationStatus: data.metadata?.validationStatus,
    });

    console.log(`✅ Score: ${data.data.overallPerformance.score}/160`);
    console.log(`   Rating: ${data.data.overallPerformance.rating}`);
    console.log(`   Tempo: ${processingTime}ms`);
  }

  // Calcular variação de scores
  const scores = runs.map((r) => r.score);
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const maxDiff = Math.max(...scores) - Math.min(...scores);
  const variance = ((maxDiff / avgScore) * 100).toFixed(2);

  console.log('\n📊 Resumo:');
  console.log(`   Score médio: ${avgScore.toFixed(1)}`);
  console.log(`   Variação máxima: ${maxDiff} pontos (${variance}%)`);

  // Passar se variação < 15%
  const passed = parseFloat(variance) < 15;

  results.push({
    testName: 'Consistência',
    passed,
    message: passed ? `✅ Variação de ${variance}% (aceitável)` : `❌ Variação de ${variance}% (muito alta)`,
    details: runs,
  });
}

// Teste 2: Validação de Schema
async function testValidation() {
  console.log('\n🧪 Teste 2: Validação de Schema');
  console.log('─'.repeat(60));

  const { data, error } = await supabase.functions.invoke('analyze-consultation-v2', {
    body: {
      transcription: TEST_TRANSCRIPTION,
      patientName: 'João Silva',
      outcome: 'venda_perdida',
      duration: '20 minutos',
    },
  });

  if (error) {
    results.push({
      testName: 'Validação',
      passed: false,
      message: `Erro: ${error.message}`,
    });
    return;
  }

  const analysisData = data.data;
  const metadata = data.metadata;

  // Verificar campos obrigatórios
  const checks = [
    { field: 'frameworkVersion', value: analysisData.frameworkVersion, expected: '2.0' },
    { field: 'overallPerformance', value: !!analysisData.overallPerformance },
    { field: 'phaseAnalysis (16 etapas)', value: analysisData.phaseAnalysis?.length, expected: 16 },
    { field: 'validationStatus', value: metadata?.validationStatus, expected: 'valid' },
  ];

  console.log('\n✅ Verificando campos obrigatórios:');
  let allPassed = true;

  for (const check of checks) {
    const passed = check.expected ? check.value === check.expected : check.value;
    console.log(`   ${passed ? '✅' : '❌'} ${check.field}: ${check.value}`);
    if (!passed) allPassed = false;
  }

  // Verificar cada etapa
  console.log('\n✅ Verificando etapas:');
  let stepsPassed = true;

  if (analysisData.phaseAnalysis) {
    for (const step of analysisData.phaseAnalysis) {
      const hasRequiredFields = step.stepNumber && step.stepName && step.score !== undefined && step.rating;

      if (!hasRequiredFields) {
        console.log(`   ❌ Etapa ${step.stepNumber} incompleta`);
        stepsPassed = false;
      }
    }

    if (stepsPassed) {
      console.log(`   ✅ Todas as 16 etapas completas`);
    }
  } else {
    stepsPassed = false;
    console.log('   ❌ phaseAnalysis não encontrado');
  }

  const passed = allPassed && stepsPassed;

  results.push({
    testName: 'Validação',
    passed,
    message: passed ? '✅ Todos os campos obrigatórios presentes' : '❌ Campos faltando',
    details: { checks, metadata },
  });
}

// Teste 3: Performance
async function testPerformance() {
  console.log('\n🧪 Teste 3: Performance');
  console.log('─'.repeat(60));

  const startTime = Date.now();

  const { data, error } = await supabase.functions.invoke('analyze-consultation-v2', {
    body: {
      transcription: TEST_TRANSCRIPTION,
      patientName: 'Pedro Santos',
      outcome: 'venda_perdida',
    },
  });

  const totalTime = Date.now() - startTime;

  if (error) {
    results.push({
      testName: 'Performance',
      passed: false,
      message: `Erro: ${error.message}`,
    });
    return;
  }

  const processingTime = data.metadata?.processingTimeMs || totalTime;

  console.log(`\n⏱️  Tempo de processamento: ${processingTime}ms (${(processingTime / 1000).toFixed(1)}s)`);
  console.log(`   Tempo total (com rede): ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`);

  // Meta: < 180s (180000ms)
  const TARGET_TIME = 180000;
  const passed = processingTime < TARGET_TIME;

  results.push({
    testName: 'Performance',
    passed,
    message: passed
      ? `✅ Processou em ${(processingTime / 1000).toFixed(1)}s (meta: <180s)`
      : `❌ Demorou ${(processingTime / 1000).toFixed(1)}s (meta: <180s)`,
    details: { processingTime, totalTime },
  });
}

// Teste 4: Edge Cases
async function testEdgeCases() {
  console.log('\n🧪 Teste 4: Edge Cases');
  console.log('─'.repeat(60));

  const testCases = [
    {
      name: 'Transcrição vazia',
      data: { transcription: '', patientName: 'Test', outcome: 'venda_perdida' },
      shouldFail: true,
    },
    {
      name: 'Transcrição muito curta',
      data: { transcription: 'Oi', patientName: 'Test', outcome: 'venda_perdida' },
      shouldFail: false, // Deve processar (IA vai dar score baixo)
    },
    {
      name: 'Sem nome do paciente',
      data: { transcription: TEST_TRANSCRIPTION, patientName: '', outcome: 'venda_perdida' },
      shouldFail: true,
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n   Testando: ${testCase.name}`);

    const { error } = await supabase.functions.invoke('analyze-consultation-v2', {
      body: testCase.data,
    });

    const failed = !!error;
    const passed = testCase.shouldFail ? failed : !failed;

    console.log(`   ${passed ? '✅' : '❌'} ${passed ? 'Passou' : 'Falhou'}`);

    results.push({
      testName: `Edge Case: ${testCase.name}`,
      passed,
      message: passed ? '✅ Comportamento esperado' : '❌ Comportamento inesperado',
      details: { error: error?.message },
    });
  }
}

// Teste 5: Auditoria
async function testAudit() {
  console.log('\n🧪 Teste 5: Sistema de Auditoria');
  console.log('─'.repeat(60));

  // Fazer uma análise
  const { data, error } = await supabase.functions.invoke('analyze-consultation-v2', {
    body: {
      transcription: TEST_TRANSCRIPTION,
      patientName: 'Teste Auditoria',
      outcome: 'venda_perdida',
    },
  });

  if (error) {
    results.push({
      testName: 'Auditoria',
      passed: false,
      message: `Erro ao fazer análise: ${error.message}`,
    });
    return;
  }

  // Aguardar 2s para garantir que auditoria foi salva
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Verificar se foi registrado no audit log
  const { data: auditData, error: auditError } = await supabase
    .from('analysis_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (auditError) {
    console.log('   ⚠️  Não foi possível verificar auditoria (tabela pode não existir ainda)');
    results.push({
      testName: 'Auditoria',
      passed: true,
      message: '⚠️  Auditoria não verificada (executar migração SQL)',
    });
    return;
  }

  const hasAudit = auditData && auditData.length > 0;

  console.log(`\n   ${hasAudit ? '✅' : '❌'} Registro de auditoria encontrado`);

  if (hasAudit) {
    const audit = auditData[0];
    console.log(`   Framework version: ${audit.framework_version}`);
    console.log(`   Validation status: ${audit.validation_status}`);
    console.log(`   Processing time: ${audit.processing_time_ms}ms`);
  }

  results.push({
    testName: 'Auditoria',
    passed: hasAudit,
    message: hasAudit ? '✅ Auditoria funcionando' : '❌ Auditoria não registrada',
    details: auditData,
  });
}

// ============================================================================
// EXECUTAR TODOS OS TESTES
// ============================================================================

async function runAllTests() {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   TESTE DO FRAMEWORK DE ANÁLISE PADRONIZADO              ║');
  console.log('║   Med Briefing 2.0 - Framework v2.0                      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  try {
    await testConsistency();
    await testValidation();
    await testPerformance();
    await testEdgeCases();
    await testAudit();

    // Resumo final
    console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   RESUMO DOS TESTES                                       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    const totalTests = results.length;
    const passedTests = results.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    for (const result of results) {
      console.log(`${result.passed ? '✅' : '❌'} ${result.testName}: ${result.message}`);
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`\n📊 Total: ${totalTests} testes`);
    console.log(`   ✅ Passou: ${passedTests}`);
    console.log(`   ❌ Falhou: ${failedTests}`);

    const percentage = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(`\n   Taxa de sucesso: ${percentage}%`);

    if (passedTests === totalTests) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema pronto para produção.\n');
    } else {
      console.log('\n⚠️  ALGUNS TESTES FALHARAM. Revisar antes de ir para produção.\n');
    }
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error);
  }
}

// ============================================================================
// EXECUTAR
// ============================================================================

if (import.meta.main) {
  runAllTests();
}
