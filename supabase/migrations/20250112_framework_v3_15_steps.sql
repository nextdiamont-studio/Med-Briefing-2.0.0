-- ============================================================================
-- FRAMEWORK v3.0 - METODOLOGIA OFICIAL COMPLETA (15 ETAPAS)
-- Baseado nos 6 Passos de Vendas Consultivas + Perfis DISC
-- ============================================================================

-- Desativar framework v2.0
UPDATE analysis_frameworks SET is_active = false WHERE version = '2.0';

-- Inserir novo framework v3.0 com 15 etapas
INSERT INTO analysis_frameworks (version, name, description, methodology_steps, is_active)
VALUES (
    '3.0',
    'Vendas Consultivas - Metodologia Oficial Completa (6 Passos)',
    'Framework de 15 etapas baseado nos 6 passos de vendas consultivas + 5 perguntas do mapeamento + perfis DISC + técnicas de fechamento',
    '[
        {
            "number": 1,
            "name": "Primeira Impressão & Preparação",
            "description": "Preparação pré-consulta (Instagram, ficha) e recepção calorosa com uso do nome do paciente",
            "maxScore": 10,
            "keyIndicators": ["Preparou-se antes", "Recepção calorosa", "Usou nome do paciente", "Ofereceu água/café"]
        },
        {
            "number": 2,
            "name": "Conexão Genuína (10 min obrigatórios)",
            "description": "Criar rapport através de perguntas abertas, validação emocional e uma das 3 estratégias (Família/Instagram/Paciente Fechado)",
            "maxScore": 10,
            "keyIndicators": ["Perguntas abertas", "Duração 10min+", "Validação emocional", "Paciente se abriu"]
        },
        {
            "number": 3,
            "name": "Mapeamento - Pergunta 1: Dores (Frequência Baixa)",
            "description": "Investigar dores emocionais profundas com tom sério, empático e SEM sorriso. Perguntar: O que te incomoda? Como você se sente? Como isso impacta você?",
            "maxScore": 10,
            "keyIndicators": ["Pergunta principal feita", "Aprofundou emocionalmente", "Tom baixo/sério", "Capturou frases emocionais"]
        },
        {
            "number": 4,
            "name": "Mapeamento - Pergunta 2: Desejos (Frequência Alta)",
            "description": "Explorar desejos e fazer paciente visualizar transformação com energia alta, sorrindo e empolgado",
            "maxScore": 10,
            "keyIndicators": ["Pergunta de desejos feita", "Tom alto/empolgado", "Fez paciente sonhar", "Capturou palavras de desejo"]
        },
        {
            "number": 5,
            "name": "Mapeamento - Pergunta 3: Nível de Consciência",
            "description": "Identificar tipo de paciente (Analítico/Aberto/Influenciado por Instagram) e adaptar discurso",
            "maxScore": 10,
            "keyIndicators": ["Perguntou sobre conhecimento prévio", "Identificou tipo", "Adaptou abordagem"]
        },
        {
            "number": 6,
            "name": "Mapeamento - Pergunta 4: Histórico",
            "description": "Descobrir objeções escondidas através de experiências passadas (Ex: achei pesado, não durou)",
            "maxScore": 10,
            "keyIndicators": ["Perguntou sobre histórico", "Descobriu objeções escondidas", "Anotou para quebrar depois"]
        },
        {
            "number": 7,
            "name": "Mapeamento - Pergunta 5: Receios/Medos",
            "description": "Permitir que paciente exponha todos os medos conscientemente para quebrar ANTES do preço",
            "maxScore": 10,
            "keyIndicators": ["Perguntou sobre receios", "Deixou paciente expor medos", "Anotou objeções"]
        },
        {
            "number": 8,
            "name": "Direcionamento - Individualização",
            "description": "Demonstrar que fará tratamento personalizado usando as queixas EXATAS do paciente, não copia e cola",
            "maxScore": 10,
            "keyIndicators": ["Falou sobre individualização", "Usou palavras exatas do paciente", "Diferenciou de influencers"]
        },
        {
            "number": 9,
            "name": "Direcionamento - Posicionamento de Resultado",
            "description": "Diferenciar-se da concorrência (franquias, metas) e criar vínculo: Eu quero ser SUA doutora",
            "maxScore": 10,
            "keyIndicators": ["Diferenciou-se da concorrência", "Focou em resultado", "Criou vínculo pessoal"]
        },
        {
            "number": 10,
            "name": "Direcionamento - Educação (Tratamento vs Procedimento)",
            "description": "Educar com exemplo PRÁTICO (conta de 1 a 10) mostrando que procedimento isolado não funciona",
            "maxScore": 10,
            "keyIndicators": ["Educou sobre tratamento", "Usou exemplo prático", "Plantou seed de retorno"]
        },
        {
            "number": 11,
            "name": "Direcionamento - Demonstração de Provas",
            "description": "Mostrar antes/depois contando histórias emocionais, não apenas mostrando fotos",
            "maxScore": 10,
            "keyIndicators": ["Mostrou antes/depois", "Contou história emocional", "Usou frequência alta"]
        },
        {
            "number": 12,
            "name": "Direcionamento - Comparação (Barato que Sai Caro)",
            "description": "Demonstrar que procedimento isolado (R$ 1.300) SAI MAIS CARO que tratamento completo (R$ 2.500)",
            "maxScore": 10,
            "keyIndicators": ["Fez comparação de valor", "Explicou barato que sai caro", "Justificou investimento"]
        },
        {
            "number": 13,
            "name": "Direcionamento - Apresentação do Protocolo",
            "description": "Apresentar protocolo usando palavras EXATAS do paciente e quebrando OBJEÇÕES antes do preço",
            "maxScore": 10,
            "keyIndicators": ["Apresentou protocolo", "Usou palavras exatas", "Quebrou objeções", "Plantou seeds"]
        },
        {
            "number": 14,
            "name": "Negociação - Estrutura de Preço e Fechamento",
            "description": "Aplicar estrutura matemática: ancoragem + condição + abatimento + pergunta fechamento + CALAR A BOCA",
            "maxScore": 10,
            "keyIndicators": ["Estrutura correta de preço", "Pergunta de fechamento", "Calou após perguntar", "Devolveu objeções"]
        },
        {
            "number": 15,
            "name": "Recorrência - Planejamento de Retorno",
            "description": "Plantar seeds durante consulta e agendar próxima sessão antes de paciente sair",
            "maxScore": 10,
            "keyIndicators": ["Plantou seeds de retorno", "Tentou agendar", "Criou expectativa de protocolo"]
        }
    ]'::jsonb,
    true
) ON CONFLICT (version) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    methodology_steps = EXCLUDED.methodology_steps,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- ============================================================================
-- ATUALIZAÇÃO DOS PERFIS COMPORTAMENTAIS (DISC) - v3.0
-- Adicionar scripts completos e exemplos práticos
-- ============================================================================

-- Atualizar perfil DOMINANTE
UPDATE behavioral_profiles_config
SET
    characteristics = '[
        "Direto e objetivo, não gosta de enrolação",
        "Foca em resultados rápidos e eficiência",
        "Toma decisões sozinho, sem precisar de muita aprovação",
        "Impaciente com detalhes excessivos",
        "Valoriza timeline claro e ação imediata"
    ]'::jsonb,
    keywords = '["resultado", "rápido", "objetivo", "eficiente", "prático", "direto", "timeline", "ação"]'::jsonb,
    selling_strategy = 'Seja DIRETO ao ponto. Mostre resultados rápidos (7 dias). Evite história pessoal longa na conexão (máximo 5 min). Use frases curtas. Apresente timeline claro: Hoje X, em 30 dias Y. Não seja emotivo.',
    communication_tips = '[
        "Frases curtas e objetivas: Em 7 dias você vê resultado",
        "Mostre antes/depois RAPIDAMENTE sem prolongar",
        "Evite conexão longa: 5 min máximo",
        "Timeline claro: Hoje fazemos X, em 30 dias Y, resultado final em 60 dias",
        "Vá direto ao fechamento sem muita conversa"
    ]'::jsonb,
    fatal_errors = '[
        "Ser muito emotivo ou fazer conexão de 15 minutos",
        "Enrolar antes de mostrar o resultado",
        "Não apresentar timeline claro",
        "Ficar dando voltas antes do preço",
        "Usar linguagem vaga ou imprecisa"
    ]'::jsonb,
    updated_at = now()
WHERE profile_type = 'dominant';

-- Atualizar perfil INFLUENTE
UPDATE behavioral_profiles_config
SET
    characteristics = '[
        "Sociável, expressivo e caloroso",
        "Valoriza muito a opinião de outras pessoas",
        "Busca aprovação social e validação externa",
        "Entusiasmado e animado com tendências",
        "Compartilha experiências nas redes sociais"
    ]'::jsonb,
    keywords = '["pessoas", "social", "opinião", "tendência", "experiência", "amigos", "Instagram", "compartilhar"]'::jsonb,
    selling_strategy = 'Use PROVA SOCIAL massiva (90% das minhas pacientes amaram). Mostre transformações visuais impressionantes. Seja caloroso, expressivo e entusiasmado. Destaque aspecto social: Suas amigas vão perguntar o que você fez!',
    communication_tips = '[
        "Mostre MUITOS casos de sucesso: Olha quantos antes/depois!",
        "Seja caloroso e use expressões: Nossa! Que lindo! Incrível!",
        "Use linguagem visual e emocional",
        "Destaque impacto social: Você vai arrasar nas fotos!",
        "Conte histórias de outras pacientes felizes"
    ]'::jsonb,
    fatal_errors = '[
        "Ser frio, técnico ou distante",
        "Não usar prova social (mostrar poucos casos)",
        "Focar apenas em dados técnicos sem emoção",
        "Não destacar aspecto social da transformação",
        "Ser muito sério ou formal demais"
    ]'::jsonb,
    updated_at = now()
WHERE profile_type = 'influential';

-- Atualizar perfil ESTÁVEL
UPDATE behavioral_profiles_config
SET
    characteristics = '[
        "Paciente, leal e cauteloso",
        "Busca segurança e garantias explícitas",
        "Avesso a riscos e mudanças bruscas",
        "Precisa de tempo para decidir sem pressão",
        "Valoriza relacionamento de longo prazo"
    ]'::jsonb,
    keywords = '["segurança", "garantia", "confiável", "tempo", "cuidado", "risco", "tranquilo", "calma"]'::jsonb,
    selling_strategy = 'Transmita SEGURANÇA total. Ofereça garantias explícitas (aprovado ANVISA, 10 anos de experiência). NÃO pressione para decisão rápida. Seja paciente. Mostre estabilidade da clínica e longevidade.',
    communication_tips = '[
        "Ofereça garantias: Aprovado pela ANVISA, fazemos há 10 anos",
        "Seja paciente: Você pode decidir com calma, sem pressa",
        "Evite pressa: Não precisa decidir agora, pense com tranquilidade",
        "Mostre estabilidade: Estamos aqui há X anos, centenas de casos",
        "Crie vínculo de longo prazo: Vou te acompanhar em cada etapa"
    ]'::jsonb,
    fatal_errors = '[
        "Pressionar para decisão rápida ou imediata",
        "Usar escassez artificial: Só hoje! Última vaga!",
        "Ser agressivo ou insistente no fechamento",
        "Não fornecer garantias ou segurança",
        "Apressar o processo de decisão"
    ]'::jsonb,
    updated_at = now()
WHERE profile_type = 'steady';

-- Atualizar perfil ANALÍTICO
UPDATE behavioral_profiles_config
SET
    characteristics = '[
        "Meticuloso, detalhista e preciso",
        "Busca informações técnicas e científicas",
        "Toma decisões baseadas em dados e estudos",
        "Questiona tudo e investiga profundamente",
        "Quer entender o como e o porquê"
    ]'::jsonb,
    keywords = '["técnica", "estudo", "comprovado", "detalhes", "dados", "pesquisa", "científico", "FDA", "ANVISA"]'::jsonb,
    selling_strategy = 'Forneça DADOS técnicos e estudos científicos. Mostre aprovações (FDA, ANVISA). Seja preciso em números e percentuais. Explique tecnicamente. Responda TODAS as perguntas com detalhes.',
    communication_tips = '[
        "Mostre estudos: Estudos de fase 3 com 95% de satisfação",
        "Seja técnico: O ácido hialurônico que usamos é [MARCA], aprovado FDA",
        "Números precisos: Durabilidade média de 18 meses segundo estudos 2023",
        "Responda todas as perguntas com paciência e detalhes",
        "Forneça materiais para levar: Estudos, artigos científicos"
    ]'::jsonb,
    fatal_errors = '[
        "Ser vago ou impreciso nas informações",
        "Não ter dados ou estudos para mostrar",
        "Usar apenas apelo emocional sem base científica",
        "Evitar responder perguntas técnicas",
        "Ser superficial nas explicações"
    ]'::jsonb,
    updated_at = now()
WHERE profile_type = 'analytical';

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE analysis_frameworks IS 'Frameworks de metodologia de análise versionados. v3.0 usa 15 etapas baseadas nos 6 passos oficiais de vendas consultivas';
COMMENT ON TABLE behavioral_profiles_config IS 'Perfis comportamentais DISC com scripts completos e técnicas específicas de venda para cada perfil';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar framework ativo
SELECT version, name, is_active,
       jsonb_array_length(methodology_steps) as total_steps
FROM analysis_frameworks
ORDER BY created_at DESC
LIMIT 3;

-- Verificar perfis atualizados
SELECT profile_type, display_name,
       jsonb_array_length(characteristics) as total_characteristics,
       updated_at
FROM behavioral_profiles_config
ORDER BY profile_type;
