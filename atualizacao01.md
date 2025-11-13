# ATUALIZAÇÃO 01 - REMOÇÃO COMPLETA DO SISTEMA DE ANÁLISES COM IA

## 📋 ÍNDICE
1. [Visão Geral](#visão-geral)
2. [Objetivo](#objetivo)
3. [Escopo](#escopo)
4. [Sprint 0 - Preparação](#sprint-0---preparação)
5. [Sprint 1 - Limpeza Frontend (Componentes)](#sprint-1---limpeza-frontend-componentes)
6. [Sprint 2 - Limpeza Frontend (Páginas e Rotas)](#sprint-2---limpeza-frontend-páginas-e-rotas)
7. [Sprint 3 - Limpeza de Serviços](#sprint-3---limpeza-de-serviços)
8. [Sprint 4 - Limpeza de Edge Functions](#sprint-4---limpeza-de-edge-functions)
9. [Sprint 5 - Criação do Exterminator SQL](#sprint-5---criação-do-exterminator-sql)
10. [Sprint 6 - Execução do Exterminator](#sprint-6---execução-do-exterminator)
11. [Sprint 7 - Testes e Validação Final](#sprint-7---testes-e-validação-final)
12. [Rollback Plan](#rollback-plan)

---

## 🎯 VISÃO GERAL

Esta atualização remove completamente o sistema de análises com IA do Med Briefing 2.0, mantendo **APENAS** o sistema de gravação e transcrição de consultas.

### O que será REMOVIDO:
- ❌ Todas as páginas de análise (AnalysesPage, BriefingsPage, ReportsPage, BriefingSPINPage)
- ❌ Todos os componentes de análise (9 componentes em `/analysis/`)
- ❌ Todos os serviços de análise (5 arquivos de serviços)
- ❌ Todas as edge functions de análise (4 functions)
- ❌ Todas as tabelas de análise no Supabase (19 tabelas + 4 enums)
- ❌ Todos os links de navegação para análises

### O que será MANTIDO:
- ✅ Sistema completo de gravação (RecordingsPage)
- ✅ Sistema de transcrição com IA
- ✅ Dashboard (sem métricas de análise)
- ✅ Configurações e autenticação
- ✅ Toda a estrutura de usuários e perfis

---

## 🎯 OBJETIVO

Remover todo o sistema de análises com IA, mantendo apenas o fluxo:
1. Usuário faz gravação de consulta
2. Usuário solicita transcrição
3. Usuário visualiza e baixa transcrição

**O sistema NÃO fará mais:**
- Análise de performance de consultas
- Geração de briefings SPIN
- Relatórios com gráficos e métricas
- Perfis comportamentais
- Coaching e scripts de venda

---

## 📦 ESCOPO

### Impacto Total:
- **~30 arquivos** frontend removidos
- **~8.000 linhas** de código removidas
- **19 tabelas** de banco de dados deletadas
- **4 edge functions** removidas
- **4 enums** SQL deletados

### Tempo Estimado:
- **Total**: 4-6 horas de execução minuciosa
- **Por Sprint**: 30-60 minutos

---

## 🚀 SPRINT 0 - PREPARAÇÃO

### Objetivo:
Criar backup completo e ambiente seguro para execução

### Duração Estimada: 30 minutos

### Checklist de Execução:

#### 0.1 - Backup do Código
- [ ] Criar branch de segurança: `git checkout -b backup-before-removal`
- [ ] Commit atual: `git add . && git commit -m "Backup: Estado antes da remoção de análises"`
- [ ] Push backup: `git push origin backup-before-removal`
- [ ] Voltar para master: `git checkout master`
- [ ] Criar branch de trabalho: `git checkout -b feature/remove-analysis-system`

#### 0.2 - Backup do Banco de Dados Supabase
- [ ] Acessar Supabase Dashboard
- [ ] Ir em Database > Backups
- [ ] Criar backup manual com nome: `backup-antes-remocao-analises-{DATA}`
- [ ] Aguardar confirmação de backup completo
- [ ] Anotar ID do backup: `___________________`

#### 0.3 - Documentar Estado Atual
- [ ] Executar e salvar resultado: `git status > pre-removal-git-status.txt`
- [ ] Listar arquivos a remover: `ls -R src/components/analysis/ > files-to-remove.txt`
- [ ] Contar linhas de código atual: `find src -name "*.tsx" -o -name "*.ts" | xargs wc -l > pre-removal-loc.txt`

#### 0.4 - Verificar Dependências Críticas
- [ ] Verificar se RecordingsPage importa algo de `analysis/`:
  ```bash
  grep -r "analysis" src/pages/RecordingsPage.tsx
  ```
- [ ] Verificar se TranscriptionModal importa algo de `analysis/`:
  ```bash
  grep -r "analysis" src/components/TranscriptionModal.tsx
  ```
- [ ] Verificar se tabela `recordings` tem FK para `analyses`:
  ```sql
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'recordings' AND column_name = 'analysis_id';
  ```

#### 0.5 - Preparar Ambiente de Testes
- [ ] Parar servidor de desenvolvimento (se rodando): `Ctrl+C`
- [ ] Limpar node_modules: `rm -rf node_modules`
- [ ] Reinstalar dependências: `npm install`
- [ ] Rodar build inicial: `npm run build` (deve compilar sem erros)

### Critérios de Sucesso Sprint 0:
- ✅ Backup do código criado em branch separada
- ✅ Backup do banco de dados Supabase confirmado
- ✅ Documentação do estado atual gerada
- ✅ Nenhuma dependência crítica identificada entre recordings e analyses
- ✅ Build atual compilando sem erros

---

## 🧹 SPRINT 1 - LIMPEZA FRONTEND (COMPONENTES)

### Objetivo:
Remover todos os componentes relacionados a análises

### Duração Estimada: 45 minutos

### 1.1 - Remover Componentes de Análise (Pasta `/analysis/`)

#### Arquivos a Deletar:
```bash
# Execute um por vez e verifique cada remoção
```

- [ ] **AnalysisUploadModal.tsx** (25 KB)
  ```bash
  rm src/components/analysis/AnalysisUploadModal.tsx
  git status  # Confirmar remoção
  ```

- [ ] **BehavioralProfileCard.tsx** (6 KB)
  ```bash
  rm src/components/analysis/BehavioralProfileCard.tsx
  git status
  ```

- [ ] **LostSaleReport.tsx** (19 KB)
  ```bash
  rm src/components/analysis/LostSaleReport.tsx
  git status
  ```

- [ ] **ProfileBadge.tsx** (2 KB)
  ```bash
  rm src/components/analysis/ProfileBadge.tsx
  git status
  ```

- [ ] **RealizedSaleReport.tsx** (19 KB)
  ```bash
  rm src/components/analysis/RealizedSaleReport.tsx
  git status
  ```

- [ ] **ScoreDisplay.tsx** (3 KB)
  ```bash
  rm src/components/analysis/ScoreDisplay.tsx
  git status
  ```

- [ ] **Section.tsx** (2 KB)
  ```bash
  rm src/components/analysis/Section.tsx
  git status
  ```

- [ ] **SpinQualificationInterface.tsx** (18 KB)
  ```bash
  rm src/components/analysis/SpinQualificationInterface.tsx
  git status
  ```

- [ ] **StepAccordion.tsx** (7 KB)
  ```bash
  rm src/components/analysis/StepAccordion.tsx
  git status
  ```

#### Validação:
- [ ] Verificar pasta vazia: `ls src/components/analysis/`
  - Resultado esperado: `ls: src/components/analysis/: No such file or directory`

- [ ] Remover pasta: `rmdir src/components/analysis/`

### 1.2 - Remover Componente BriefingSPINResult

- [ ] **BriefingSPINResult.tsx**
  ```bash
  rm src/components/BriefingSPINResult.tsx
  git status
  ```

### 1.3 - Commit Parcial (Checkpoint)

```bash
git add -A
git commit -m "Sprint 1: Remove componentes de análise (10 arquivos)"
```

### 1.4 - Teste de Compilação

- [ ] Tentar compilar: `npm run build`
  - **Esperado**: Vai falhar com erros de imports não encontrados
  - **Isso é normal**: Vamos corrigir nos próximos sprints

### Critérios de Sucesso Sprint 1:
- ✅ 10 arquivos de componentes removidos
- ✅ Pasta `src/components/analysis/` deletada
- ✅ Commit de checkpoint criado
- ✅ Erros de compilação identificados (lista dos imports quebrados)

---

## 📄 SPRINT 2 - LIMPEZA FRONTEND (PÁGINAS E ROTAS)

### Objetivo:
Remover páginas de análise e corrigir rotas e navegação

### Duração Estimada: 60 minutos

### 2.1 - Remover Páginas de Análise

#### Arquivos a Deletar:

- [ ] **AnalysesPage.tsx** (432 linhas)
  ```bash
  rm src/pages/AnalysesPage.tsx
  git status
  ```

- [ ] **BriefingsPage.tsx** (230 linhas)
  ```bash
  rm src/pages/BriefingsPage.tsx
  git status
  ```

- [ ] **ReportsPage.tsx** (470 linhas)
  ```bash
  rm src/pages/ReportsPage.tsx
  git status
  ```

- [ ] **BriefingSPINPage.tsx** (368 linhas)
  ```bash
  rm src/pages/BriefingSPINPage.tsx
  git status
  ```

### 2.2 - Limpar App.tsx (Rotas)

Arquivo: `src/App.tsx`

#### Passo 1: Remover Imports
Localizar e deletar as linhas:

```typescript
// LINHA ~8
import BriefingsPage from './pages/BriefingsPage'

// LINHA ~11
import { AnalysesPage } from './pages/AnalysesPage'
```

- [ ] Remover import de BriefingsPage
- [ ] Remover import de AnalysesPage

#### Passo 2: Remover Rotas
Localizar e deletar as linhas dentro do `<Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>`:

```typescript
// LINHA ~51-52
<Route path="analises" element={<AnalysesPage />} />
<Route path="briefings" element={<BriefingsPage />} />
```

- [ ] Remover rota `/analises`
- [ ] Remover rota `/briefings`

#### App.tsx - Estado Final Esperado:
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './hooks/useAuth'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RecordingsPage from './pages/RecordingsPage'
import SettingsPage from './pages/SettingsPage'
import Layout from './components/Layout'
import './index.css'

const queryClient = new QueryClient()

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="gravacoes" element={<RecordingsPage />} />
                <Route path="configuracoes" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
```

- [ ] Validar arquivo App.tsx com estado final esperado

### 2.3 - Limpar Sidebar.tsx (Navegação)

Arquivo: `src/components/Sidebar.tsx`

#### Passo 1: Remover Import do Ícone Brain
Localizar linha ~6 e remover `Brain` da lista:

```typescript
// ANTES
import {
  LayoutDashboard,
  Mic,
  Settings,
  Brain,  // <- REMOVER
  Sparkles,
  X,
} from 'lucide-react'

// DEPOIS
import {
  LayoutDashboard,
  Mic,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
```

- [ ] Remover `Brain` do import de lucide-react

#### Passo 2: Remover Link de Navegação
Localizar linha ~19-22 e remover linha de Análises:

```typescript
// ANTES
const clinicNavigation = [
  { name: 'Gravações', href: '/gravacoes', icon: Mic },
  { name: 'Análises', href: '/analises', icon: Brain }, // <- REMOVER
]

// DEPOIS
const clinicNavigation = [
  { name: 'Gravações', href: '/gravacoes', icon: Mic },
]
```

- [ ] Remover objeto de navegação "Análises"

### 2.4 - Limpar DashboardPage.tsx

Arquivo: `src/pages/DashboardPage.tsx`

#### Passo 1: Remover Imports de Análise

Localizar e deletar linhas ~21-23:

```typescript
// REMOVER ESTAS LINHAS
import type { DashboardMetrics, Analysis } from '../lib/analysis-types'
import { getDashboardMetrics, getUserAnalyses } from '../lib/analysis-db'
import { ProfileBadge } from '../components/analysis/ProfileBadge'
```

- [ ] Remover import de `analysis-types`
- [ ] Remover import de `analysis-db`
- [ ] Remover import de `ProfileBadge`

#### Passo 2: Remover State de Análises

Localizar e deletar linhas ~35-36:

```typescript
// REMOVER ESTAS LINHAS
const [analysisMetrics, setAnalysisMetrics] = useState<DashboardMetrics | null>(null)
const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([])
```

- [ ] Remover state `analysisMetrics`
- [ ] Remover state `recentAnalyses`

#### Passo 3: Limpar Função loadDashboardData

Localizar função `loadDashboardData` (linha ~45) e remover chamadas de análise:

```typescript
// ANTES
const loadDashboardData = async () => {
  try {
    setIsLoading(true)

    const [recordingsData, metricsData, analysesData] = await Promise.all([
      supabase.from('recordings')...get(),
      getDashboardMetrics(user?.id!),  // <- REMOVER
      getUserAnalyses(user?.id!, 5)    // <- REMOVER
    ])

    setRecordings(recordingsData.data || [])
    setAnalysisMetrics(metricsData)     // <- REMOVER
    setRecentAnalyses(analysesData)     // <- REMOVER
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error)
  } finally {
    setIsLoading(false)
  }
}

// DEPOIS
const loadDashboardData = async () => {
  try {
    setIsLoading(true)

    const { data: recordingsData, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error
    setRecordings(recordingsData || [])
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error)
  } finally {
    setIsLoading(false)
  }
}
```

- [ ] Remover chamadas para `getDashboardMetrics` e `getUserAnalyses`
- [ ] Remover setters de `analysisMetrics` e `recentAnalyses`

#### Passo 4: Remover Seção de Métricas de IA

Localizar e deletar bloco completo (linhas ~106-148):

```typescript
// REMOVER TODO ESTE BLOCO
{/* Métricas de Análise (Novo Sistema) */}
{analysisMetrics && analysisMetrics.total_analyses > 0 && (
  <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
    ...
  </div>
)}
```

- [ ] Remover card completo de métricas de IA

#### Passo 5: Remover Botão "Análises/Relatórios"

Localizar e deletar botão (linhas ~89-95):

```typescript
// REMOVER ESTE BOTÃO
<button
  onClick={() => navigate('/analises')}
  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600..."
>
  <BarChart3 className="w-5 h-5" />
  Análises/Relatórios
</button>
```

- [ ] Remover botão de navegação para Análises

#### Passo 6: Remover Seção "Análises Recentes"

Localizar e deletar seção completa (linhas ~189-287):

```typescript
// REMOVER TODA ESTA SEÇÃO
{/* Análises Recentes */}
<div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
    Análises Recentes
  </h2>
  ...
</div>
```

- [ ] Remover card completo de "Análises Recentes"

#### Passo 7: Remover Quick Action Card "Análises com IA"

Localizar e deletar (linhas ~291-297):

```typescript
// REMOVER ESTE CARD
<QuickActionCard
  title="Análises com IA"
  description="Visualizar e criar análises de consultas com inteligência artificial"
  icon={Brain}
  onClick={() => navigate('/analises')}
  gradient="from-purple-500 to-purple-600"
/>
```

- [ ] Remover QuickActionCard de Análises

### 2.5 - Commit Parcial (Checkpoint)

```bash
git add -A
git commit -m "Sprint 2: Remove páginas de análise e limpa rotas/navegação"
```

### 2.6 - Teste de Compilação

- [ ] Tentar compilar: `npm run build`
  - **Esperado**: Ainda vai falhar (serviços não encontrados)

### Critérios de Sucesso Sprint 2:
- ✅ 4 páginas de análise removidas
- ✅ App.tsx sem rotas de análise
- ✅ Sidebar.tsx sem link de Análises
- ✅ DashboardPage.tsx limpo (sem imports/states/funções de análise)
- ✅ Commit de checkpoint criado

---

## 🔧 SPRINT 3 - LIMPEZA DE SERVIÇOS

### Objetivo:
Remover todos os serviços relacionados a análises

### Duração Estimada: 30 minutos

### 3.1 - Remover Serviços de Análise

#### Arquivos a Deletar:

- [ ] **analysis-service.ts** (587 linhas)
  ```bash
  rm src/lib/analysis-service.ts
  git status
  ```

- [ ] **analysis-db.ts** (967 linhas)
  ```bash
  rm src/lib/analysis-db.ts
  git status
  ```

- [ ] **analysis-types.ts** (368 linhas)
  ```bash
  rm src/lib/analysis-types.ts
  git status
  ```

- [ ] **briefing-spin-service.ts** (276 linhas)
  ```bash
  rm src/lib/briefing-spin-service.ts
  git status
  ```

- [ ] **reports-service.ts** (249 linhas)
  ```bash
  rm src/lib/reports-service.ts
  git status
  ```

### 3.2 - Verificar Imports Órfãos

Buscar por imports quebrados no código restante:

```bash
grep -r "analysis-service" src/
grep -r "analysis-db" src/
grep -r "analysis-types" src/
grep -r "briefing-spin-service" src/
grep -r "reports-service" src/
```

- [ ] Executar buscas acima
- [ ] Se encontrar imports, remover manualmente dos arquivos

### 3.3 - Limpar RecordingsPage.tsx (Verificação)

Arquivo: `src/pages/RecordingsPage.tsx`

Verificar se há imports de análise:

```bash
grep -n "analysis" src/pages/RecordingsPage.tsx
```

Se encontrar referências (provável linha ~24):

```typescript
// Se existir, REMOVER:
import { AnalysisUploadModal } from '../components/analysis/AnalysisUploadModal'
```

E remover estados relacionados:

```typescript
// Se existir, REMOVER:
const [showAnalysisModal, setShowAnalysisModal] = useState(false)
const [analysisTranscription, setAnalysisTranscription] = useState<string>('')
```

E remover modal no JSX:

```typescript
// Se existir, REMOVER:
<AnalysisUploadModal
  isOpen={showAnalysisModal}
  onClose={() => {...}}
  onSuccess={() => {...}}
  initialTranscription={analysisTranscription}
/>
```

- [ ] Verificar e limpar RecordingsPage.tsx

### 3.4 - Limpar TranscriptionModal.tsx (Verificação)

Arquivo: `src/components/TranscriptionModal.tsx`

Verificar prop `onAnalyze`:

```typescript
// Se existir na interface, REMOVER:
interface TranscriptionModalProps {
  recording: Recording
  onClose: () => void
  onAnalyze?: (transcriptionText: string) => void  // <- REMOVER
}

// Se existir função, REMOVER:
const handleAnalyze = () => {
  if (transcriptionText && onAnalyze) {
    onAnalyze(transcriptionText)
  }
}

// Se existir botão no JSX, REMOVER:
{transcriptionText && onAnalyze && (
  <button onClick={handleAnalyze}>
    Fazer Análise Agora
  </button>
)}
```

- [ ] Verificar e limpar TranscriptionModal.tsx

### 3.5 - Verificar package.json

Verificar se `recharts` é usado apenas em análises:

```bash
grep -r "recharts" src/ --exclude-dir=node_modules
```

Se resultado mostrar apenas arquivos já removidos:

- [ ] Abrir `package.json`
- [ ] Procurar linha com `"recharts"`
- [ ] Remover linha completa
- [ ] Salvar arquivo

### 3.6 - Reinstalar Dependências

```bash
npm install
```

- [ ] Executar `npm install` para atualizar lock file

### 3.7 - Commit Parcial (Checkpoint)

```bash
git add -A
git commit -m "Sprint 3: Remove serviços de análise e limpa dependências"
```

### 3.8 - Teste de Compilação

- [ ] Tentar compilar: `npm run build`
  - **Esperado**: Deve compilar SEM ERROS agora!
  - Se falhar, revisar erros e corrigir imports órfãos

### Critérios de Sucesso Sprint 3:
- ✅ 5 arquivos de serviços removidos
- ✅ Nenhum import órfão encontrado
- ✅ RecordingsPage e TranscriptionModal limpos
- ✅ package.json atualizado (se necessário)
- ✅ `npm run build` compilando sem erros
- ✅ Commit de checkpoint criado

---

## ☁️ SPRINT 4 - LIMPEZA DE EDGE FUNCTIONS

### Objetivo:
Remover edge functions do Supabase relacionadas a análises

### Duração Estimada: 20 minutos

### 4.1 - Verificar Existência das Edge Functions

```bash
ls -la supabase/functions/
```

- [ ] Executar comando acima
- [ ] Anotar quais pastas existem:
  - [ ] `analyze-consultation/`
  - [ ] `analyze-performance/`
  - [ ] `generate-briefing/`
  - [ ] `generate-spin-briefing/`

### 4.2 - Remover Edge Functions (Se Existirem)

#### Se as pastas existirem:

- [ ] **analyze-consultation/**
  ```bash
  rm -rf supabase/functions/analyze-consultation/
  git status
  ```

- [ ] **analyze-performance/**
  ```bash
  rm -rf supabase/functions/analyze-performance/
  git status
  ```

- [ ] **generate-briefing/**
  ```bash
  rm -rf supabase/functions/generate-briefing/
  git status
  ```

- [ ] **generate-spin-briefing/**
  ```bash
  rm -rf supabase/functions/generate-spin-briefing/
  git status
  ```

#### Se as pastas NÃO existirem:

- [ ] Anotar: "Edge functions já foram removidas anteriormente"

### 4.3 - Verificar Configuração do Supabase

Arquivo: `supabase/config.toml`

Verificar se há referências às edge functions:

```bash
grep -n "analyze-consultation\|analyze-performance\|generate-briefing\|generate-spin-briefing" supabase/config.toml
```

- [ ] Se encontrar referências, remover manualmente do arquivo

### 4.4 - Commit Parcial (Checkpoint)

```bash
git add -A
git commit -m "Sprint 4: Remove edge functions de análise do Supabase"
```

### Critérios de Sucesso Sprint 4:
- ✅ Edge functions removidas (ou confirmadas como já removidas)
- ✅ config.toml verificado e limpo
- ✅ Commit de checkpoint criado

---

## 💀 SPRINT 5 - CRIAÇÃO DO EXTERMINATOR SQL

### Objetivo:
Criar script SQL para limpar todas as tabelas e estruturas de análise do banco de dados

### Duração Estimada: 45 minutos

### 5.1 - Criar Arquivo Exterminator.sql

- [ ] Criar arquivo: `supabase/migrations/Exterminator.sql`

### 5.2 - Escrever Script SQL Completo

Copiar e colar o seguinte conteúdo no arquivo `Exterminator.sql`:

```sql
-- ============================================================
-- EXTERMINATOR.SQL - REMOÇÃO COMPLETA DO SISTEMA DE ANÁLISES
-- ============================================================
--
-- ATENÇÃO: Este script é DESTRUTIVO e IRREVERSÍVEL!
--
-- Propósito: Remover completamente o sistema de análises com IA,
-- mantendo APENAS o sistema de gravação e transcrição.
--
-- Remove:
--   - 19 tabelas de análises
--   - 4 enums personalizados
--   - Todas as policies RLS relacionadas
--   - Todos os indexes relacionados
--
-- Mantém:
--   - Tabela recordings (gravações e transcrições)
--   - Sistema de autenticação (auth.users)
--   - Sistema de perfis (profiles)
--   - Todas as tabelas de sistema do Supabase
--
-- Backup: SEMPRE faça backup antes de executar!
-- Data de criação: {INSERIR DATA}
-- Versão: 1.0.0
-- ============================================================

-- Iniciar transação
BEGIN;

-- ============================================================
-- FASE 1: REMOVER FOREIGN KEY DE RECORDINGS
-- ============================================================
-- A tabela recordings tem FK para analyses.id
-- Precisamos remover essa coluna para manter recordings funcionando

DO $$
BEGIN
  -- Verificar se coluna existe antes de tentar remover
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'recordings'
    AND column_name = 'analysis_id'
  ) THEN
    ALTER TABLE recordings DROP COLUMN analysis_id;
    RAISE NOTICE '✓ Coluna analysis_id removida de recordings';
  ELSE
    RAISE NOTICE '⊘ Coluna analysis_id não existe em recordings (OK)';
  END IF;
END $$;

-- ============================================================
-- FASE 2: REMOVER TABELAS DE ANÁLISE (ORDEM REVERSA DE FK)
-- ============================================================
-- Ordem de remoção respeitando dependências de foreign keys

RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'FASE 2: Removendo tabelas de análise...';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- 2.1 - Tabelas FILHAS de lost_sale_details
DROP TABLE IF EXISTS training_scripts CASCADE;
RAISE NOTICE '✓ training_scripts removida';

DROP TABLE IF EXISTS identified_strengths CASCADE;
RAISE NOTICE '✓ identified_strengths removida';

DROP TABLE IF EXISTS errors_for_correction CASCADE;
RAISE NOTICE '✓ errors_for_correction removida';

DROP TABLE IF EXISTS final_coaching_plans CASCADE;
RAISE NOTICE '✓ final_coaching_plans removida';

DROP TABLE IF EXISTS critical_errors CASCADE;
RAISE NOTICE '✓ critical_errors removida';

-- 2.2 - Tabela lost_sale_details
DROP TABLE IF EXISTS lost_sale_details CASCADE;
RAISE NOTICE '✓ lost_sale_details removida';

-- 2.3 - Tabelas FILHAS de critical_observations
DROP TABLE IF EXISTS essential_control_points CASCADE;
RAISE NOTICE '✓ essential_control_points removida';

DROP TABLE IF EXISTS fatal_errors_checklist CASCADE;
RAISE NOTICE '✓ fatal_errors_checklist removida';

-- 2.4 - Tabela critical_observations
DROP TABLE IF EXISTS critical_observations CASCADE;
RAISE NOTICE '✓ critical_observations removida';

-- 2.5 - Tabelas FILHAS de analysis_phases
DROP TABLE IF EXISTS analysis_steps CASCADE;
RAISE NOTICE '✓ analysis_steps removida';

-- 2.6 - Tabela analysis_phases
DROP TABLE IF EXISTS analysis_phases CASCADE;
RAISE NOTICE '✓ analysis_phases removida';

-- 2.7 - Tabela performance_analyses
DROP TABLE IF EXISTS performance_analyses CASCADE;
RAISE NOTICE '✓ performance_analyses removida';

-- 2.8 - Tabelas FILHAS de consultation_phases
DROP TABLE IF EXISTS consultation_steps CASCADE;
RAISE NOTICE '✓ consultation_steps removida';

-- 2.9 - Tabela consultation_phases
DROP TABLE IF EXISTS consultation_phases CASCADE;
RAISE NOTICE '✓ consultation_phases removida';

-- 2.10 - Tabela spin_qualifications
DROP TABLE IF EXISTS spin_qualifications CASCADE;
RAISE NOTICE '✓ spin_qualifications removida';

-- 2.11 - Tabela MÃE analyses (CASCADE remove todas as dependências restantes)
DROP TABLE IF EXISTS analyses CASCADE;
RAISE NOTICE '✓ analyses removida (CASCADE)';

-- 2.12 - Sistema alternativo de Briefing SPIN
DROP TABLE IF EXISTS briefing_spin_analyses CASCADE;
RAISE NOTICE '✓ briefing_spin_analyses removida';

-- 2.13 - Tabelas de referência (opcional manter)
DROP TABLE IF EXISTS behavioral_playbook CASCADE;
RAISE NOTICE '✓ behavioral_playbook removida';

DROP TABLE IF EXISTS knowledge_base CASCADE;
RAISE NOTICE '✓ knowledge_base removida';

-- ============================================================
-- FASE 3: REMOVER ENUMS PERSONALIZADOS
-- ============================================================

RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'FASE 3: Removendo enums personalizados...';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

DROP TYPE IF EXISTS analysis_type CASCADE;
RAISE NOTICE '✓ ENUM analysis_type removido';

DROP TYPE IF EXISTS consultation_outcome CASCADE;
RAISE NOTICE '✓ ENUM consultation_outcome removido';

DROP TYPE IF EXISTS behavioral_profile CASCADE;
RAISE NOTICE '✓ ENUM behavioral_profile removido';

DROP TYPE IF EXISTS performance_rating CASCADE;
RAISE NOTICE '✓ ENUM performance_rating removido';

-- ============================================================
-- FASE 4: VERIFICAÇÕES DE INTEGRIDADE
-- ============================================================

RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'FASE 4: Verificações de integridade...';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- Verificar se recordings ainda existe e está funcional
DO $$
DECLARE
  rec_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rec_count FROM recordings;
  RAISE NOTICE '✓ Tabela recordings OK (%% registros)', rec_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '✗ ERRO: Tabela recordings corrompida! %', SQLERRM;
END $$;

-- Verificar se auth.users ainda existe
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  RAISE NOTICE '✓ Sistema de autenticação OK (%% usuários)', user_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '✗ ERRO: Sistema de autenticação corrompido! %', SQLERRM;
END $$;

-- Verificar se profiles existe
DO $$
DECLARE
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  RAISE NOTICE '✓ Tabela profiles OK (%% perfis)', profile_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⊘ Tabela profiles não existe (OK se não era usada)';
END $$;

-- ============================================================
-- FASE 5: LIMPEZA DE STORAGE (OPCIONAL)
-- ============================================================
-- Se houver arquivos de análise no storage, limpar policies

RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE 'FASE 5: Limpando policies de storage...';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- Verificar e limpar bucket de análises (se existir)
DO $$
BEGIN
  DELETE FROM storage.buckets WHERE name = 'analyses' OR name = 'briefings';
  RAISE NOTICE '✓ Buckets de análise removidos (se existiam)';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⊘ Nenhum bucket de análise encontrado (OK)';
END $$;

-- ============================================================
-- RESUMO FINAL
-- ============================================================

RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE '✓✓✓ EXTERMINATOR EXECUTADO COM SUCESSO! ✓✓✓';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
RAISE NOTICE '';
RAISE NOTICE 'Removido:';
RAISE NOTICE '  - 19 tabelas de análises';
RAISE NOTICE '  - 4 enums personalizados';
RAISE NOTICE '  - Todas as policies RLS relacionadas';
RAISE NOTICE '';
RAISE NOTICE 'Mantido:';
RAISE NOTICE '  ✓ Sistema de gravações (recordings)';
RAISE NOTICE '  ✓ Sistema de autenticação (auth.users)';
RAISE NOTICE '  ✓ Sistema de perfis (profiles)';
RAISE NOTICE '';
RAISE NOTICE 'Próximos passos:';
RAISE NOTICE '  1. Testar gravação de áudio';
RAISE NOTICE '  2. Testar transcrição';
RAISE NOTICE '  3. Verificar dashboard';
RAISE NOTICE '  4. Fazer backup pós-limpeza';
RAISE NOTICE '';
RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- Commitar transação
COMMIT;
```

- [ ] Criar arquivo `Exterminator.sql` com conteúdo acima

### 5.3 - Adicionar Data de Criação

- [ ] Substituir `{INSERIR DATA}` pela data atual no cabeçalho do arquivo

### 5.4 - Revisar Script

Checklist de revisão do script:

- [ ] Verifica se `analysis_id` existe antes de remover
- [ ] Remove tabelas na ordem correta (filhas antes de pais)
- [ ] Usa `CASCADE` para garantir limpeza completa
- [ ] Usa `IF EXISTS` para evitar erros se tabelas não existirem
- [ ] Faz verificações de integridade após remoção
- [ ] Está dentro de uma transação (BEGIN/COMMIT)
- [ ] Tem mensagens de progresso (RAISE NOTICE)

### 5.5 - Commit do Exterminator

```bash
git add supabase/migrations/Exterminator.sql
git commit -m "Sprint 5: Cria script Exterminator.sql para limpeza do banco"
```

### Critérios de Sucesso Sprint 5:
- ✅ Arquivo `Exterminator.sql` criado
- ✅ Script revisado e validado
- ✅ Data de criação adicionada
- ✅ Commit criado

---

## 💣 SPRINT 6 - EXECUÇÃO DO EXTERMINATOR

### Objetivo:
Executar o script SQL no Supabase para remover todas as tabelas de análise

### Duração Estimada: 30 minutos

### ⚠️ ATENÇÃO MÁXIMA
**ESTE SPRINT É IRREVERSÍVEL!**
**NÃO execute sem ter backup confirmado!**

### 6.1 - Verificação Final de Backup

ANTES de continuar, confirmar:

- [ ] ✅ Backup do código em branch separada existe
- [ ] ✅ Backup do Supabase foi criado e confirmado
- [ ] ✅ ID do backup anotado: `___________________`
- [ ] ✅ Todos os commits anteriores foram feitos
- [ ] ✅ Código frontend já foi limpo (Sprints 1-4)

### 6.2 - Preparação para Execução

- [ ] Abrir Supabase Dashboard em nova aba
- [ ] Fazer login no projeto: `___________________` (anotar nome do projeto)
- [ ] Navegar para: **SQL Editor**

### 6.3 - Criar Backup Adicional (Segurança Extra)

Antes de executar Exterminator, exportar esquema atual:

1. No Supabase Dashboard:
   - [ ] Ir em **Database** > **Backups**
   - [ ] Clicar em **Create backup**
   - [ ] Nome: `pre-exterminator-backup-{DATA-HORA}`
   - [ ] Aguardar conclusão
   - [ ] Anotar ID: `___________________`

2. Exportar estrutura das tabelas (opcional):
   - [ ] Ir em **SQL Editor**
   - [ ] Executar e salvar resultado:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```
   - [ ] Copiar resultado e salvar em: `pre-exterminator-tables.txt`

### 6.4 - Execução do Exterminator (MOMENTO CRÍTICO)

#### Passo 1: Carregar Script

- [ ] No SQL Editor, clicar em **New query**
- [ ] Abrir arquivo local: `supabase/migrations/Exterminator.sql`
- [ ] Copiar TODO o conteúdo
- [ ] Colar no SQL Editor do Supabase

#### Passo 2: Revisão Final

Ler TODO o script novamente e confirmar:

- [ ] Entendo que isso vai DELETAR 19 tabelas
- [ ] Entendo que isso é IRREVERSÍVEL
- [ ] Tenho BACKUP confirmado
- [ ] O script está correto (não foi modificado)

#### Passo 3: EXECUTAR

- [ ] Respirar fundo
- [ ] Clicar em **RUN** (ou Ctrl+Enter)
- [ ] Aguardar execução (pode levar 30-60 segundos)

#### Passo 4: Verificar Resultado

O resultado deve mostrar mensagens de progresso:

```
✓ Coluna analysis_id removida de recordings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 2: Removendo tabelas de análise...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ training_scripts removida
✓ identified_strengths removida
...
✓✓✓ EXTERMINATOR EXECUTADO COM SUCESSO! ✓✓✓
```

- [ ] Verificar se TODAS as mensagens são `✓` (sucesso)
- [ ] Verificar se NÃO há mensagens de ERRO
- [ ] Verificar se mensagem final "EXECUTADO COM SUCESSO" apareceu

#### Passo 5: Se Houver Erro

Se houver algum erro:

1. [ ] **NÃO executar novamente imediatamente**
2. [ ] Copiar mensagem de erro completa
3. [ ] Salvar em arquivo: `exterminator-error.txt`
4. [ ] Verificar qual tabela causou erro
5. [ ] Tentar remover manualmente:
   ```sql
   DROP TABLE IF EXISTS [nome_da_tabela] CASCADE;
   ```
6. [ ] Se necessário, restaurar backup e revisar script

### 6.5 - Verificações Pós-Execução

#### Verificação 1: Tabelas Removidas

Executar no SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%analysis%'
   OR table_name LIKE '%briefing%'
   OR table_name LIKE '%spin%'
   OR table_name = 'analyses'
ORDER BY table_name;
```

- [ ] Executar query acima
- [ ] **Resultado esperado**: 0 linhas (nenhuma tabela encontrada)
- [ ] Se encontrar tabelas, anotar quais: `___________________`

#### Verificação 2: Recordings Intacto

Executar no SQL Editor:

```sql
SELECT COUNT(*) as total_recordings,
       COUNT(DISTINCT user_id) as total_users
FROM recordings;
```

- [ ] Executar query acima
- [ ] **Resultado esperado**: Números iguais aos de antes
- [ ] Anotar: Total de gravações: `___`  Total de usuários: `___`

#### Verificação 3: Coluna analysis_id Removida

Executar no SQL Editor:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'recordings'
AND column_name = 'analysis_id';
```

- [ ] Executar query acima
- [ ] **Resultado esperado**: 0 linhas (coluna não existe mais)

#### Verificação 4: Enums Removidos

Executar no SQL Editor:

```sql
SELECT typname
FROM pg_type
WHERE typname IN ('analysis_type', 'consultation_outcome', 'behavioral_profile', 'performance_rating');
```

- [ ] Executar query acima
- [ ] **Resultado esperado**: 0 linhas (enums não existem mais)

### 6.6 - Criar Backup Pós-Exterminator

- [ ] Ir em **Database** > **Backups**
- [ ] Clicar em **Create backup**
- [ ] Nome: `pos-exterminator-clean-{DATA-HORA}`
- [ ] Aguardar conclusão
- [ ] Anotar ID: `___________________`

### 6.7 - Documentar Execução

Criar arquivo `exterminator-execution-report.txt`:

```
RELATÓRIO DE EXECUÇÃO DO EXTERMINATOR
======================================

Data/Hora: {INSERIR}
Executado por: {INSERIR NOME}
Projeto Supabase: {INSERIR}

BACKUPS:
- Backup pré-execução: {ID}
- Backup pós-execução: {ID}

RESULTADO:
- Status: [✓ SUCESSO / ✗ ERRO]
- Tabelas removidas: 19
- Enums removidos: 4
- Tempo de execução: {XX} segundos

VERIFICAÇÕES:
- Tabelas de análise restantes: 0
- Recordings intacto: Sim
- Total de gravações preservadas: {XX}
- Coluna analysis_id removida: Sim
- Enums removidos: Sim

OBSERVAÇÕES:
{INSERIR NOTAS}
```

- [ ] Criar arquivo `exterminator-execution-report.txt`
- [ ] Preencher todas as informações
- [ ] Salvar arquivo

### 6.8 - Commit Final do Sprint

```bash
git add exterminator-execution-report.txt
git commit -m "Sprint 6: Executa Exterminator.sql - Sistema de análises removido do banco"
```

### Critérios de Sucesso Sprint 6:
- ✅ Script Exterminator executado sem erros
- ✅ 19 tabelas de análise removidas
- ✅ 4 enums removidos
- ✅ Tabela recordings preservada e funcional
- ✅ Todas as verificações pós-execução passaram
- ✅ Backup pós-execução criado
- ✅ Relatório de execução documentado

---

## ✅ SPRINT 7 - TESTES E VALIDAÇÃO FINAL

### Objetivo:
Testar todo o sistema e garantir que gravação/transcrição funcionam perfeitamente

### Duração Estimada: 60 minutos

### 7.1 - Teste de Compilação Final

- [ ] Executar: `npm run build`
  - **Esperado**: Build completo SEM ERROS
  - Se falhar, anotar erros: `___________________`

- [ ] Executar: `npm run dev`
  - **Esperado**: Servidor inicia sem erros
  - Anotar URL: `http://localhost:____`

### 7.2 - Teste de Login

- [ ] Abrir aplicação no navegador
- [ ] Fazer login com usuário de teste
  - Email: `___________________`
  - Senha: `___________________`
- [ ] Verificar se login funciona
- [ ] Verificar se redireciona para Dashboard

### 7.3 - Teste de Dashboard

No Dashboard, verificar:

- [ ] Dashboard carrega sem erros
- [ ] NÃO há seção "Análises Recentes"
- [ ] NÃO há card de métricas de IA
- [ ] NÃO há botão "Análises/Relatórios"
- [ ] Há card de "Gravações Recentes" (se houver gravações)
- [ ] Quick Actions funcionam
- [ ] Console do navegador SEM ERROS

### 7.4 - Teste de Sidebar

Na barra lateral, verificar:

- [ ] Logo e nome "Med Briefing" aparecem
- [ ] Link "Dashboard" existe e funciona
- [ ] Link "Gravações" existe e funciona
- [ ] Link "Configurações" existe e funciona
- [ ] NÃO há link "Análises"
- [ ] NÃO há link "Briefings"
- [ ] NÃO há link "Relatórios"

### 7.5 - Teste de Rotas (Navegação Manual)

Tentar acessar rotas removidas no navegador:

- [ ] Acessar: `http://localhost:XXXX/analises`
  - **Esperado**: 404 ou redireciona para Dashboard

- [ ] Acessar: `http://localhost:XXXX/briefings`
  - **Esperado**: 404 ou redireciona para Dashboard

- [ ] Acessar: `http://localhost:XXXX/relatorios`
  - **Esperado**: 404 ou redireciona para Dashboard

### 7.6 - Teste de Gravação (CRÍTICO)

#### Teste 1: Nova Gravação

1. [ ] Clicar em "Gravações" na sidebar
2. [ ] Clicar em "Nova Gravação"
3. [ ] Preencher nome do paciente: `Teste Exterminator`
4. [ ] Permitir acesso ao microfone
5. [ ] Clicar em "Iniciar Gravação"
6. [ ] Falar algo por 10-15 segundos
7. [ ] Clicar em "Parar Gravação"
8. [ ] Verificar preview do áudio
9. [ ] Clicar em "Salvar Gravação"
10. [ ] Verificar se gravação aparece na lista

**Resultado esperado:**
- [ ] Gravação criada com sucesso
- [ ] Aparece na lista com status "Salvo"
- [ ] Console SEM ERROS

#### Teste 2: Reproduzir Áudio

1. [ ] Na lista de gravações, clicar em "Ouvir" da gravação de teste
2. [ ] Verificar se modal abre
3. [ ] Clicar em play no player de áudio
4. [ ] Verificar se áudio toca corretamente
5. [ ] Fechar modal

**Resultado esperado:**
- [ ] Áudio reproduz corretamente
- [ ] Player funciona

### 7.7 - Teste de Transcrição (CRÍTICO)

#### Teste 1: Solicitar Transcrição

1. [ ] Na gravação de teste, clicar em "Transcrever com IA"
2. [ ] Aguardar processo de transcrição
3. [ ] Verificar mensagens de progresso
4. [ ] Aguardar conclusão

**Resultado esperado:**
- [ ] Transcrição inicia sem erros
- [ ] Status muda para "Transcrevendo"
- [ ] Status muda para "Transcrito" ao finalizar
- [ ] Mensagem de sucesso aparece

#### Teste 2: Visualizar Transcrição

1. [ ] Clicar em "Ver" ou "Acessar Transcrição"
2. [ ] Verificar se modal abre
3. [ ] Verificar se texto da transcrição aparece
4. [ ] Verificar estatísticas (palavras, caracteres)

**Resultado esperado:**
- [ ] Modal abre corretamente
- [ ] Texto da transcrição está legível
- [ ] Estatísticas corretas

#### Teste 3: Copiar Transcrição

1. [ ] No modal de transcrição, clicar em "Copiar"
2. [ ] Verificar feedback visual
3. [ ] Colar em um editor de texto
4. [ ] Verificar se texto foi copiado

**Resultado esperado:**
- [ ] Botão mostra "Copiado!"
- [ ] Texto copiado para clipboard

#### Teste 4: Baixar Transcrição

1. [ ] No modal de transcrição, clicar em "Baixar TXT"
2. [ ] Verificar se download inicia
3. [ ] Abrir arquivo baixado
4. [ ] Verificar conteúdo

**Resultado esperado:**
- [ ] Arquivo .txt baixado
- [ ] Conteúdo correto no arquivo

#### Teste 5: Verificar NÃO há Botão de Análise

1. [ ] No modal de transcrição, verificar botões disponíveis
2. [ ] Confirmar que NÃO há botão "Fazer Análise Agora"
3. [ ] Confirmar que NÃO há botão "Analisar com IA"
4. [ ] Confirmar que NÃO há dica sobre briefings

**Resultado esperado:**
- [ ] Apenas botões: Fechar, Copiar, Baixar TXT
- [ ] Nenhuma referência a análises

### 7.8 - Teste de Exclusão de Gravação

1. [ ] Na lista, passar mouse sobre gravação de teste
2. [ ] Clicar no botão de "Excluir" (ícone lixeira)
3. [ ] Verificar modal de confirmação
4. [ ] Ler aviso de exclusão permanente
5. [ ] Clicar em "Excluir Permanentemente"
6. [ ] Aguardar exclusão
7. [ ] Verificar se gravação sumiu da lista

**Resultado esperado:**
- [ ] Modal de confirmação aparece
- [ ] Exclusão completa sem erros
- [ ] Gravação removida da lista
- [ ] Mensagem de sucesso

### 7.9 - Teste de Console (Erros)

Abrir DevTools (F12) e verificar:

- [ ] Aba **Console**: NÃO deve ter erros vermelhos
  - Warnings (amarelo) são OK
  - Se houver erros, anotar: `___________________`

- [ ] Aba **Network**: Verificar chamadas de API
  - NÃO deve ter chamadas para:
    - `/functions/analyze-consultation`
    - `/functions/analyze-performance`
    - `/functions/generate-briefing`
    - `/functions/generate-spin-briefing`
  - DEVE ter chamadas para:
    - `/rest/v1/recordings`
    - API de transcrição (se configurada)

### 7.10 - Teste de Performance

- [ ] Abrir DevTools > Aba **Performance**
- [ ] Clicar em "Record"
- [ ] Navegar: Dashboard → Gravações → Dashboard
- [ ] Parar recording
- [ ] Verificar se não há lentidão anormal
- [ ] FPS deve estar próximo de 60

### 7.11 - Teste Mobile (Opcional)

Se possível:

- [ ] Abrir DevTools (F12)
- [ ] Clicar no ícone de dispositivo móvel (Ctrl+Shift+M)
- [ ] Selecionar: iPhone 12 Pro
- [ ] Testar navegação
- [ ] Testar sidebar mobile (menu hamburguer)
- [ ] Verificar responsividade

### 7.12 - Verificar Logs do Supabase

No Supabase Dashboard:

- [ ] Ir em **Logs** > **Edge Function Logs**
- [ ] Verificar se NÃO há chamadas para functions removidas
- [ ] Se houver erros, investigar

- [ ] Ir em **Logs** > **Postgres Logs**
- [ ] Verificar se NÃO há erros SQL relacionados a tabelas removidas
- [ ] Se houver erros, investigar

### 7.13 - Documentar Resultados dos Testes

Criar arquivo `final-test-report.txt`:

```
RELATÓRIO DE TESTES FINAIS - ATUALIZAÇÃO 01
============================================

Data/Hora: {INSERIR}
Testado por: {INSERIR NOME}

COMPILAÇÃO:
- npm run build: [✓ OK / ✗ ERRO]
- npm run dev: [✓ OK / ✗ ERRO]

NAVEGAÇÃO:
- Dashboard: [✓ OK / ✗ ERRO]
- Gravações: [✓ OK / ✗ ERRO]
- Configurações: [✓ OK / ✗ ERRO]
- Sidebar: [✓ OK / ✗ ERRO]
- Rotas removidas retornam 404: [✓ OK / ✗ ERRO]

GRAVAÇÃO:
- Criar nova gravação: [✓ OK / ✗ ERRO]
- Reproduzir áudio: [✓ OK / ✗ ERRO]
- Excluir gravação: [✓ OK / ✗ ERRO]

TRANSCRIÇÃO:
- Solicitar transcrição: [✓ OK / ✗ ERRO]
- Visualizar transcrição: [✓ OK / ✗ ERRO]
- Copiar transcrição: [✓ OK / ✗ ERRO]
- Baixar transcrição: [✓ OK / ✗ ERRO]
- Botões de análise removidos: [✓ OK / ✗ ERRO]

CONSOLE:
- Sem erros: [✓ OK / ✗ ERRO]
- Sem chamadas para edge functions removidas: [✓ OK / ✗ ERRO]

PERFORMANCE:
- FPS: {XX} (esperado: ~60)
- Sem lentidão: [✓ OK / ✗ ERRO]

MOBILE (Opcional):
- Responsividade: [✓ OK / ✗ ERRO / N/A]

PROBLEMAS ENCONTRADOS:
{LISTAR AQUI}

CONCLUSÃO:
[✓ SISTEMA FUNCIONAL / ✗ CORREÇÕES NECESSÁRIAS]
```

- [ ] Criar arquivo `final-test-report.txt`
- [ ] Preencher todas as seções
- [ ] Salvar arquivo

### 7.14 - Commit Final

```bash
git add final-test-report.txt
git commit -m "Sprint 7: Testes finais concluídos - Sistema validado"
```

### 7.15 - Merge para Master (SE TUDO OK)

Se TODOS os testes passaram:

```bash
git checkout master
git merge feature/remove-analysis-system
git push origin master
```

- [ ] Fazer merge para master
- [ ] Push para repositório remoto

### Critérios de Sucesso Sprint 7:
- ✅ Build compila sem erros
- ✅ Aplicação inicia sem erros
- ✅ Dashboard funcional (sem seções de análise)
- ✅ Sidebar limpa (sem links de análise)
- ✅ Rotas removidas retornam 404
- ✅ Sistema de gravação 100% funcional
- ✅ Sistema de transcrição 100% funcional
- ✅ Nenhum botão/link para análises aparece
- ✅ Console sem erros críticos
- ✅ Logs do Supabase sem erros
- ✅ Relatório de testes documentado
- ✅ Merge para master concluído

---

## 🔄 ROLLBACK PLAN

### Se algo der errado durante a execução:

#### Rollback do Código (Qualquer Sprint):

```bash
# Voltar para branch de backup
git checkout backup-before-removal

# Ou fazer reset para commit específico
git log  # Ver histórico
git reset --hard {COMMIT_ID}

# Forçar push se necessário
git push origin master --force
```

#### Rollback do Banco de Dados (Após Sprint 6):

1. **Via Supabase Dashboard:**
   - Ir em **Database** > **Backups**
   - Selecionar backup: `backup-antes-remocao-analises-{DATA}`
   - Clicar em **Restore**
   - Aguardar conclusão (pode levar 5-10 minutos)
   - Verificar se tabelas voltaram

2. **Via SQL (Se backup falhar):**
   - Executar migrations antigas manualmente:
   ```bash
   # Localizar migration original
   cat supabase/migrations/20250107_create_analysis_tables.sql

   # Executar no SQL Editor do Supabase
   ```

#### Rollback Parcial (Apenas Frontend):

Se banco foi limpo mas quer reverter código:

```bash
git checkout master
git revert {COMMIT_ID_DO_MERGE}
git push origin master
```

---

## 📊 MÉTRICAS DE SUCESSO

### Indicadores de Sucesso Total:

- [ ] ✅ 0 arquivos de análise restantes em `src/`
- [ ] ✅ 0 tabelas de análise no Supabase
- [ ] ✅ Build compila em < 30 segundos
- [ ] ✅ 0 erros no console
- [ ] ✅ 100% das gravações preservadas
- [ ] ✅ Sistema de transcrição funcionando perfeitamente
- [ ] ✅ Aplicação carrega em < 3 segundos
- [ ] ✅ Nenhum link/botão para análises visível
- [ ] ✅ Documentação completa (3 arquivos de relatório)

---

## 📝 CHECKLIST FINAL DO PLANO

### Antes de Executar:
- [ ] Li e entendi todo o plano
- [ ] Tenho tempo suficiente (4-6 horas)
- [ ] Tenho acesso ao Supabase Dashboard
- [ ] Tenho backup confirmado

### Durante Execução:
- [ ] Sprint 0 concluído
- [ ] Sprint 1 concluído
- [ ] Sprint 2 concluído
- [ ] Sprint 3 concluído
- [ ] Sprint 4 concluído
- [ ] Sprint 5 concluído
- [ ] Sprint 6 concluído (IRREVERSÍVEL)
- [ ] Sprint 7 concluído

### Após Execução:
- [ ] Todos os testes passaram
- [ ] Documentação criada
- [ ] Backup pós-execução criado
- [ ] Merge para master feito
- [ ] Sistema em produção funcionando

---

## 🎯 OBJETIVO FINAL ALCANÇADO

Ao completar este plano, o sistema terá:

### ✅ Removido:
- Sistema completo de análises com IA
- Páginas: AnalysesPage, BriefingsPage, ReportsPage, BriefingSPINPage
- 10 componentes de análise
- 5 serviços de análise
- 4 edge functions
- 19 tabelas de banco de dados
- 4 enums SQL
- ~8.000 linhas de código

### ✅ Mantido:
- Sistema de gravação (100% funcional)
- Sistema de transcrição (100% funcional)
- Dashboard (limpo, sem análises)
- Configurações
- Autenticação
- Toda estrutura de usuários

### 🎉 Resultado:
**Sistema Med Briefing 2.0 focado exclusivamente em gravação e transcrição de consultas médicas.**

---

**FIM DO PLANO - BOA SORTE NA EXECUÇÃO! 🚀**
