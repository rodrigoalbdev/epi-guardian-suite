from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import logging
from datetime import datetime
from ppe_detector import PPEDetector

app = Flask(__name__)
CORS(app)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Inicializar o detector
try:
    detector = PPEDetector(model_path='models/best.pt')
    logger.info("Detector PPE inicializado com sucesso")
except Exception as e:
    logger.error(f"Erro ao inicializar detector: {str(e)}")
    detector = None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint para verificar se o servidor está rodando"""
    return jsonify({
        'status': 'online',
        'timestamp': datetime.now().isoformat(),
        'detector_loaded': detector is not None
    }), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_ppe():
    """Endpoint para análise de EPIs"""
    try:
        if detector is None:
            return jsonify({
                'error': 'Detector não inicializado'
            }), 500

        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({
                'error': 'Imagem não fornecida'
            }), 400

        # Decodificar imagem base64
        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Analisar EPIs
        result = detector.analyze(image)
        
        logger.info(f"Análise concluída: {result}")
        
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Erro na análise: {str(e)}", exc_info=True)
        return jsonify({
            'error': f'Erro ao processar imagem: {str(e)}'
        }), 500

if __name__ == '__main__':
    import os
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    app.run(host='0.0.0.0', port=5000, debug=False)
