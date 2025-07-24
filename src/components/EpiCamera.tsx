import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff, RotateCcw } from "lucide-react";
import { toast } from "sonner";

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Aguardar o vídeo carregar antes de definir como ativo
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
          toast.success("Câmera ativada");
        };
      }
      
      setStream(mediaStream);
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
    setCameraActive(false);
  };

  const simulateEpiAnalysis = (): EpiAnalysisResult => {
    // Simulação da análise de EPIs com resultados aleatórios para demonstração
    const scenarios = [
      // Cenário 1: Todos os EPIs presentes
      {
        approved: true,
        equipments: {
          capacete: true,
          oculos: true,
          colete: true,
          protecaoAuditiva: true,
        },
        missingItems: [],
      },
      // Cenário 2: Faltando capacete
      {
        approved: false,
        equipments: {
          capacete: false,
          oculos: true,
          colete: true,
          protecaoAuditiva: true,
        },
        missingItems: ["Capacete"],
      },
      // Cenário 3: Faltando múltiplos itens
      {
        approved: false,
        equipments: {
          capacete: true,
          oculos: false,
          colete: false,
          protecaoAuditiva: true,
        },
        missingItems: ["Óculos de proteção", "Colete de segurança"],
      },
    ];

    return scenarios[Math.floor(Math.random() * scenarios.length)];
  };

  const analyzeEpis = async () => {
    if (!cameraActive) {
      toast.error("Ative a câmera primeiro");
      return;
    }

    setIsAnalyzing(true);
    toast.info("Analisando EPIs...");

    // Simular tempo de processamento
    setTimeout(() => {
      const result = simulateEpiAnalysis();
      setIsAnalyzing(false);
      onAnalysisComplete(result);
    }, 3000);
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
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-lg font-medium">Analisando EPIs...</p>
                    <p className="text-sm opacity-80">Verificando equipamentos de segurança</p>
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
                    onClick={analyzeEpis} 
                    variant="success" 
                    size="lg"
                    disabled={isAnalyzing}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {isAnalyzing ? "Analisando..." : "Verificar EPIs"}
                  </Button>
                </>
              )}
            </div>

            {/* Instruções */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Instruções:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Posicione-se de frente para a câmera</li>
                <li>• Certifique-se de que todos os EPIs estejam visíveis</li>
                <li>• Aguarde a análise automática</li>
                <li>• EPIs verificados: Capacete, Óculos, Colete, Proteção Auditiva</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EpiCamera;