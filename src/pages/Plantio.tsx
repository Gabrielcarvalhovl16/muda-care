import { useState, useEffect } from 'react';
import { getMudas, getMovimentacoes, saveMovimentacao } from '@/lib/store';
import { Muda, Movimentacao } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Plantio() {
  const [mudas, setMudas] = useState<Muda[]>([]);
  const [plantios, setPlantios] = useState<Movimentacao[]>([]);
  const [open, setOpen] = useState(false);
  const [mudaId, setMudaId] = useState('');
  const [qtd, setQtd] = useState(1);
  const [local, setLocal] = useState('');
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [pickingLocation, setPickingLocation] = useState(false);

  const reload = () => {
    setMudas(getMudas());
    setPlantios(getMovimentacoes().filter(m => m.tipo === 'plantio').reverse());
  };
  useEffect(reload, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mudaId || qtd <= 0) return;
    saveMovimentacao({
      id: crypto.randomUUID(),
      mudaId,
      tipo: 'plantio',
      quantidade: qtd,
      data: new Date().toISOString(),
      descricao: local,
      local,
      lat,
      lng,
    });
    setOpen(false);
    setLocal('');
    setQtd(1);
    setLat(undefined);
    setLng(undefined);
    reload();
  };

  const getMudaNome = (id: string) => mudas.find(m => m.id === id)?.nome || 'Desconhecida';
  const plantiosComCoord = plantios.filter(p => p.lat && p.lng);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Registro de Plantio</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo Plantio</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Plantio</DialogTitle></DialogHeader>
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
                <label className="text-sm font-medium">Quantidade *</label>
                <Input type="number" min={1} value={qtd} onChange={e => setQtd(+e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Local</label>
                <Input value={local} onChange={e => setLocal(e.target.value)} placeholder="Ex: Praça central" />
              </div>
              <div>
                <label className="text-sm font-medium">Coordenadas (clique no mapa)</label>
                <div className="h-48 rounded-lg overflow-hidden border mt-1">
                  <MapContainer center={[-15.78, -47.93]} zoom={4} className="h-full w-full" style={{ zIndex: 0 }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker onSelect={(la, ln) => { setLat(la); setLng(ln); setPickingLocation(false); }} />
                    {lat && lng && <Marker position={[lat, lng]} />}
                  </MapContainer>
                </div>
                {lat && lng && <p className="text-xs text-muted-foreground mt-1">Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}</p>}
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Map with planting points */}
      {plantiosComCoord.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Mapa de Plantios</h2>
          <div className="h-72 md:h-96 rounded-xl overflow-hidden border">
            <MapContainer
              center={[plantiosComCoord[0].lat!, plantiosComCoord[0].lng!]}
              zoom={5}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {plantiosComCoord.map(p => (
                <Marker key={p.id} position={[p.lat!, p.lng!]}>
                  <Popup>
                    <strong>{getMudaNome(p.mudaId)}</strong><br />
                    Qtd: {p.quantidade}<br />
                    {new Date(p.data).toLocaleDateString('pt-BR')}<br />
                    {p.local && <>Local: {p.local}</>}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Table */}
      {plantios.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum plantio registrado.</p>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium">Data</th>
                  <th className="text-left px-4 py-2 font-medium">Muda</th>
                  <th className="text-right px-4 py-2 font-medium">Qtd</th>
                  <th className="text-left px-4 py-2 font-medium">Local</th>
                </tr>
              </thead>
              <tbody>
                {plantios.map(m => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="px-4 py-2">{new Date(m.data).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-2">{getMudaNome(m.mudaId)}</td>
                    <td className="px-4 py-2 text-right font-medium">{m.quantidade}</td>
                    <td className="px-4 py-2 text-muted-foreground">{m.local || '—'}</td>
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
