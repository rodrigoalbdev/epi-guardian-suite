import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Users, BarChart3, Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Usuario {
  id: string;
  matricula: string;
  nome: string;
  area: string;
  status: 'ativo' | 'inativo';
  ultimoAcesso?: string;
}

interface AdminPanelProps {
  onBackToLogin: () => void;
}

const AdminPanel = ({ onBackToLogin }: AdminPanelProps) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { 
      id: '1', 
      matricula: '12345', 
      nome: 'João Silva', 
      area: 'Produção', 
      status: 'ativo',
      ultimoAcesso: '2024-01-15 14:30'
    },
    { 
      id: '2', 
      matricula: '67890', 
      nome: 'Maria Santos', 
      area: 'Manutenção', 
      status: 'ativo',
      ultimoAcesso: '2024-01-15 13:45'
    },
    { 
      id: '3', 
      matricula: '11111', 
      nome: 'Pedro Costa', 
      area: 'Qualidade', 
      status: 'inativo',
      ultimoAcesso: '2024-01-10 09:15'
    },
  ]);

  const [novoUsuario, setNovoUsuario] = useState({
    matricula: '',
    nome: '',
    area: '',
  });
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);

  const areas = ['Produção', 'Manutenção', 'Qualidade', 'Segurança', 'Administração'];

  const adicionarUsuario = () => {
    if (!novoUsuario.matricula || !novoUsuario.nome || !novoUsuario.area) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (usuarios.some(u => u.matricula === novoUsuario.matricula)) {
      toast.error("Matrícula já cadastrada");
      return;
    }

    const usuario: Usuario = {
      id: Date.now().toString(),
      ...novoUsuario,
      status: 'ativo',
    };

    setUsuarios([...usuarios, usuario]);
    setNovoUsuario({ matricula: '', nome: '', area: '' });
    setDialogAberto(false);
    toast.success("Usuário adicionado com sucesso");
  };

  const editarUsuario = () => {
    if (!editandoUsuario) return;

    if (!editandoUsuario.matricula || !editandoUsuario.nome || !editandoUsuario.area) {
      toast.error("Preencha todos os campos");
      return;
    }

    setUsuarios(usuarios.map(u => 
      u.id === editandoUsuario.id ? editandoUsuario : u
    ));
    setEditandoUsuario(null);
    setDialogAberto(false);
    toast.success("Usuário atualizado com sucesso");
  };

  const removerUsuario = (id: string) => {
    setUsuarios(usuarios.filter(u => u.id !== id));
    toast.success("Usuário removido com sucesso");
  };

  const alternarStatus = (id: string) => {
    setUsuarios(usuarios.map(u => 
      u.id === id 
        ? { ...u, status: u.status === 'ativo' ? 'inativo' : 'ativo' }
        : u
    ));
    toast.success("Status alterado com sucesso");
  };

  // Simulação de estatísticas
  const stats = {
    totalUsuarios: usuarios.length,
    usuariosAtivos: usuarios.filter(u => u.status === 'ativo').length,
    acessosHoje: 15,
    aprovacaoEpis: 85,
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBackToLogin}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground">Sistema EPI Guardian</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">Admin</span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total de Usuários</p>
                  <p className="text-3xl font-bold">{stats.totalUsuarios}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-epi-success">{stats.usuariosAtivos}</p>
                </div>
                <div className="h-8 w-8 bg-epi-success/10 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-epi-success rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Acessos Hoje</p>
                  <p className="text-3xl font-bold">{stats.acessosHoje}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Taxa de Aprovação</p>
                  <p className="text-3xl font-bold text-epi-success">{stats.aprovacaoEpis}%</p>
                </div>
                <Shield className="h-8 w-8 text-epi-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gerenciamento de Usuários */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Gerenciamento de Usuários</CardTitle>
              <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogTrigger asChild>
                  <Button variant="industrial" onClick={() => {
                    setEditandoUsuario(null);
                    setNovoUsuario({ matricula: '', nome: '', area: '' });
                  }}>
                    <Plus className="h-4 w-4" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editandoUsuario ? 'Editar Usuário' : 'Novo Usuário'}
                    </DialogTitle>
                    <DialogDescription>
                      {editandoUsuario 
                        ? 'Modifique as informações do usuário'
                        : 'Adicione um novo usuário ao sistema'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="matricula">Matrícula</Label>
                      <Input
                        id="matricula"
                        value={editandoUsuario ? editandoUsuario.matricula : novoUsuario.matricula}
                        onChange={(e) => {
                          if (editandoUsuario) {
                            setEditandoUsuario({ ...editandoUsuario, matricula: e.target.value });
                          } else {
                            setNovoUsuario({ ...novoUsuario, matricula: e.target.value });
                          }
                        }}
                        placeholder="Ex: 12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        value={editandoUsuario ? editandoUsuario.nome : novoUsuario.nome}
                        onChange={(e) => {
                          if (editandoUsuario) {
                            setEditandoUsuario({ ...editandoUsuario, nome: e.target.value });
                          } else {
                            setNovoUsuario({ ...novoUsuario, nome: e.target.value });
                          }
                        }}
                        placeholder="Nome do usuário"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Área</Label>
                      <Select
                        value={editandoUsuario ? editandoUsuario.area : novoUsuario.area}
                        onValueChange={(value) => {
                          if (editandoUsuario) {
                            setEditandoUsuario({ ...editandoUsuario, area: value });
                          } else {
                            setNovoUsuario({ ...novoUsuario, area: value });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a área" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map(area => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={editandoUsuario ? editarUsuario : adicionarUsuario}
                        className="flex-1"
                        variant="industrial"
                      >
                        {editandoUsuario ? 'Salvar' : 'Adicionar'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setDialogAberto(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-mono">{usuario.matricula}</TableCell>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.area}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={usuario.status === 'ativo' ? 'default' : 'secondary'}
                          className={usuario.status === 'ativo' ? 'bg-epi-success' : 'bg-muted'}
                        >
                          {usuario.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {usuario.ultimoAcesso || 'Nunca'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alternarStatus(usuario.id)}
                          >
                            {usuario.status === 'ativo' ? 'Inativar' : 'Ativar'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditandoUsuario(usuario);
                              setDialogAberto(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerUsuario(usuario.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;