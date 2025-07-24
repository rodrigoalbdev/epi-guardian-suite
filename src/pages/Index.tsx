import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import EpiLogin from "@/components/EpiLogin";
import EpiCamera from "@/components/EpiCamera";
import EpiResult from "@/components/EpiResult";
import AdminPanel from "@/components/AdminPanel";
import type { EpiAnalysisResult } from "@/components/EpiCamera";

type AppState = 'login' | 'camera' | 'result' | 'admin';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentMatricula, setCurrentMatricula] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<EpiAnalysisResult | null>(null);

  const handleLogin = (matricula: string) => {
    setCurrentMatricula(matricula);
    setAppState('camera');
  };

  const handleAnalysisComplete = (result: EpiAnalysisResult) => {
    setAnalysisResult(result);
    setAppState('result');
  };

  const handleBackToHome = () => {
    setAppState('login');
    setCurrentMatricula('');
    setAnalysisResult(null);
  };

  const handleNewAnalysis = () => {
    setAppState('camera');
    setAnalysisResult(null);
  };

  if (appState === 'admin') {
    return <AdminPanel onBackToLogin={handleBackToHome} />;
  }

  if (appState === 'camera') {
    return (
      <EpiCamera
        matricula={currentMatricula}
        onAnalysisComplete={handleAnalysisComplete}
      />
    );
  }

  if (appState === 'result' && analysisResult) {
    return (
      <EpiResult
        result={analysisResult}
        matricula={currentMatricula}
        onBackToHome={handleBackToHome}
        onNewAnalysis={handleNewAnalysis}
      />
    );
  }

  return (
    <div className="relative">
      <EpiLogin onLogin={handleLogin} />
      
      {/* Botão Admin (modo demo) */}
      <div className="fixed top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAppState('admin')}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Admin
        </Button>
      </div>
    </div>
  );
};

export default Index;
