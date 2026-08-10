export interface Perfil {
  renda: number;
  gastos: number;
  idade: number;
  objetivo: 'estabilidade' | 'viagem' | 'outro';
}

export interface Transacao {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  motivo: string;
  data: string;
}

export interface Estado {
  perfil: Perfil | null;
  saldo: number;
  transacoes: Transacao[];
}
