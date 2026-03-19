export interface Muda {
  id: string;
  nome: string;
  tipo: string;
  quantidade: number;
  descricao: string;
  criadoEm: string;
}

export interface Movimentacao {
  id: string;
  mudaId: string;
  tipo: 'entrada' | 'saida' | 'doacao' | 'recebimento' | 'plantio';
  quantidade: number;
  data: string;
  descricao: string;
  local?: string;
  lat?: number;
  lng?: number;
}

export const TIPOS_MUDA = [
  'Frutífera',
  'Ornamental',
  'Nativa',
  'Medicinal',
  'Exótica',
  'Outra',
];
