export const SENHA_MINIMA = 6;

const TEM_MINUSCULA = /[a-z]/;
const TEM_MAIUSCULA = /[A-Z]/;
const TEM_NUMERO = /[0-9]/;
const TEM_SIMBOLO = /[^A-Za-z0-9]/;

export function senhaAtendeRequisitos(valor: string): boolean {
  return (
    valor.length >= SENHA_MINIMA &&
    TEM_MINUSCULA.test(valor) &&
    TEM_MAIUSCULA.test(valor) &&
    TEM_NUMERO.test(valor) &&
    TEM_SIMBOLO.test(valor)
  );
}

export const DICA_SENHA =
  `Mínimo de ${SENHA_MINIMA} caracteres, com letra maiúscula, minúscula, número e símbolo (ex: !@#$%).`;

export function traduzirErroSenha(mensagemMinuscula: string): string | null {
  const tamanho = mensagemMinuscula.match(/at least (\d+) character/);

  if (mensagemMinuscula.includes('character of each')) {
    const minimo = tamanho ? ` (mínimo de ${tamanho[1]} caracteres)` : '';
    return `A senha precisa ter letra maiúscula, letra minúscula, número e símbolo${minimo}.`;
  }

  if (mensagemMinuscula.includes('password should be at least')) {
    return `A senha precisa ter pelo menos ${tamanho?.[1] ?? SENHA_MINIMA} caracteres.`;
  }

  return null;
}
