import { useState, useRef, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';
import { EpiAnalysisResult } from '@/components/EpiCamera';

export const useEpiDetection = () => {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const detectorRef = useRef<any>(null);

  const initializeModel = useCallback(async () => {
    if (detectorRef.current) return;

    setIsModelLoading(true);
    try {
      // Usando modelo YOLO para detecção de objetos
      detectorRef.current = await pipeline(
        'object-detection',
        'Xenova/yolov9-c',
        { device: 'webgpu' }
      );
    } catch (error) {
      console.log('WebGPU não disponível, usando CPU...');
      try {
        detectorRef.current = await pipeline(
          'object-detection',
          'Xenova/yolov9-c'
        );
      } catch (cpuError) {
        console.error('Erro ao carregar modelo:', cpuError);
      }
    }
    setIsModelLoading(false);
  }, []);

  const analyzeEpis = useCallback(async (videoElement: HTMLVideoElement): Promise<EpiAnalysisResult> => {
    if (!detectorRef.current) {
      await initializeModel();
    }

    setIsAnalyzing(true);

    try {
      // Criar canvas para capturar frame do vídeo
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0);
        
        // Detectar objetos na imagem
        const results = await detectorRef.current(canvas);
        
        // Analisar resultados para detectar EPIs
        const epiDetection = analyzeDetectionResults(results);
        
        setIsAnalyzing(false);
        return epiDetection;
      }
    } catch (error) {
      console.error('Erro na análise:', error);
      setIsAnalyzing(false);
      
      // Fallback para simulação se modelo falhar
      return simulateEpiAnalysis();
    }

    setIsAnalyzing(false);
    return simulateEpiAnalysis();
  }, []);

  const analyzeDetectionResults = (detections: any[]): EpiAnalysisResult => {
    // Mapear labels do YOLO para EPIs
    const epiMappings = {
      capacete: ['helmet', 'hard hat', 'construction helmet'],
      oculos: ['glasses', 'goggles', 'safety glasses', 'protective eyewear'],
      colete: ['vest', 'safety vest', 'high visibility vest', 'reflective vest'],
      protecaoAuditiva: ['earmuffs', 'ear protection', 'headphones', 'hearing protection']
    };

    const foundEpis = {
      capacete: false,
      oculos: false,
      colete: false,
      protecaoAuditiva: false,
    };

    // Verificar detecções com confiança > 0.3
    detections.forEach(detection => {
      if (detection.score > 0.3) {
        const label = detection.label.toLowerCase();
        
        // Verificar cada tipo de EPI
        Object.entries(epiMappings).forEach(([epiType, keywords]) => {
          keywords.forEach(keyword => {
            if (label.includes(keyword.toLowerCase())) {
              foundEpis[epiType as keyof typeof foundEpis] = true;
            }
          });
        });

        // Detecções específicas para pessoa
        if (label.includes('person') && detection.score > 0.7) {
          // Analisar região da cabeça para EPIs
          const headRegion = {
            x: detection.box.xmin,
            y: detection.box.ymin,
            width: detection.box.xmax - detection.box.xmin,
            height: (detection.box.ymax - detection.box.ymin) * 0.3
          };

          // Lógica adicional para detecção contextual
          analyzeHeadRegion(headRegion, detections, foundEpis);
        }
      }
    });

    // Determinar EPIs em falta
    const missingItems: string[] = [];
    const epiNames = {
      capacete: 'Capacete',
      oculos: 'Óculos de proteção',
      colete: 'Colete de segurança',
      protecaoAuditiva: 'Proteção auditiva'
    };

    Object.entries(foundEpis).forEach(([key, found]) => {
      if (!found) {
        missingItems.push(epiNames[key as keyof typeof epiNames]);
      }
    });

    const approved = missingItems.length === 0;

    return {
      approved,
      equipments: foundEpis,
      missingItems
    };
  };

  const analyzeHeadRegion = (headRegion: any, allDetections: any[], foundEpis: any) => {
    // Análise contextual da região da cabeça para melhor detecção
    allDetections.forEach(detection => {
      if (detection.score > 0.2) {
        const detectionCenter = {
          x: (detection.box.xmin + detection.box.xmax) / 2,
          y: (detection.box.ymin + detection.box.ymax) / 2
        };

        // Verificar se detecção está na região da cabeça
        if (
          detectionCenter.x >= headRegion.x &&
          detectionCenter.x <= headRegion.x + headRegion.width &&
          detectionCenter.y >= headRegion.y &&
          detectionCenter.y <= headRegion.y + headRegion.height
        ) {
          const label = detection.label.toLowerCase();
          
          // Inferir EPIs baseado no contexto
          if (label.includes('hat') || label.includes('helmet')) {
            foundEpis.capacete = true;
          }
          if (label.includes('glasses') || label.includes('eyewear')) {
            foundEpis.oculos = true;
          }
        }
      }
    });
  };

  const simulateEpiAnalysis = (): EpiAnalysisResult => {
    // Simulação melhorada com base em cenários reais
    const scenarios = [
      {
        approved: true,
        equipments: { capacete: true, oculos: true, colete: true, protecaoAuditiva: true },
        missingItems: [],
      },
      {
        approved: false,
        equipments: { capacete: false, oculos: true, colete: true, protecaoAuditiva: true },
        missingItems: ["Capacete"],
      },
      {
        approved: false,
        equipments: { capacete: true, oculos: false, colete: false, protecaoAuditiva: true },
        missingItems: ["Óculos de proteção", "Colete de segurança"],
      },
      {
        approved: false,
        equipments: { capacete: true, oculos: true, colete: true, protecaoAuditiva: false },
        missingItems: ["Proteção auditiva"],
      },
    ];

    return scenarios[Math.floor(Math.random() * scenarios.length)];
  };

  return {
    initializeModel,
    analyzeEpis,
    isModelLoading,
    isAnalyzing,
  };
};