import { useEffect, useState } from 'react';
import { getStats, getMovimentacoes, getMudas } from '@/lib/store';
import { Leaf, Package, MapPin, Heart, ArrowDown } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(getStats());
  const [recentMovs, setRecentMovs] = useState(getMovimentacoes().slice(-5).reverse());
  const mudas = getMudas();

  useEffect(() => {
    setStats(getStats());
    setRecentMovs(getMovimentacoes().slice(-5).reverse());
  }, []);

  const cards = [
    { label: 'Mudas Cadastradas', value: stats.totalMudas, icon: Leaf, color: 'text-primary' },
    { label: 'Em Estoque', value: stats.totalEstoque, icon: Package, color: 'text-info' },
    { label: 'Plantadas', value: stats.totalPlantado, icon: MapPin, color: 'text-success' },
    { label: 'Doadas', value: stats.totalDoado, icon: Heart, color: 'text-destructive' },
    { label: 'Recebidas', value: stats.totalRecebido, icon: ArrowDown, color: 'text-warning' },
  ];

  const getMudaNome = (id: string) => mudas.find(m => m.id === id)?.nome || 'Desconhecida';

  const tipoLabel: Record<string, string> = {
    entrada: 'Entrada',
    saida: 'Saída',
    doacao: 'Doação',
    recebimento: 'Recebimento',
    plantio: 'Plantio',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="stat-card flex flex-col items-center text-center gap-2">
            <c.icon className={`h-8 w-8 ${c.color}`} />
            <span className="text-2xl font-bold">{c.value}</span>
            <span className="text-sm text-muted-foreground">{c.label}</span>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">Movimentações Recentes</h2>
      {recentMovs.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma movimentação registrada.</p>
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
                </tr>
              </thead>
              <tbody>
                {recentMovs.map(m => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="px-4 py-2">{new Date(m.data).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-2">{getMudaNome(m.mudaId)}</td>
                    <td className="px-4 py-2">{tipoLabel[m.tipo] || m.tipo}</td>
                    <td className="px-4 py-2 text-right font-medium">{m.quantidade}</td>
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
