import { useState, useEffect } from 'react';
import { getMudas, getMovimentacoes, saveMovimentacao } from '@/lib/store';
import { Muda, Movimentacao } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export default function Doacoes() {
  const [mudas, setMudas] = useState<Muda[]>([]);
  const [movs, setMovs] = useState<Movimentacao[]>([]);
  const [open, setOpen] = useState(false);
  const [mudaId, setMudaId] = useState('');
  const [tipo, setTipo] = useState<'doacao' | 'recebimento'>('doacao');
  const [qtd, setQtd] = useState(1);
  const [desc, setDesc] = useState('');

  const reload = () => {
    setMudas(getMudas());
    setMovs(getMovimentacoes().filter(m => m.tipo === 'doacao' || m.tipo === 'recebimento').reverse());
  };
  useEffect(reload, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mudaId || qtd <= 0) return;
    saveMovimentacao({
      id: crypto.randomUUID(),
      mudaId,
      tipo,
      quantidade: qtd,
      data: new Date().toISOString(),
      descricao: desc,
    });
    setOpen(false);
    setDesc('');
    setQtd(1);
    reload();
  };

  const getMudaNome = (id: string) => mudas.find(m => m.id === id)?.nome || 'Desconhecida';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Doações e Recebimentos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Registrar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Doação/Recebimento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Muda *</label>
                <Select value={mudaId} onValueChange={setMudaId}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {mudas.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <Select value={tipo} onValueChange={v => setTipo(v as 'doacao' | 'recebimento')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doacao">Doação (saída)</SelectItem>
                    <SelectItem value="recebimento">Recebimento (entrada)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Quantidade *</label>
                <Input type="number" min={1} value={qtd} onChange={e => setQtd(+e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">{tipo === 'doacao' ? 'Destinatário' : 'Origem'}</label>
                <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder={tipo === 'doacao' ? 'Para quem foi doado' : 'De onde veio'} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {movs.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma doação ou recebimento registrado.</p>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium">Data</th>
                  <th className="text-left px-4 py-2 font-medium">Muda</th>
                  <th className="text-left px-4 py-2 font-medium">Tipo</th>
                  <th className="text-right px-4 py-2 font-medium">Qtd</th>
                  <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {movs.map(m => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="px-4 py-2">{new Date(m.data).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-2">{getMudaNome(m.mudaId)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.tipo === 'recebimento' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {m.tipo === 'doacao' ? 'Doação' : 'Recebimento'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-medium">{m.quantidade}</td>
                    <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell">{m.descricao || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
