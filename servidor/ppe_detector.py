from ultralytics import YOLO
import numpy as np
import cv2
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class PPEDetector:
    def __init__(self, model_path='models/best.pt'):
        """Inicializa o detector com o modelo YOLO"""
        try:
            self.model = YOLO(model_path)
            logger.info(f"Modelo carregado: {model_path}")
            
            # Mapeamento de classes (baseado no dataset do GitHub)
            self.class_mapping = {
                'hardhat': 'capacete',
                'no-hardhat': 'sem_capacete',
                'mask': 'mascara',
                'no-mask': 'sem_mascara',
                'safety-vest': 'colete',
                'no-safety-vest': 'sem_colete',
                'person': 'pessoa'
            }
            
            # EPIs obrigatórios
            self.required_epis = ['capacete', 'mascara', 'colete']
            
        except Exception as e:
            logger.error(f"Erro ao carregar modelo: {str(e)}")
            raise

    def analyze(self, image):
        """
        Analisa a imagem e detecta EPIs
        
        Args:
            image: PIL Image ou numpy array
            
        Returns:
            dict: Resultado da análise com status de aprovação e EPIs detectados
        """
        try:
            # Converter PIL Image para numpy array se necessário
            if isinstance(image, Image.Image):
                image = np.array(image)
            
            # Detectar objetos
            results = self.model(image, conf=0.5, verbose=False)
            
            # Processar detecções
            detections = self._process_detections(results)
            
            # Analisar conformidade
            analysis_result = self._analyze_compliance(detections)
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Erro na análise: {str(e)}", exc_info=True)
            return {
                'approved': False,
                'detectedEquipment': [],
                'missingItems': self.required_epis,
                'error': str(e)
            }

    def _process_detections(self, results):
        """Processa as detecções do YOLO"""
        detections = {
            'pessoa': False,
            'capacete': False,
            'sem_capacete': False,
            'mascara': False,
            'sem_mascara': False,
            'colete': False,
            'sem_colete': False
        }
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                
                # Obter nome da classe
                class_name = result.names[cls]
                
                # Mapear para nome em português
                mapped_name = self.class_mapping.get(class_name, class_name)
                
                if mapped_name in detections:
                    detections[mapped_name] = True
                    logger.info(f"Detectado: {mapped_name} (confiança: {conf:.2f})")
        
        return detections

    def _analyze_compliance(self, detections):
        """Analisa se todos os EPIs obrigatórios estão presentes"""
        
        # Se não detectou pessoa, não pode analisar
        if not detections.get('pessoa', False):
            return {
                'approved': False,
                'detectedEquipment': [],
                'missingItems': self.required_epis,
                'message': 'Nenhuma pessoa detectada na imagem'
            }
        
        detected_equipment = []
        missing_items = []
        
        # Verificar cada EPI obrigatório
        for epi in self.required_epis:
            epi_detected = detections.get(epi, False)
            epi_missing = detections.get(f'sem_{epi}', False)
            
            # Se detectou o EPI presente e não detectou ausência
            if epi_detected and not epi_missing:
                detected_equipment.append(epi)
            else:
                missing_items.append(epi)
        
        # Aprovado se todos os EPIs obrigatórios foram detectados
        approved = len(missing_items) == 0
        
        result = {
            'approved': approved,
            'detectedEquipment': detected_equipment,
            'missingItems': missing_items
        }
        
        if approved:
            result['message'] = 'Todos os EPIs obrigatórios detectados'
        else:
            result['message'] = f'EPIs faltando: {", ".join(missing_items)}'
        
        logger.info(f"Resultado da análise: {result}")
        
        return result
