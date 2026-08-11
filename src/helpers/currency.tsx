export function formatCurrency(valor: string) {
  const onlyNumbers = valor.replace(/\D/g, '');

  if (!onlyNumbers) return '';

  const numero = Number(onlyNumbers) / 100;

  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function currencyToNumber(valor: string) {
  return Number(
    valor
      .replace(/\./g, '')
      .replace(',', '.')
  );
}