import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff, Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import { useEpiDetection } from "@/hooks/useEpiDetection";

interface EpiCameraProps {
  matricula: string;
  onAnalysisComplete: (result: EpiAnalysisResult) => void;
}

export interface EpiAnalysisResult {
  approved: boolean;
  detectedEquipment: string[];
  missingItems: string[];
}

const EpiCamera = ({ matricula, onAnalysisComplete }: EpiCameraProps) => {
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { analyzeEpis, isAnalyzing, isServerConnected } = useEpiDetection();

  const startCamera = async () => {
    try {
      if (!isServerConnected) {
        toast.error("Servidor de detecção não está disponível. Verifique se o servidor Python está rodando.");
        return;
      }

      toast.info("Solicitando permissão da câmera...");
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      toast.success("Câmera ativada com sucesso!");

    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      toast.error("Erro ao acessar a câmera. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleEpiAnalysis = async () => {
    if (!cameraActive || !videoRef.current) {
      toast.error("A câmera precisa estar ativa para análise");
      return;
    }

    if (!isServerConnected) {
      toast.error("Servidor de detecção não está disponível");
      return;
    }

    const video = videoRef.current;
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      toast.error("Aguarde o vídeo carregar completamente");
      return;
    }

    try {
      toast.info("Enviando imagem para análise...");
      
      const result = await analyzeEpis(video);
      
      if (result.approved) {
        toast.success("Análise concluída! Todos os EPIs detectados.");
      } else {
        toast.warning(`EPIs faltando: ${result.missingItems.join(", ")}`);
      }
      
      onAnalysisComplete(result);
      
    } catch (error) {
      console.error("Erro ao analisar EPIs:", error);
      toast.error("Erro ao analisar a imagem. Tente novamente.");
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verificação de EPIs</CardTitle>
            <p className="text-muted-foreground">Matrícula: {matricula}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Área da Câmera */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ 
                  transform: 'scaleX(-1)',
                  display: cameraActive ? 'block' : 'none'
                }}
              />
              
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <Camera className="h-16 w-16 mx-auto mb-4" />
                    <p>Câmera desativada</p>
                  </div>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-lg font-medium">Analisando EPIs...</p>
                    <p className="text-sm opacity-80">Processando com YOLO</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controles */}
            <div className="flex gap-4 justify-center">
              {!cameraActive ? (
                <Button
                  onClick={startCamera}
                  disabled={!isServerConnected}
                  className="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {isServerConnected ? 'Ativar Câmera' : 'Servidor Offline'}
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={stopCamera} 
                    variant="outline"
                  >
                    <CameraOff className="mr-2 h-4 w-4" />
                    Desativar
                  </Button>
                  <Button 
                    onClick={handleEpiAnalysis} 
                    variant="default"
                    disabled={isAnalyzing}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    {isAnalyzing ? "Analisando..." : "Verificar EPIs"}
                  </Button>
                </>
              )}
            </div>

            {/* Informações do sistema */}
            <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border border-border">
              <p className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-semibold">Detecção YOLO - Servidor Python</span>
              </p>
              <p className="text-xs leading-relaxed">
                Sistema integrado com modelo YOLO treinado para detectar EPIs (capacete, máscara, colete).
                Status do servidor: {isServerConnected ? '🟢 Online' : '🔴 Offline'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EpiCamera;
