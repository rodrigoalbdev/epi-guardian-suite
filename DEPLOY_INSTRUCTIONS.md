# Instruções de Deploy - Sistema de Detecção de EPIs

## Visão Geral da Arquitetura

```
[Frontend React/TypeScript] <--HTTP--> [Backend Python Flask + YOLO]
    (IIS - Porta 8080)                    (Porta 5000)
```

---

## Parte 1: Configurar o Servidor Python (Backend)

### 1.1. Preparar o Ambiente

1. **Clone o repositório do GitHub:**
```bash
git clone https://github.com/rodrigoalbdev/TCC.git
cd TCC/PPE_detection_snapshot_vitor2001-main
```

2. **Copie os arquivos do servidor:**
   - Copie todo o conteúdo da pasta `servidor/` deste projeto para uma pasta no seu servidor
   - Copie o arquivo `best.pt` do repositório do GitHub para `servidor/models/best.pt`

3. **Instale o Python 3.9 ou superior:**
   - Windows: https://www.python.org/downloads/
   - Durante a instalação, marque "Add Python to PATH"

### 1.2. Instalar Dependências

```bash
cd servidor
pip install -r requirements.txt
```

### 1.3. Testar o Servidor

```bash
python app.py
```

Você deve ver:
```
* Running on http://0.0.0.0:5000
```

Teste acessando: http://localhost:5000/api/health

### 1.4. Configurar como Serviço do Windows (Produção)

#### Opção A: Usar NSSM (Recomendado)

1. **Baixe o NSSM:**
   - https://nssm.cc/download
   - Extraia para `C:\nssm`

2. **Instale o serviço:**
```cmd
cd C:\nssm\win64
nssm install PPEDetector "C:\Python39\python.exe" "C:\caminho\completo\para\servidor\app.py"
nssm set PPEDetector AppDirectory "C:\caminho\completo\para\servidor"
nssm set PPEDetector DisplayName "PPE Detection Service"
nssm set PPEDetector Description "Serviço de detecção de EPIs com YOLO"
nssm set PPEDetector Start SERVICE_AUTO_START
```

3. **Inicie o serviço:**
```cmd
nssm start PPEDetector
```

4. **Verificar status:**
```cmd
nssm status PPEDetector
```

#### Opção B: Usar Task Scheduler

1. Abra o Task Scheduler
2. Criar Tarefa Básica → Nome: "PPE Detection Server"
3. Gatilho: "Quando o computador iniciar"
4. Ação: "Iniciar um programa"
   - Programa: `C:\Python39\python.exe`
   - Argumentos: `C:\caminho\para\servidor\app.py`
   - Iniciar em: `C:\caminho\para\servidor`
5. Marcar "Executar com privilégios mais altos"

### 1.5. Configurar Firewall

```cmd
netsh advfirewall firewall add rule name="PPE Detection API" dir=in action=allow protocol=TCP localport=5000
```

---

## Parte 2: Configurar o Frontend (IIS)

### 2.1. Preparar o Build

1. **No seu ambiente de desenvolvimento:**

```bash
# Edite o arquivo .env.production e configure a URL do servidor Python
# Exemplo: VITE_API_URL=http://192.168.1.100:5000

npm install
npm run build
```

2. **A pasta `dist/` será gerada com o build de produção**

### 2.2. Instalar IIS e Componentes

1. **Abra "Painel de Controle" → "Programas" → "Ativar ou desativar recursos do Windows"**

2. **Marque:**
   - Internet Information Services
     - World Wide Web Services
       - Application Development Features
         - WebSocket Protocol
       - Common HTTP Features (todos)
       - Security (todos)

3. **Instale o URL Rewrite Module:**
   - Download: https://www.iis.net/downloads/microsoft/url-rewrite
   - Execute o instalador

### 2.3. Criar o Site no IIS

1. **Copie a pasta `dist/` para:** `C:\inetpub\wwwroot\ppe-detection`

2. **Crie o arquivo `web.config` dentro de `C:\inetpub\wwwroot\ppe-detection\`:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
  </system.webServer>
</configuration>
```

3. **Abra o IIS Manager:**
   - Executar → `inetmgr`

4. **Adicionar novo site:**
   - Botão direito em "Sites" → "Add Website"
   - Site name: `PPE Detection`
   - Physical path: `C:\inetpub\wwwroot\ppe-detection`
   - Binding:
     - Type: http
     - Port: 8080
     - IP address: All Unassigned

5. **Configurar Application Pool:**
   - Selecione "Application Pools"
   - Encontre o pool do seu site
   - Botão direito → "Advanced Settings"
   - .NET CLR version: `No Managed Code`

6. **Configurar Firewall:**
```cmd
netsh advfirewall firewall add rule name="IIS PPE Frontend" dir=in action=allow protocol=TCP localport=8080
```

### 2.4. Testar o Frontend

Acesse: http://localhost:8080

---

## Parte 3: Configuração de Rede

### 3.1. Se Frontend e Backend estão no mesmo servidor:

No `.env.production`:
```
VITE_API_URL=http://localhost:5000
```

### 3.2. Se Frontend e Backend estão em servidores diferentes:

No `.env.production`:
```
VITE_API_URL=http://IP_DO_SERVIDOR_PYTHON:5000
```

Certifique-se de que:
- O firewall do servidor Python permite conexões na porta 5000
- Os servidores estão na mesma rede ou têm rota entre eles

---

## Parte 4: Verificação Final

### 4.1. Checklist de Testes

- [ ] Servidor Python rodando: `http://IP_SERVIDOR:5000/api/health`
- [ ] Frontend carrega: `http://IP_SERVIDOR:8080`
- [ ] Console do navegador não mostra erros
- [ ] Botão "Ativar Câmera" não está desabilitado
- [ ] Status do servidor mostra "🟢 Online"
- [ ] Câmera ativa com sucesso
- [ ] Análise de EPI funciona e retorna resultado

### 4.2. Logs para Debug

**Backend (Python):**
- Logs em: `servidor/logs/app.log`
- Console: Se rodando manualmente

**Frontend:**
- Console do navegador (F12)
- IIS Logs: `C:\inetpub\logs\LogFiles\`

---

## Parte 5: Solução de Problemas Comuns

### Problema: "Servidor Offline" no frontend

**Soluções:**
1. Verifique se o servidor Python está rodando:
   ```cmd
   netstat -ano | findstr :5000
   ```

2. Teste diretamente a API:
   ```cmd
   curl http://localhost:5000/api/health
   ```

3. Verifique o firewall
4. Verifique a URL em `.env.production`

### Problema: Erro CORS

**Solução:** O `flask-cors` já está configurado. Verifique se está instalado:
```bash
pip show flask-cors
```

### Problema: Modelo não carrega

**Soluções:**
1. Verifique se `best.pt` está em `servidor/models/best.pt`
2. Verifique os logs em `servidor/logs/app.log`
3. Certifique-se de que PyTorch está instalado corretamente

### Problema: IIS não serve arquivos estáticos

**Solução:** Verifique as permissões da pasta:
```cmd
icacls "C:\inetpub\wwwroot\ppe-detection" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

---

## Parte 6: Manutenção

### Atualizar o Frontend:

1. Faça as alterações no código
2. Execute `npm run build`
3. Copie o conteúdo de `dist/` para `C:\inetpub\wwwroot\ppe-detection`
4. Reinicie o site no IIS (opcional)

### Atualizar o Backend:

1. Pare o serviço:
   ```cmd
   nssm stop PPEDetector
   ```

2. Faça as alterações

3. Inicie o serviço:
   ```cmd
   nssm start PPEDetector
   ```

### Ver logs do serviço:

```cmd
nssm rotate PPEDetector
notepad C:\caminho\para\servidor\logs\app.log
```

---

## Contatos e Suporte

Para problemas relacionados a:
- **Modelo YOLO:** Verifique o repositório original no GitHub
- **IIS:** Documentação Microsoft IIS
- **Python/Flask:** Documentação oficial

---

**Criado em:** Janeiro 2025
**Versão:** 1.0
