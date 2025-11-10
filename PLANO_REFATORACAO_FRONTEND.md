# 📋 PLANO DE REFATORAÇÃO FRONTEND - Med Briefing 2.0

## 🎯 OBJETIVO

Refatorar completamente o frontend da aplicação conforme especificações:

1. **Remover** aba "Pacientes" e toda lógica de gestão de pacientes
2. **Transformar** "Consultas" em "Gravações" com novo fluxo
3. **Reformular** "Relatórios" com métricas avançadas
4. **Limpar** "Configurações" removendo "Informações do Sistema"

---

## 📊 MAPEAMENTO DA ESTRUTURA ATUAL

### Arquivos Identificados

#### 1. **Páginas** (`src/pages/`)
- ✅ `PatientsPage.tsx` - **DELETAR**
- ⚠️ `ConsultationsPage.tsx` - **REFATORAR COMPLETAMENTE**
- ⚠️ `ReportsPage.tsx` - **EXPANDIR E MELHORAR**
- ⚠️ `SettingsPage.tsx` - **LIMPAR**
- ✅ `DashboardPage.tsx` - Manter
- ✅ `BriefingsPage.tsx` - Manter
- ✅ `AnalysesPage.tsx` - Manter
- ✅ `LoginPage.tsx` - Manter

#### 2. **Componentes de Navegação**
- ⚠️ `Sidebar.tsx` - **ATUALIZAR** (remover link Pacientes)
- ✅ `Header.tsx` - Manter
- ✅ `Layout.tsx` - Manter

#### 3. **Componentes de Áudio**
- ✅ `AudioRecorder.tsx` - Manter
- ✅ `EnhancedAudioRecorder.tsx` - **ADAPTAR** para novo fluxo
- ✅ `AudioPlayer.tsx` - Manter

#### 4. **Componentes de Análise**
- ✅ Todos em `src/components/analysis/` - Manter

#### 5. **Rotas** (`src/App.tsx` ou similar)
- ⚠️ **ATUALIZAR** rotas (remover /pacientes)

#### 6. **Tipos** (`src/lib/types.ts`)
- ⚠️ **LIMPAR** tipos relacionados a Patient

#### 7. **Banco de Dados**
- ⚠️ Tabela `patients` - **NÃO DELETAR** (dados históricos)
- ⚠️ Tabela `consultations` - Manter e adaptar

---

## 🗂️ FASE 1: REMOÇÃO DA ABA PACIENTES

### Tarefa 1.1: Remover Navegação
**Arquivo:** `src/components/Sidebar.tsx`

**Ação:**
```typescript
// ANTES:
const managementNavigation = [
  { name: 'Pacientes', href: '/pacientes', icon: Users },
  { name: 'Consultas', href: '/consultas', icon: Mic },
  { name: 'Briefings', href: '/briefings', icon: FileText },
]

// DEPOIS:
const managementNavigation = [
  { name: 'Gravações', href: '/gravacoes', icon: Mic }, // Renomear
  { name: 'Briefings', href: '/briefings', icon: FileText },
]
```

**Impacto:** Baixo
**Tempo:** 5 minutos
**Testes:** Verificar sidebar visualmente

---

### Tarefa 1.2: Deletar Página de Pacientes
**Arquivo:** `src/pages/PatientsPage.tsx`

**Ação:**
```bash
rm src/pages/PatientsPage.tsx
```

**Impacto:** Médio
**Tempo:** 2 minutos
**Testes:** Garantir que não há imports em outros arquivos

---

### Tarefa 1.3: Remover Rota de Pacientes
**Arquivo:** `src/App.tsx` ou `src/routes.tsx`

**Ação:**
```typescript
// REMOVER:
<Route path="/pacientes" element={<PatientsPage />} />
```

**Impacto:** Médio
**Tempo:** 3 minutos
**Testes:** Acessar /pacientes deve dar 404

---

### Tarefa 1.4: Limpar Tipos de Paciente (Opcional)
**Arquivo:** `src/lib/types.ts`

**Ação:**
```typescript
// COMENTAR (não deletar, pode ter referências):
// export interface Patient { ... }
```

**Impacto:** Baixo
**Tempo:** 5 minutos
**Testes:** Verificar se há erros de compilação

---

## 🎙️ FASE 2: TRANSFORMAR CONSULTAS EM GRAVAÇÕES

### Tarefa 2.1: Criar Nova Página "RecordingsPage"
**Arquivo:** `src/pages/RecordingsPage.tsx` (NOVO)

**Funcionalidades:**
1. **Listagem de Gravações**
   - Grid/Lista de gravações
   - Status: Gravando, Processando, Concluída
   - Informações: Nome, Data, Duração, Status da Transcrição

2. **Modal de Nova Gravação**
   - Input: Nome da gravação (obrigatório)
   - Botão: Iniciar Gravação
   - Gravador de áudio integrado

3. **Card de Gravação**
   ```
   ┌─────────────────────────────────────┐
   │ 🎙️ Consulta João Silva - 08/11     │
   │                                     │
   │ ⏱️  15:32    📊 Processando...      │
   │                                     │
   │ [▶️ Ouvir]  [📄 Transcrição]  [⬇️]  │
   └─────────────────────────────────────┘
   ```

4. **Fluxo de Gravação:**
   ```
   Usuário digita nome
      ↓
   Clica "Iniciar Gravação"
      ↓
   Grava áudio
      ↓
   Clica "Finalizar"
      ↓
   Upload para Supabase Storage
      ↓
   Salva registro no banco (status: processing)
      ↓
   Trigger automático chama Edge Function
      ↓
   Edge Function:
      - Transcreve áudio (Gemini Speech-to-Text ou similar)
      - Gera arquivo TXT
      - Salva TXT no Storage
      - Atualiza status: completed
   ```

**Impacto:** Alto
**Tempo:** 3-4 horas
**Testes:** Criar gravação end-to-end

---

### Tarefa 2.2: Criar Componente de Gravação
**Arquivo:** `src/components/RecordingModal.tsx` (NOVO)

**Props:**
```typescript
interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (recordingId: string) => void;
}
```

**Fluxo:**
1. Input para nome da gravação
2. Botão "Iniciar Gravação"
3. Componente `EnhancedAudioRecorder`
4. Ao finalizar: upload e salvar

**Impacto:** Alto
**Tempo:** 2-3 horas

---

### Tarefa 2.3: Integrar com Supabase Storage
**Arquivo:** `src/lib/storage-service.ts` (NOVO)

**Funções:**
```typescript
export async function uploadRecording(
  userId: string,
  recordingName: string,
  audioBlob: Blob
): Promise<{ audioUrl: string; filePath: string }> {
  // 1. Criar nome único do arquivo
  const fileName = `${userId}/${Date.now()}-${recordingName}.webm`;

  // 2. Upload para Supabase Storage
  const { data, error } = await supabase.storage
    .from('recordings')
    .upload(fileName, audioBlob, {
      contentType: 'audio/webm',
      upsert: false
    });

  if (error) throw error;

  // 3. Gerar URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('recordings')
    .getPublicUrl(fileName);

  return { audioUrl: publicUrl, filePath: fileName };
}
```

**Impacto:** Alto
**Tempo:** 1-2 horas
**Testes:** Upload de arquivo de áudio

---

### Tarefa 2.4: Criar Edge Function de Transcrição
**Arquivo:** `supabase/functions/transcribe-recording/index.ts` (NOVO)

**Fluxo:**
```typescript
// 1. Triggered por database webhook quando recording.status = 'processing'
// 2. Baixa áudio do Storage
// 3. Envia para Gemini Speech-to-Text (ou Whisper API)
// 4. Recebe transcrição
// 5. Salva TXT no Storage
// 6. Atualiza recording:
//    - transcription_url
//    - transcription_text (para busca)
//    - status: 'completed'
```

**Impacto:** Alto
**Tempo:** 2-3 horas
**Testes:** Transcrição de áudio teste

---

### Tarefa 2.5: Criar Tabela `recordings`
**Arquivo:** SQL no Supabase

```sql
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  audio_file_path TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  transcription_url TEXT,
  transcription_text TEXT, -- Para busca
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_status ON recordings(status);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recordings"
  ON recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recordings"
  ON recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings"
  ON recordings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
  ON recordings FOR DELETE
  USING (auth.uid() = user_id);
```

**Impacto:** Alto
**Tempo:** 30 minutos
**Testes:** CRUD de recordings

---

### Tarefa 2.6: Criar Storage Bucket
**Ação no Supabase Dashboard:**

1. Ir em Storage
2. Criar bucket: `recordings`
3. Configurações:
   - Public: ✅ Sim (para downloads)
   - File size limit: 100 MB
   - Allowed MIME types: `audio/*`

4. Criar bucket: `transcriptions`
5. Configurações:
   - Public: ✅ Sim
   - File size limit: 10 MB
   - Allowed MIME types: `text/plain`

**Impacto:** Médio
**Tempo:** 10 minutos

---

### Tarefa 2.7: Criar Componente de Visualização de Transcrição
**Arquivo:** `src/components/TranscriptionViewer.tsx` (NOVO)

**Funcionalidades:**
1. Baixar TXT do Storage
2. Exibir em modal formatado
3. Botão "Baixar TXT"
4. Botão "Usar para Análise" (redireciona para AnalysisUploadModal)

**Impacto:** Médio
**Tempo:** 1-2 horas

---

## 📊 FASE 3: REFORMULAR RELATÓRIOS

### Tarefa 3.1: Expandir Métricas no ReportsPage
**Arquivo:** `src/pages/ReportsPage.tsx`

**Métricas a Adicionar:**

1. **Taxa de Conversão**
   - Já existe ✅
   - Melhorar visualização

2. **Principais Erros** (Top 5)
   - Buscar em `performance_analyses.errors`
   - Agrupar por tipo
   - Mostrar frequência

3. **Total de Análises**
   - Por tipo (Performance, SPIN)
   - Já existe ✅

4. **Ticket Médio**
   - Já existe ✅
   - Adicionar tendência (↑↓)

5. **Análises por Período**
   - Gráfico de linha (últimos 30 dias)
   - Biblioteca: Recharts

6. **Distribuição de Perfis Comportamentais**
   - Gráfico de pizza
   - Dominante, Influente, Estável, Analítico

7. **Performance Score Médio**
   - Média de `overall_score`
   - Gauge chart

8. **Vendas Realizadas vs Perdidas**
   - Gráfico de barras

**Impacto:** Alto
**Tempo:** 4-5 horas

---

### Tarefa 3.2: Criar Função de Métricas Avançadas
**Arquivo:** `src/lib/reports-service.ts` (NOVO)

```typescript
export interface AdvancedMetrics {
  // Já existentes
  total_analyses: number;
  conversion_rate: number;
  average_ticket: number;

  // Novos
  top_errors: Array<{
    error_type: string;
    count: number;
    percentage: number;
  }>;

  analyses_by_date: Array<{
    date: string;
    count: number;
  }>;

  behavioral_distribution: {
    Dominante: number;
    Influente: number;
    Estável: number;
    Analítico: number;
  };

  average_performance_score: number;
  sales_won_lost: {
    won: number;
    lost: number;
  };
}

export async function getAdvancedMetrics(
  userId: string
): Promise<AdvancedMetrics> {
  // Implementar queries
}
```

**Impacto:** Alto
**Tempo:** 3-4 horas

---

### Tarefa 3.3: Adicionar Gráficos com Recharts
**Dependência:** `recharts`

```bash
pnpm add recharts
```

**Componentes:**
1. `LineChart` - Análises por período
2. `PieChart` - Distribuição de perfis
3. `BarChart` - Vendas won/lost
4. `RadialBarChart` - Performance score

**Impacto:** Médio
**Tempo:** 2-3 horas

---

## ⚙️ FASE 4: LIMPAR CONFIGURAÇÕES

### Tarefa 4.1: Remover "Informações do Sistema"
**Arquivo:** `src/pages/SettingsPage.tsx`

**Ação:**
```typescript
// REMOVER TODO ESTE BLOCO (linhas 311-342):
{/* Informações do Sistema */}
<div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl shadow-lg p-6 text-white">
  ...
</div>
```

**Impacto:** Baixo
**Tempo:** 5 minutos
**Testes:** Visual da página de configurações

---

## 🧪 FASE 5: TESTES E VALIDAÇÃO

### Tarefa 5.1: Testes de Integração

**Checklist:**
- [ ] Sidebar não mostra "Pacientes"
- [ ] Rota /pacientes retorna 404
- [ ] Sidebar mostra "Gravações"
- [ ] Rota /gravacoes funciona
- [ ] Pode criar nova gravação
- [ ] Gravação aparece na lista
- [ ] Áudio é armazenado no Storage
- [ ] Transcrição é gerada
- [ ] TXT pode ser baixado
- [ ] Relatórios mostram métricas avançadas
- [ ] Gráficos renderizam corretamente
- [ ] Configurações não mostram "Info do Sistema"

**Impacto:** Crítico
**Tempo:** 2-3 horas

---

### Tarefa 5.2: Testes de Performance

**Métricas:**
- Upload de áudio < 5s (arquivo 10MB)
- Transcrição < 30s (áudio 5min)
- Carregamento de relatórios < 2s
- Lista de gravações < 1s

**Impacto:** Alto
**Tempo:** 1-2 horas

---

## 📅 CRONOGRAMA ESTIMADO

### Semana 1: Remoção e Preparação
- **Dia 1**: Fase 1 completa (Remoção Pacientes) - 2h
- **Dia 2**: Tarefa 2.5 e 2.6 (DB e Storage) - 2h
- **Dia 3**: Tarefa 2.3 (Storage Service) - 2h

### Semana 2: Gravações
- **Dia 4-5**: Tarefa 2.1 (RecordingsPage) - 8h
- **Dia 6**: Tarefa 2.2 (RecordingModal) - 4h
- **Dia 7**: Tarefa 2.4 (Edge Function) - 4h

### Semana 3: Relatórios e Finalização
- **Dia 8-9**: Fase 3 (Relatórios) - 12h
- **Dia 10**: Fase 4 (Configurações) - 1h
- **Dia 11-12**: Fase 5 (Testes) - 8h

**TOTAL: ~45 horas de desenvolvimento**

---

## 🎯 ORDEM DE EXECUÇÃO RECOMENDADA

### SPRINT 1: Limpeza (Baixo Risco)
1. ✅ Remover navegação de Pacientes
2. ✅ Deletar PatientsPage
3. ✅ Remover rota /pacientes
4. ✅ Limpar Informações do Sistema

**Resultado:** App funcional, apenas sem Pacientes

---

### SPRINT 2: Infraestrutura de Gravações (Preparação)
1. ✅ Criar tabela `recordings`
2. ✅ Criar buckets no Storage
3. ✅ Criar `storage-service.ts`

**Resultado:** Infraestrutura pronta, sem UI ainda

---

### SPRINT 3: UI de Gravações (Funcionalidade Core)
1. ✅ Criar RecordingsPage básica (listagem vazia)
2. ✅ Criar RecordingModal
3. ✅ Integrar gravador
4. ✅ Implementar upload

**Resultado:** Gravações funcionando, sem transcrição ainda

---

### SPRINT 4: Transcrição (Automação)
1. ✅ Criar Edge Function de transcrição
2. ✅ Testar transcrição end-to-end
3. ✅ Criar TranscriptionViewer

**Resultado:** Fluxo completo de gravação+transcrição

---

### SPRINT 5: Relatórios (Analytics)
1. ✅ Expandir métricas
2. ✅ Adicionar gráficos
3. ✅ Testar performance

**Resultado:** Relatórios completos e informativos

---

### SPRINT 6: Polish e Testes
1. ✅ Testes de integração
2. ✅ Ajustes visuais
3. ✅ Documentação

---

## 🚨 RISCOS E MITIGAÇÕES

### Risco 1: Transcrição demorada
**Mitigação:** Implementar queue com Bull/BullMQ

### Risco 2: Storage cheio
**Mitigação:** Limitar tamanho de arquivo (100MB)

### Risco 3: Custo da API de transcrição
**Mitigação:** Monitorar uso, alertas de limite

### Risco 4: Perda de dados de pacientes
**Mitigação:** NÃO deletar tabela, apenas ocultar UI

---

## 📝 CHECKLIST DE CONCLUSÃO

### Frontend
- [ ] Sidebar atualizada
- [ ] Rotas atualizadas
- [ ] PatientsPage deletada
- [ ] RecordingsPage criada e funcionando
- [ ] ReportsPage expandida
- [ ] SettingsPage limpa
- [ ] Todos componentes novos criados
- [ ] Tipos atualizados

### Backend
- [ ] Tabela `recordings` criada
- [ ] Buckets de Storage criados
- [ ] RLS configurado
- [ ] Edge Function de transcrição deployada
- [ ] Webhooks configurados

### Testes
- [ ] Teste: Criar gravação
- [ ] Teste: Ouvir gravação
- [ ] Teste: Baixar transcrição
- [ ] Teste: Usar transcrição em análise
- [ ] Teste: Visualizar relatórios
- [ ] Teste: Todos gráficos funcionando

### Documentação
- [ ] README atualizado
- [ ] Guia de uso de gravações
- [ ] Guia de métricas de relatórios

---

## 💡 MELHORIAS FUTURAS (Backlog)

1. **Edição de Transcrições**
   - Permitir correção manual de erros

2. **Busca em Transcrições**
   - Full-text search

3. **Análise Automática**
   - Ao completar transcrição, já criar análise

4. **Compartilhamento**
   - Link para compartilhar gravação/transcrição

5. **Tags e Categorias**
   - Organizar gravações por tipo

6. **Export de Relatórios**
   - PDF, Excel

---

**Versão:** 1.0
**Data:** 2025-11-08
**Autor:** Claude (Anthropic)
**Status:** Aguardando aprovação para execução
