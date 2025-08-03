import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff, RotateCcw, Brain, Zap } from "lucide-react";
import { toast } from "sonner";
import { useEpiDetection } from "@/hooks/useEpiDetection";

interface EpiCameraProps {
  matricula: string;
  onAnalysisComplete: (result: EpiAnalysisResult) => void;
}

export interface EpiAnalysisResult {
  approved: boolean;
  equipments: {
    capacete: boolean;
    oculos: boolean;
    colete: boolean;
    protecaoAuditiva: boolean;
  };
  missingItems: string[];
}

const EpiCamera = ({ matricula, onAnalysisComplete }: EpiCameraProps) => {
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { initializeModel, analyzeEpis, isModelLoading, isAnalyzing } = useEpiDetection();

  const startCamera = async () => {
    try {
      console.log('🎥 Iniciando câmera...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      console.log('📹 Stream obtido:', mediaStream);
      console.log('📹 Tracks do stream:', mediaStream.getVideoTracks());
      
      if (videoRef.current) {
        console.log('📺 Atribuindo stream ao vídeo...');
        videoRef.current.srcObject = mediaStream;
        
        // Aguardar o vídeo carregar
        const handleLoadedMetadata = () => {
          console.log('📺 Metadata carregada, dimensões:', {
            videoWidth: videoRef.current?.videoWidth,
            videoHeight: videoRef.current?.videoHeight,
            readyState: videoRef.current?.readyState
          });
          
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('✅ Vídeo reproduzindo com sucesso!');
              setStream(mediaStream);
              setCameraActive(true);
              toast.success("Câmera ativada com sucesso");
            }).catch(error => {
              console.error('❌ Erro ao reproduzir vídeo:', error);
              toast.error("Erro ao iniciar reprodução do vídeo");
            });
          }
        };
        
        // Remover listener anterior se existir
        videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        
        // Se já tem metadata, chamar imediatamente
        if (videoRef.current.readyState >= 1) {
          console.log('📺 Metadata já disponível, reproduzindo...');
          handleLoadedMetadata();
        }
      } else {
        console.error('❌ Ref do vídeo não encontrada');
        toast.error("Erro interno: elemento de vídeo não encontrado");
      }
      
      // Inicializar modelo de IA em paralelo
      initializeModel().then(() => {
        toast.success("🚧 IA PPE carregada - Detecção especializada ativa!");
      }).catch(error => {
        console.error('Erro ao carregar IA:', error);
        toast.warning("IA indisponível - usando análise básica");
      });
      
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
      toast.error("Ative a câmera primeiro");
      return;
    }

    const video = videoRef.current;
    console.log('🎬 Verificando estado do vídeo antes da análise:', {
      paused: video.paused,
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      currentTime: video.currentTime,
      srcObject: !!video.srcObject
    });

    // Verificar se o vídeo está realmente reproduzindo
    if (video.paused) {
      console.log('⚠️ Vídeo está pausado, tentando reproduzir...');
      try {
        await video.play();
        console.log('✅ Vídeo reproduzindo após tentativa manual');
      } catch (error) {
        console.error('❌ Erro ao reproduzir vídeo:', error);
        toast.error("Erro: vídeo não está reproduzindo");
        return;
      }
    }

    toast.info("🔍 Analisando EPIs com IA...");

    try {
      const result = await analyzeEpis(video);
      onAnalysisComplete(result);
      
      if (result.approved) {
        toast.success("✅ EPIs detectados com sucesso!");
      } else {
        toast.warning(`⚠️ ${result.missingItems.length} EPI(s) em falta detectado(s)`);
      }
    } catch (error) {
      console.error("Erro na análise:", error);
      toast.error("Erro na análise. Tente novamente.");
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
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <Camera className="h-16 w-16 mx-auto mb-4" />
                    <p>Câmera desativada</p>
                  </div>
                </div>
              )}
              
              {(isAnalyzing || isModelLoading) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-lg font-medium">
                      {isModelLoading ? "Carregando IA..." : "Analisando EPIs..."}
                    </p>
                    <p className="text-sm opacity-80">
                      {isModelLoading ? "Preparando detecção avançada" : "Verificando equipamentos de segurança"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Controles */}
            <div className="flex gap-4 justify-center">
              {!cameraActive ? (
                <Button onClick={startCamera} variant="industrial" size="lg">
                  <Camera className="h-4 w-4" />
                  Ativar Câmera
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={stopCamera} 
                    variant="outline" 
                    size="lg"
                  >
                    <CameraOff className="h-4 w-4" />
                    Desativar
                  </Button>
                  <Button 
                    onClick={handleEpiAnalysis} 
                    variant="success" 
                    size="lg"
                    disabled={isAnalyzing || isModelLoading}
                  >
                    {isModelLoading ? (
                      <Brain className="h-4 w-4 animate-pulse" />
                    ) : isAnalyzing ? (
                      <RotateCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    {isModelLoading ? "Carregando IA..." : isAnalyzing ? "Analisando..." : "Verificar EPIs"}
                  </Button>
                </>
              )}
            </div>

            {/* Instruções */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="font-medium">🚧 Detecção PPE Especializada</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Modelo treinado com dataset PPE industrial real</li>
                <li>• Detecta: Capacete, Óculos, Colete, Proteção Auditiva</li>
                <li>• Análise contextual por região corporal</li>
                <li>• Detecção de ausência de EPIs (NO-EPIs)</li>
                <li>• Baseado no trabalho de Vinayakmane47/PPE_detection_YOLO</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EpiCamera;