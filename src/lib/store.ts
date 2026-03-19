import { Muda, Movimentacao } from './types';

const MUDAS_KEY = 'mudas_catalog';
const MOVS_KEY = 'mudas_movimentacoes';

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getMudas(): Muda[] {
  return load<Muda>(MUDAS_KEY);
}

export function saveMuda(muda: Muda) {
  const mudas = getMudas();
  const idx = mudas.findIndex(m => m.id === muda.id);
  if (idx >= 0) mudas[idx] = muda;
  else mudas.push(muda);
  save(MUDAS_KEY, mudas);
}

export function deleteMuda(id: string) {
  save(MUDAS_KEY, getMudas().filter(m => m.id !== id));
}

export function getMovimentacoes(): Movimentacao[] {
  return load<Movimentacao>(MOVS_KEY);
}

export function saveMovimentacao(mov: Movimentacao) {
  const movs = getMovimentacoes();
  movs.push(mov);
  save(MOVS_KEY, movs);

  // Update stock
  const mudas = getMudas();
  const muda = mudas.find(m => m.id === mov.mudaId);
  if (muda) {
    if (mov.tipo === 'entrada' || mov.tipo === 'recebimento') {
      muda.quantidade += mov.quantidade;
    } else {
      muda.quantidade = Math.max(0, muda.quantidade - mov.quantidade);
    }
    saveMuda(muda);
  }
}

export function getStats() {
  const mudas = getMudas();
  const movs = getMovimentacoes();
  return {
    totalMudas: mudas.length,
    totalEstoque: mudas.reduce((s, m) => s + m.quantidade, 0),
    totalPlantado: movs.filter(m => m.tipo === 'plantio').reduce((s, m) => s + m.quantidade, 0),
    totalDoado: movs.filter(m => m.tipo === 'doacao').reduce((s, m) => s + m.quantidade, 0),
    totalRecebido: movs.filter(m => m.tipo === 'recebimento').reduce((s, m) => s + m.quantidade, 0),
  };
}
