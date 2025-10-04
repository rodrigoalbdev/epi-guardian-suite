import { useState, useCallback, useEffect } from 'react';
import { apiService } from '@/services/apiService';

type EpiAnalysisResult = {
  approved: boolean;
  detectedEquipment: string[];
  missingItems: string[];
};

export const useEpiDetection = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);

  // Verificar conexão com o servidor ao montar
  useEffect(() => {
    const checkServer = async () => {
      const isConnected = await apiService.healthCheck();
      setIsServerConnected(isConnected);
      if (!isConnected) {
        console.error('Servidor de detecção não está disponível');
      } else {
        console.log('✅ Servidor de detecção conectado');
      }
    };
    
    checkServer();
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkServer, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const analyzeEpis = useCallback(async (videoElement: HTMLVideoElement): Promise<EpiAnalysisResult> => {
    setIsAnalyzing(true);

    try {
      if (!isServerConnected) {
        throw new Error('Servidor de detecção não está conectado');
      }

      if (!videoElement || videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
        throw new Error('Vídeo não está pronto');
      }

      console.log('Capturando frame do vídeo...');
      
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Não foi possível obter contexto do canvas');
      }

      ctx.drawImage(videoElement, 0, 0);
      
      console.log('Frame capturado, enviando para análise...');
      
      // Converter canvas para base64
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
      
      // Enviar para o servidor Python
      const result = await apiService.analyzePPE(imageBase64);
      
      console.log('Resultado da análise:', result);
      
      setIsAnalyzing(false);
      return {
        approved: result.approved,
        detectedEquipment: result.detectedEquipment,
        missingItems: result.missingItems
      };
    } catch (error) {
      console.error('Erro na análise de EPIs:', error);
      setIsAnalyzing(false);
      throw error;
    }
  }, [isServerConnected]);

  return {
    analyzeEpis,
    isAnalyzing,
    isServerConnected,
  };
};
