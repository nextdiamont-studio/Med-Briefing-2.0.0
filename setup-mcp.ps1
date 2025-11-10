# Script de Configuração dos Servidores MCP
# Med Briefing - Model Context Protocol Setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuração de Servidores MCP" -ForegroundColor Cyan
Write-Host "  Med Briefing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "   Instale Node.js 18+ em: https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Verificar Claude Desktop
Write-Host "Verificando Claude Desktop..." -ForegroundColor Yellow
$claudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$claudeInstalled = Test-Path $claudeConfigPath

if (-not $claudeInstalled) {
    Write-Host "⚠️  Claude Desktop não encontrado" -ForegroundColor Yellow
    Write-Host "   Baixe em: https://claude.ai/download" -ForegroundColor Yellow
    Write-Host "   Após instalar, execute este script novamente" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ Claude Desktop encontrado" -ForegroundColor Green
    Write-Host ""
}

# Criar diretório .mcp se não existir
$mcpDir = ".mcp"
if (-not (Test-Path $mcpDir)) {
    New-Item -ItemType Directory -Path $mcpDir | Out-Null
    Write-Host "✅ Diretório .mcp criado" -ForegroundColor Green
}

# Verificar se .env.mcp existe
$envMcpPath = "$mcpDir\.env.mcp"
if (-not (Test-Path $envMcpPath)) {
    Write-Host "📝 Criando arquivo de variáveis de ambiente..." -ForegroundColor Yellow
    Copy-Item "$mcpDir\.env.example" $envMcpPath
    Write-Host "✅ Arquivo .env.mcp criado" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Edite o arquivo .mcp\.env.mcp e adicione seus tokens!" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ Arquivo .env.mcp já existe" -ForegroundColor Green
    Write-Host ""
}

# Solicitar tokens
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuração de Tokens" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Você precisa configurar os seguintes tokens:" -ForegroundColor White
Write-Host ""
Write-Host "1. GitHub Personal Access Token" -ForegroundColor White
Write-Host "   Obtenha em: https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host "   Permissões: repo, read:org, read:user" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Supabase Access Token" -ForegroundColor White
Write-Host "   Obtenha em: https://supabase.com/dashboard/account/tokens" -ForegroundColor Gray
Write-Host "   Ou use o Service Role Key do projeto" -ForegroundColor Gray
Write-Host ""

$configureNow = Read-Host "Deseja configurar os tokens agora? (s/n)"

if ($configureNow -eq "s" -or $configureNow -eq "S") {
    Write-Host ""
    $githubToken = Read-Host "Cole seu GitHub Token (ou pressione Enter para pular)"
    $supabaseToken = Read-Host "Cole seu Supabase Access Token (ou pressione Enter para pular)"
    
    if ($githubToken -or $supabaseToken) {
        $envContent = Get-Content $envMcpPath -Raw
        
        if ($githubToken) {
            $envContent = $envContent -replace 'GITHUB_TOKEN=.*', "GITHUB_TOKEN=$githubToken"
            Write-Host "✅ GitHub Token configurado" -ForegroundColor Green
        }
        
        if ($supabaseToken) {
            $envContent = $envContent -replace 'SUPABASE_ACCESS_TOKEN=.*', "SUPABASE_ACCESS_TOKEN=$supabaseToken"
            Write-Host "✅ Supabase Token configurado" -ForegroundColor Green
        }
        
        Set-Content -Path $envMcpPath -Value $envContent
        Write-Host ""
    }
}

# Testar instalação dos servidores MCP
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testando Servidores MCP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testando GitHub MCP Server..." -ForegroundColor Yellow
$githubTest = npx -y @modelcontextprotocol/server-github --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub MCP Server OK" -ForegroundColor Green
} else {
    Write-Host "⚠️  GitHub MCP Server não pôde ser verificado" -ForegroundColor Yellow
}

Write-Host "Testando Supabase MCP Server..." -ForegroundColor Yellow
$supabaseTest = npx -y @modelcontextprotocol/server-supabase --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Supabase MCP Server OK" -ForegroundColor Green
} else {
    Write-Host "⚠️  Supabase MCP Server não pôde ser verificado" -ForegroundColor Yellow
}

Write-Host ""

# Configurar Claude Desktop
if ($claudeInstalled) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Configuração do Claude Desktop" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $configureClaudeNow = Read-Host "Deseja configurar o Claude Desktop agora? (s/n)"
    
    if ($configureClaudeNow -eq "s" -or $configureClaudeNow -eq "S") {
        Write-Host ""
        Write-Host "Lendo tokens do .env.mcp..." -ForegroundColor Yellow
        
        $envContent = Get-Content $envMcpPath
        $githubToken = ($envContent | Select-String "GITHUB_TOKEN=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
        $supabaseToken = ($envContent | Select-String "SUPABASE_ACCESS_TOKEN=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
        
        if (-not $githubToken -or $githubToken -eq "ghp_seu_token_aqui") {
            Write-Host "⚠️  GitHub Token não configurado no .env.mcp" -ForegroundColor Yellow
            $githubToken = Read-Host "Cole seu GitHub Token"
        }
        
        if (-not $supabaseToken -or $supabaseToken -eq "seu_access_token_aqui") {
            Write-Host "⚠️  Supabase Token não configurado no .env.mcp" -ForegroundColor Yellow
            $supabaseToken = Read-Host "Cole seu Supabase Access Token"
        }
        
        # Criar configuração do Claude
        $claudeConfig = @{
            mcpServers = @{
                github = @{
                    command = "npx"
                    args = @("-y", "@modelcontextprotocol/server-github")
                    env = @{
                        GITHUB_PERSONAL_ACCESS_TOKEN = $githubToken
                    }
                }
                supabase = @{
                    command = "npx"
                    args = @("-y", "@modelcontextprotocol/server-supabase")
                    env = @{
                        SUPABASE_ACCESS_TOKEN = $supabaseToken
                        SUPABASE_PROJECT_ID = "pjbthsrnpytdaivchwqe"
                    }
                }
            }
        }
        
        # Backup da configuração existente
        if (Test-Path $claudeConfigPath) {
            $backupPath = "$claudeConfigPath.backup"
            Copy-Item $claudeConfigPath $backupPath
            Write-Host "✅ Backup criado: $backupPath" -ForegroundColor Green
        }
        
        # Salvar nova configuração
        $claudeConfig | ConvertTo-Json -Depth 10 | Set-Content $claudeConfigPath
        Write-Host "✅ Claude Desktop configurado!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANTE: Reinicie o Claude Desktop para aplicar as mudanças" -ForegroundColor Yellow
    }
}

# Resumo final
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuração Concluída!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Próximos passos:" -ForegroundColor White
Write-Host ""
Write-Host "1. Se ainda não configurou, edite: .mcp\.env.mcp" -ForegroundColor Gray
Write-Host "2. Reinicie o Claude Desktop" -ForegroundColor Gray
Write-Host "3. Teste os servidores MCP no Claude" -ForegroundColor Gray
Write-Host "4. Leia a documentação: CONFIGURACAO_MCP.md" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ Comandos de teste no Claude:" -ForegroundColor White
Write-Host ""
Write-Host "   'Liste os repositórios do meu GitHub'" -ForegroundColor Cyan
Write-Host "   'Mostre as tabelas do banco Med Briefing'" -ForegroundColor Cyan
Write-Host "   'Quais Edge Functions estão deployadas?'" -ForegroundColor Cyan
Write-Host ""

Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
