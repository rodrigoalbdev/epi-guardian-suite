# Servidor de Detecção de EPIs

Este servidor Flask processa imagens e detecta EPIs usando o modelo YOLO treinado.

## Instalação

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Coloque o arquivo `best.pt` na pasta `models/`

3. Certifique-se de que a estrutura de pastas está assim:
```
servidor/
├── app.py
├── ppe_detector.py
├── requirements.txt
├── models/
│   └── best.pt
└── logs/
```

## Executar

### Modo de desenvolvimento:
```bash
python app.py
```

### Modo de produção (Windows com NSSM):

1. Baixe o NSSM: https://nssm.cc/download
2. Instale o serviço:
```cmd
nssm install PPEDetector "C:\Python\python.exe" "C:\caminho\para\servidor\app.py"
nssm set PPEDetector AppDirectory "C:\caminho\para\servidor"
nssm start PPEDetector
```

### Modo de produção (Linux com Gunicorn):
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Configuração de Firewall

### Windows:
```cmd
netsh advfirewall firewall add rule name="PPE Detection API" dir=in action=allow protocol=TCP localport=5000
```

### Linux:
```bash
sudo ufw allow 5000/tcp
```

## API Endpoints

### GET /api/health
Verifica se o servidor está online.

**Resposta:**
```json
{
  "status": "online",
  "timestamp": "2025-01-01T12:00:00",
  "detector_loaded": true
}
```

### POST /api/analyze
Analisa uma imagem para detectar EPIs.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Resposta:**
```json
{
  "approved": true,
  "detectedEquipment": ["capacete", "mascara", "colete"],
  "missingItems": [],
  "message": "Todos os EPIs obrigatórios detectados"
}
```

## Logs

Os logs são salvos em `logs/app.log` e também exibidos no console.
