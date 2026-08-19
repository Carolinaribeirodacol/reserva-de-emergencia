import { useState } from 'react';

interface Props {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

export function CampoSenha({ value, onChange, placeholder, autoComplete, autoFocus }: Props) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="input-wrapper">
      <span>🔑</span>
      <input
        type={visivel ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        className="btn-olho"
        onClick={() => setVisivel(v => !v)}
        aria-label={visivel ? 'Esconder senha' : 'Mostrar senha'}
        title={visivel ? 'Esconder senha' : 'Mostrar senha'}
      >
        <span className="material-symbols-outlined">
          {visivel ? 'visibility_off' : 'visibility'}
        </span>
      </button>
    </div>
  );
}
