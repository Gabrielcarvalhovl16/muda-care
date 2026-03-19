import { useState, useEffect } from 'react';
import { getMudas, saveMuda, deleteMuda } from '@/lib/store';
import { Muda, TIPOS_MUDA } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

function MudaForm({ muda, onSave, onCancel }: { muda?: Muda; onSave: (m: Muda) => void; onCancel: () => void }) {
  const [nome, setNome] = useState(muda?.nome || '');
  const [tipo, setTipo] = useState(muda?.tipo || TIPOS_MUDA[0]);
  const [quantidade, setQuantidade] = useState(muda?.quantidade ?? 0);
  const [descricao, setDescricao] = useState(muda?.descricao || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onSave({
      id: muda?.id || crypto.randomUUID(),
      nome: nome.trim(),
      tipo,
      quantidade,
      descricao,
      criadoEm: muda?.criadoEm || new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome *</label>
        <Input value={nome} onChange={e => setNome(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium">Tipo</label>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {TIPOS_MUDA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Quantidade</label>
        <Input type="number" min={0} value={quantidade} onChange={e => setQuantidade(+e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium">Descrição</label>
        <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{muda ? 'Salvar' : 'Cadastrar'}</Button>
      </div>
    </form>
  );
}

export default function Catalogo() {
  const [mudas, setMudas] = useState<Muda[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Muda | undefined>();

  const reload = () => setMudas(getMudas());
  useEffect(reload, []);

  const handleSave = (m: Muda) => {
    saveMuda(m);
    setDialogOpen(false);
    setEditing(undefined);
    reload();
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir esta muda?')) {
      deleteMuda(id);
      reload();
    }
  };

  const openEdit = (m: Muda) => {
    setEditing(m);
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Catálogo de Mudas</h1>
        <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) setEditing(undefined); }}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nova Muda</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar Muda' : 'Nova Muda'}</DialogTitle></DialogHeader>
            <MudaForm muda={editing} onSave={handleSave} onCancel={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {mudas.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma muda cadastrada. Clique em "Nova Muda" para começar.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mudas.map(m => (
            <div key={m.id} className="stat-card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{m.nome}</h3>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{m.tipo}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary">{m.quantidade}</p>
              <p className="text-xs text-muted-foreground">em estoque</p>
              {m.descricao && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{m.descricao}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
