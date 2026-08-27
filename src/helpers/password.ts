export const MIN_PASSWORD_LENGTH = 6;

const HAS_LOWERCASE = /[a-z]/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SYMBOL = /[^A-Za-z0-9]/;

export function passwordMeetsRequirements(value: string): boolean {
  return (
    value.length >= MIN_PASSWORD_LENGTH &&
    HAS_LOWERCASE.test(value) &&
    HAS_UPPERCASE.test(value) &&
    HAS_NUMBER.test(value) &&
    HAS_SYMBOL.test(value)
  );
}

export const PASSWORD_HINT =
  `Mínimo de ${MIN_PASSWORD_LENGTH} caracteres, com letra maiúscula, minúscula, número e símbolo (ex: !@#$%).`;

export function translatePasswordError(lowercaseMessage: string): string | null {
  const length = lowercaseMessage.match(/at least (\d+) character/);

  if (lowercaseMessage.includes('character of each')) {
    const minimum = length ? ` (mínimo de ${length[1]} caracteres)` : '';
    return `A senha precisa ter letra maiúscula, letra minúscula, número e símbolo${minimum}.`;
  }

  if (lowercaseMessage.includes('password should be at least')) {
    return `A senha precisa ter pelo menos ${length?.[1] ?? MIN_PASSWORD_LENGTH} caracteres.`;
  }

  return null;
}
