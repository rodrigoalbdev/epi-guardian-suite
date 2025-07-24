import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldCheck, HardHat } from "lucide-react";
import { toast } from "sonner";

interface EpiLoginProps {
  onLogin: (matricula: string) => void;
}

const EpiLogin = ({ onLogin }: EpiLoginProps) => {
  const [matricula, setMatricula] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Simulação de usuários cadastrados
  const usuarios = [
    { matricula: "12345", nome: "João Silva", area: "Produção" },
    { matricula: "67890", nome: "Maria Santos", area: "Manutenção" },
    { matricula: "11111", nome: "Pedro Costa", area: "Qualidade" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!matricula.trim()) {
      toast.error("Por favor, insira sua matrícula");
      return;
    }

    setIsLoading(true);
    
    // Simular validação
    setTimeout(() => {
      const usuario = usuarios.find(u => u.matricula === matricula);
      
      if (usuario) {
        toast.success(`Bem-vindo, ${usuario.nome}!`);
        onLogin(matricula);
      } else {
        toast.error("Matrícula não encontrada");
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">EPI Guardian</h1>
          <p className="text-muted-foreground">Sistema de Monitoramento de EPIs</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Acesso ao Sistema</CardTitle>
            <CardDescription>
              Insira sua matrícula para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  type="text"
                  placeholder="Digite sua matrícula"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="h-12 text-center text-lg"
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12" 
                variant="industrial"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <HardHat className="h-4 w-4" />
                    Acessar Sistema
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center mb-2">
                Matrículas de teste:
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                {usuarios.map(user => (
                  <div key={user.matricula} className="flex justify-between">
                    <span className="font-mono">{user.matricula}</span>
                    <span>{user.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EpiLogin;