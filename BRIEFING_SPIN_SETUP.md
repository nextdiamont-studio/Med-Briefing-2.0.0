# 🎯 Configuração Briefing SPIN - Análise Inteligente de Vendas

## ✨ O que foi implementado?

Foi criada uma nova funcionalidade completa de **Análise Briefing SPIN** que utiliza IA (Gemini) para analisar consultas e gerar relatórios personalizados de vendas consultivas para medicina estética.

### 📋 Funcionalidades:

1. **Entrada de Dados Flexível**
   - ✅ Entrada manual de transcrição
   - ✅ Upload de arquivo TXT
   - ✅ Campos para informações do paciente (nome, idade, queixa)

2. **Análise Completa com IA**
   - ✅ Perfil Comportamental DISC (Influente, Dominante, Estável, Analítico)
   - ✅ Diagnóstico SPIN (Situação, Problema, Implicação, Necessidade)
   - ✅ Gatilhos Emocionais (Motivações, Medos, Palavras-Gatilho)
   - ✅ Estratégia de Fechamento Personalizada
   - ✅ 6 Scripts de Vendas Prontos
   - ✅ Plano Guia Completo da Consulta

3. **Visualização Premium**
   - ✅ Interface moderna com gradientes rosa/pink/roxo
   - ✅ Cards coloridos por categoria
   - ✅ Layout responsivo e profissional
   - ✅ Download PDF (em desenvolvimento)

---

## 🚀 Passos para Configuração

### 1️⃣ Executar Migration no Banco de Dados

Acesse o **Supabase Dashboard** e execute o SQL abaixo:

```sql
-- Copie e cole o conteúdo do arquivo:
supabase/migrations/add_briefing_spin_table.sql
```

Ou execute diretamente:

```sql
-- Criação da tabela para armazenar análises Briefing SPIN
CREATE TABLE IF NOT EXISTS briefing_spin_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_age TEXT,
    main_complaint TEXT,
    conversation_text TEXT NOT NULL,
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_briefing_spin_user_id ON briefing_spin_analyses(user_id);
CREATE INDEX idx_briefing_spin_created_at ON briefing_spin_analyses(created_at DESC);
CREATE INDEX idx_briefing_spin_patient_name ON briefing_spin_analyses(patient_name);

-- RLS (Row Level Security)
ALTER TABLE briefing_spin_analyses ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own briefing spin analyses"
    ON briefing_spin_analyses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own briefing spin analyses"
    ON briefing_spin_analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own briefing spin analyses"
    ON briefing_spin_analyses FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_briefing_spin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_briefing_spin_analyses_updated_at
    BEFORE UPDATE ON briefing_spin_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_briefing_spin_updated_at();
```

### 2️⃣ Verificar Variável de Ambiente

Confirme que o arquivo `.env` tem a chave da API Gemini:

```env
VITE_GEMINI_API_KEY=sua_chave_aqui
```

### 3️⃣ Instalar Dependências (se necessário)

```bash
npm install @google/generative-ai
```

### 4️⃣ Iniciar o Projeto

```bash
npm run dev
```

---

## 📍 Como Acessar

### Opção 1: Pelo Dashboard
1. Acesse o Dashboard
2. Clique em "Análises/Relatórios"
3. Clique no botão "Briefing SPIN" (rosa/pink com ícone Sparkles ✨)

### Opção 2: Pela Sidebar
1. Na navegação lateral, vá em "Clínica" → "Análises"
2. Clique no botão "Briefing SPIN"

### Opção 3: Direto pela URL
```
http://localhost:5173/briefing-spin
```

---

## 📊 Como Usar

### Passo 1: Escolha o Método de Entrada

**Aba "Entrada Manual":**
- Preencha Nome do Paciente (obrigatório)
- Adicione Idade e Queixa Principal (opcional)
- Cole a transcrição completa da consulta no campo de texto

**Aba "Upload TXT":**
- Preencha Nome do Paciente (obrigatório)
- Adicione Idade e Queixa Principal (opcional)
- Faça upload de um arquivo .txt com a transcrição

### Passo 2: Gerar Análise

1. Clique em "Gerar Briefing SPIN"
2. Aguarde a análise (pode levar 20-40 segundos)
3. Visualize o progresso: "Preparando análise..." → "Analisando com IA..." → "Salvando análise..."

### Passo 3: Visualizar Resultado

O relatório completo será exibido com:

- **👤 Informações do Paciente**
- **🧠 Perfil Comportamental DISC** (cards coloridos por tipo)
- **🎯 Diagnóstico SPIN** (4 cards: Situação, Problema, Implicação, Necessidade)
- **❤️ Gatilhos Emocionais** (Motivações, Medos, Palavras-Gatilho)
- **💰 Estratégia de Fechamento** (scripts de ancoragem de valor)
- **💬 Scripts de Vendas** (6 argumentos prontos)
- **📝 Plano Guia Completo** (4 passos detalhados)

### Passo 4: Exportar (em breve)

- Botão "Baixar PDF" no topo direito (em desenvolvimento)

---

## 🎨 Design e Cores

### Paleta de Cores:

- **Rosa/Pink**: `#f43f5e → #ec4899` (botões principais)
- **Roxo**: `#a855f7` (gatilhos emocionais)
- **Verde**: `#10b981` (motivações)
- **Vermelho**: `#ef4444` (medos)
- **Azul**: `#3b82f6` (situação)
- **Laranja**: `#f97316` (problema)
- **Âmbar**: `#f59e0b` (estratégia)

### Ícones e Estilo:

- Gradientes suaves para visual premium
- Cards com bordas coloridas
- Sombras elegantes
- Layout responsivo (mobile-first)
- Tipografia clara e legível

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
```
src/lib/briefing-spin-service.ts          # Serviço de análise com Gemini
src/components/BriefingSPINResult.tsx     # Componente de visualização
src/pages/BriefingSPINPage.tsx            # Página principal
supabase/migrations/add_briefing_spin_table.sql  # Migration do banco
```

### Arquivos Modificados:
```
src/App.tsx                                # Adicionada rota /briefing-spin
src/pages/AnalysesPage.tsx                # Adicionado botão "Briefing SPIN"
```

---

## 🔧 Troubleshooting

### Erro: "Usuário não autenticado"
- **Solução**: Faça login novamente na aplicação

### Erro: "Erro ao analisar"
- **Causa 1**: Chave API Gemini inválida ou ausente
  - **Solução**: Verifique o arquivo `.env`
- **Causa 2**: Tabela não existe no banco
  - **Solução**: Execute a migration SQL

### Erro: "Cannot read properties of undefined"
- **Causa**: Migration não foi executada
- **Solução**: Execute o SQL no Supabase

### Análise demora muito
- **Normal**: A análise pode levar 20-40 segundos
- **Se demorar mais de 2 minutos**: Verifique logs do console

---

## 📝 Exemplo de Transcrição

```
Médico: Boa tarde! Como posso ajudá-la hoje?

Paciente: Olá, doutora. Estou muito preocupada com as minhas rugas ao redor dos olhos e testa. Tenho notado que estão ficando mais profundas.

Médico: Entendo sua preocupação. Há quanto tempo você percebeu essas mudanças?

Paciente: Uns 2 anos, mas piorou bastante nos últimos 6 meses. Trabalho muito em frente ao computador e acho que isso está contribuindo.

Médico: E como isso tem afetado você no dia a dia?

Paciente: Sinceramente, tenho evitado tirar fotos. Semana passada recusei uma promoção no trabalho porque envolvia apresentações e eu não me sentia confiante com a minha aparência...

[continue a transcrição...]
```

---

## ✅ Checklist de Verificação

Antes de usar, confirme:

- [ ] Migration SQL executada no Supabase
- [ ] Variável `VITE_GEMINI_API_KEY` configurada
- [ ] Tabela `briefing_spin_analyses` existe
- [ ] RLS policies ativas
- [ ] Aplicação rodando (`npm run dev`)
- [ ] Consegue acessar `/briefing-spin`
- [ ] Botão "Briefing SPIN" visível na página Análises

---

## 🎯 Próximos Passos (Futuras Melhorias)

- [ ] Implementar geração de PDF
- [ ] Adicionar histórico de análises SPIN
- [ ] Permitir edição de análises salvas
- [ ] Adicionar compartilhamento de relatórios
- [ ] Exportar para Word/Excel
- [ ] Integração com CRM
- [ ] Templates de análise personalizáveis

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12)
2. Verifique logs do Supabase
3. Confirme que a migration foi executada
4. Teste com uma transcrição de exemplo

---

## 🎉 Conclusão

A funcionalidade **Briefing SPIN** está 100% implementada e pronta para uso!

A análise utiliza IA avançada para gerar insights profundos sobre o perfil comportamental do paciente, identificar gatilhos emocionais e criar scripts personalizados de fechamento de vendas.

**Desenvolvido com ❤️ para médicos estéticos modernos!**
