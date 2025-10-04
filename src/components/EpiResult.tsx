import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, HardHat, Eye, Shirt, Home, RotateCcw } from "lucide-react";
import { EpiAnalysisResult } from "./EpiCamera";

interface EpiResultProps {
  result: EpiAnalysisResult;
  matricula: string;
  onBackToHome: () => void;
  onNewAnalysis: () => void;
}

const EpiResult = ({ result, matricula, onBackToHome, onNewAnalysis }: EpiResultProps) => {
  const epiIcons: Record<string, any> = {
    capacete: HardHat,
    mascara: Eye,
    colete: Shirt,
  };

  const epiNames: Record<string, string> = {
    capacete: "Capacete",
    mascara: "Máscara/Óculos",
    colete: "Colete de Segurança",
  };

  // Lista de todos os EPIs verificados
  const allEpis = ['capacete', 'mascara', 'colete'];

  if (result.approved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-epi-success/20 to-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="border-epi-success/50 shadow-xl bg-gradient-to-br from-epi-success/10 to-card">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-epi-success/20 p-4 rounded-full">
                  <CheckCircle className="h-16 w-16 text-epi-success" />
                </div>
              </div>
              <CardTitle className="text-3xl text-epi-success">EPIs Aprovados!</CardTitle>
              <p className="text-lg text-muted-foreground">Matrícula: {matricula}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-xl font-medium text-epi-success mb-4">
                  Perfeito! Todos os EPIs estão sendo utilizados.
                </p>
                <p className="text-muted-foreground">
                  Você está autorizado a continuar suas atividades.
                </p>
              </div>

              {/* Grid de EPIs Detectados */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {result.detectedEquipment.map((epi) => {
                  const Icon = epiIcons[epi] || HardHat;
                  const name = epiNames[epi] || epi;
                  
                  return (
                    <div key={epi} className="bg-epi-success/10 p-4 rounded-lg text-center border border-epi-success/20">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-epi-success" />
                      <p className="text-sm font-medium text-epi-success">{name}</p>
                      <CheckCircle className="h-4 w-4 mx-auto mt-1 text-epi-success" />
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <Button onClick={onBackToHome} variant="outline" size="lg">
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
                <Button onClick={onNewAnalysis} variant="default" size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Nova Verificação
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-epi-danger/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-epi-danger/50 shadow-xl bg-gradient-to-br from-epi-danger/10 to-card">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-epi-danger/20 p-4 rounded-full">
                <XCircle className="h-16 w-16 text-epi-danger" />
              </div>
            </div>
            <CardTitle className="text-3xl text-epi-danger">EPIs Reprovados!</CardTitle>
            <p className="text-lg text-muted-foreground">Matrícula: {matricula}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-xl font-medium text-epi-danger mb-4">
                Atenção! Equipamentos de segurança ausentes.
              </p>
              <p className="text-muted-foreground">
                Vista os EPIs em falta antes de continuar.
              </p>
            </div>

            {/* Lista de EPIs em falta */}
            <div className="bg-epi-danger/10 p-6 rounded-lg border border-epi-danger/20">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-5 w-5 text-epi-danger mr-2" />
                <h3 className="font-semibold text-epi-danger">EPIs em falta:</h3>
              </div>
              <ul className="space-y-2">
                {result.missingItems.map((item, index) => {
                  const name = epiNames[item] || item;
                  return (
                    <li key={index} className="flex items-center text-epi-danger">
                      <XCircle className="h-4 w-4 mr-2" />
                      {name}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Status de todos os EPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allEpis.map((epi) => {
                const Icon = epiIcons[epi] || HardHat;
                const name = epiNames[epi] || epi;
                const isPresent = result.detectedEquipment.includes(epi);
                
                return (
                  <div 
                    key={epi} 
                    className={`p-4 rounded-lg text-center ${
                      isPresent 
                        ? 'bg-epi-success/10 border border-epi-success/20' 
                        : 'bg-epi-danger/10 border border-epi-danger/20'
                    }`}
                  >
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${
                      isPresent ? 'text-epi-success' : 'text-epi-danger'
                    }`} />
                    <p className={`text-sm font-medium ${
                      isPresent ? 'text-epi-success' : 'text-epi-danger'
                    }`}>
                      {name}
                    </p>
                    {isPresent ? (
                      <CheckCircle className="h-4 w-4 mx-auto mt-1 text-epi-success" />
                    ) : (
                      <XCircle className="h-4 w-4 mx-auto mt-1 text-epi-danger" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={onBackToHome} variant="outline" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
              <Button onClick={onNewAnalysis} variant="destructive" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EpiResult;
