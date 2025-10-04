const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface AnalyzeResponse {
  approved: boolean;
  detectedEquipment: string[];
  missingItems: string[];
  message?: string;
  error?: string;
}

export const apiService = {
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.status === 'online' && data.detector_loaded;
    } catch (error) {
      console.error('Erro ao verificar saúde do servidor:', error);
      return false;
    }
  },

  async analyzePPE(imageBase64: string): Promise<AnalyzeResponse> {
    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao analisar EPIs:', error);
      throw error;
    }
  },
};
