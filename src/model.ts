type Client = {
  'id': number;
  'saldo': number;
  'limite': number;
};

type Transaction = {
  'valor': number;
  'tipo': 'c' | 'd';
  'descricao': string;
  'realizada_em': string;
};
