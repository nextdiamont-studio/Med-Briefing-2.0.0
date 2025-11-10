# Instruções de Instalação - Sistema de Análises

## 1. Instalar Dependências

Execute o seguinte comando para instalar a biblioteca do Google Generative AI:

```bash
npm install @google/generative-ai
```

## 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` e adicione sua chave da API do Gemini:

```env
VITE_SUPABASE_URL=https://pjbthsrnpytdaivchwqe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnRoc3JucHl0ZGFpdmNod3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTc4NDksImV4cCI6MjA3ODA5Mzg0OX0.PkBwrifUm3FV9dfkYGzFfqXyF-qTYaoTiFnQKBKuihU
VITE_GEMINI_API_KEY=SUA_CHAVE_AQUI
```

**Como obter a chave do Gemini:**
1. Acesse https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada
5. Cole no arquivo `.env`

## 3. Executar Migration do Banco de Dados

### Opção A: Usando Supabase Dashboard (Recomendado)

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `supabase/migrations/20250107_create_analysis_tables.sql`
6. Cole no editor SQL
7. Clique em **Run** ou pressione `Ctrl+Enter`
8. Aguarde a mensagem de sucesso

### Opção B: Usando Supabase CLI

Se você tiver o Supabase CLI instalado:

```bash
supabase db push
```

## 4. Popular Dados Iniciais (Opcional mas Recomendado)

### Behavioral Playbook

Execute o seguinte SQL no **SQL Editor** do Supabase para popular os perfis comportamentais:

```sql
-- Inserir perfis comportamentais
INSERT INTO behavioral_playbook (profile, characteristics, fears, motivations, selling_strategies, keywords_to_use, keywords_to_avoid) VALUES
(
  'Dominante',
  ARRAY['Decisivo', 'Direto', 'Focado em resultados', 'Impaciente', 'Competitivo'],
  ARRAY['Perder controle', 'Ser enganado', 'Parecer fraco'],
  ARRAY['Poder', 'Status', 'Resultados rápidos'],
  ARRAY['Seja direto', 'Foque em resultados', 'Mostre autoridade', 'Seja rápido'],
  ARRAY['Resultado', 'Garantido', 'Melhor', 'Liderança', 'Exclusivo'],
  ARRAY['Talvez', 'Vamos ver', 'Depende', 'Não sei']
),
(
  'Influente',
  ARRAY['Sociável', 'Otimista', 'Expressivo', 'Entusiasta', 'Criativo'],
  ARRAY['Rejeição social', 'Perder aprovação', 'Não ser notado'],
  ARRAY['Reconhecimento', 'Experiência', 'Novidade'],
  ARRAY['Seja amigável', 'Conte histórias', 'Mostre casos de sucesso', 'Crie entusiasmo'],
  ARRAY['Incrível', 'Transformador', 'Exclusivo', 'Tendência', 'Popular'],
  ARRAY['Complicado', 'Burocrático', 'Lento']
),
(
  'Estável',
  ARRAY['Calmo', 'Leal', 'Paciente', 'Previsível', 'Cauteloso'],
  ARRAY['Mudança repentina', 'Conflito', 'Incerteza'],
  ARRAY['Segurança', 'Confiança', 'Estabilidade'],
  ARRAY['Seja paciente', 'Ofereça garantias', 'Mostre provas', 'Não pressione'],
  ARRAY['Seguro', 'Garantido', 'Testado', 'Confiável', 'Aprovado'],
  ARRAY['Arriscado', 'Experimental', 'Rápido', 'Urgente']
),
(
  'Analítico',
  ARRAY['Detalhista', 'Lógico', 'Organizado', 'Perfeccionista', 'Cauteloso'],
  ARRAY['Erros', 'Decisões precipitadas', 'Falta de dados'],
  ARRAY['Qualidade', 'Precisão', 'Informação'],
  ARRAY['Forneça dados', 'Seja preciso', 'Permita análise', 'Responda todas as perguntas'],
  ARRAY['Comprovado', 'Científico', 'Detalhado', 'Preciso', 'Eficaz'],
  ARRAY['Emoção', 'Pressão', 'Pressa']
);
```

### Knowledge Base

Execute para criar documentos mestres de exemplo:

```sql
-- Inserir documento mestre básico
INSERT INTO knowledge_base (key, title, content, category, is_active) VALUES
(
  'metodologia_16_passos',
  'Metodologia de 16 Passos para Consultas',
  'Documento com os 16 passos detalhados da metodologia de consulta...',
  'metodologia',
  true
),
(
  'playbook_comportamental',
  'Playbook de Perfis Comportamentais',
  'Guia completo dos 4 perfis comportamentais e como vender para cada um...',
  'comportamental',
  true
);
```

## 5. Adicionar Menu de Navegação

Edite o arquivo `src/components/Sidebar.tsx` e adicione o item de menu para Análises:

```tsx
// Adicione este import no topo
import { Brain } from 'lucide-react'

// Adicione este item no menu
<NavItem to="/analises" icon={Brain}>
  Análises
</NavItem>
```

## 6. Executar a Aplicação

```bash
npm run dev
```

Acesse: http://localhost:5173

## 7. Testar o Sistema

1. Faça login na aplicação
2. No Dashboard, você verá o novo card "Análises com IA"
3. Clique em "Nova Análise" ou acesse `/analises`
4. Teste criar uma análise de performance:
   - Escolha "Análise de Performance"
   - Escolha "Entrada Manual"
   - Preencha os dados:
     - Nome: "João Silva"
     - Resultado: "Venda Perdida"
     - Transcrição: Cole um exemplo de diálogo de consulta
   - Clique em "Analisar Consulta"
   - Aguarde o processamento
   - Visualize o relatório completo

5. Teste criar um briefing SPIN:
   - Escolha "Briefing Inteligente (SPIN)"
   - Preencha:
     - Nome: "Maria Santos"
     - Idade: 35
     - Preocupação: "Rugas na testa e manchas na pele"
   - Clique em "Gerar Briefing Inteligente"
   - Aguarde a geração
   - Visualize o roadmap completo

## Troubleshooting

### Erro: "VITE_GEMINI_API_KEY is not set"
**Solução:** Verifique se você adicionou a chave no arquivo `.env` e reiniciou o servidor de desenvolvimento.

### Erro: "Failed to fetch knowledge base"
**Solução:** Verifique se a migration foi executada corretamente e se as tabelas foram criadas no Supabase.

### Erro: "Failed to create analysis record"
**Solução:** Verifique as políticas RLS no Supabase. O usuário precisa estar autenticado.

### Análise demora muito
**Solução:** A primeira análise pode demorar mais. O Gemini AI pode levar 10-30 segundos para processar análises complexas.

### Erro de CORS
**Solução:** Verifique as configurações de CORS no painel do Supabase (Authentication > URL Configuration).

## Estrutura de Pastas Após Instalação

```
med-briefing/
├── src/
│   ├── components/
│   │   └── analysis/          ← Novos componentes
│   ├── lib/
│   │   ├── analysis-types.ts  ← Novos tipos
│   │   ├── analysis-service.ts ← Nova integração
│   │   └── analysis-db.ts     ← Novo serviço
│   └── pages/
│       ├── AnalysesPage.tsx   ← Nova página
│       └── DashboardPage.tsx  ← Atualizado
├── supabase/
│   └── migrations/
│       └── 20250107_create_analysis_tables.sql ← Nova migration
├── .env                       ← Atualizar com GEMINI_API_KEY
└── IMPLEMENTACAO_ANALISES.md  ← Documentação completa
```

## Próximos Passos

Após a instalação bem-sucedida, consulte `IMPLEMENTACAO_ANALISES.md` para:
- Entender a arquitetura completa
- Ver próximos passos recomendados
- Aprender sobre otimizações
- Conhecer todas as funcionalidades

## Suporte

Em caso de dúvidas:
1. Verifique `IMPLEMENTACAO_ANALISES.md`
2. Consulte logs do console
3. Verifique logs do Supabase
4. Valide variáveis de ambiente
