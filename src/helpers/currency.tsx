export function formatCurrency(value: string) {
  const onlyNumbers = value.replace(/\D/g, '');

  if (!onlyNumbers) return '';

  const number = Number(onlyNumbers) / 100;

  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function currencyToNumber(value: string) {
  return Number(
    value
      .replace(/\./g, '')
      .replace(',', '.')
  );
}
