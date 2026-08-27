import { useState } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

export function PasswordField({ value, onChange, placeholder, autoComplete, autoFocus }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="input-wrapper">
      <span>🔑</span>
      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        className="btn-eye"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}
        title={visible ? 'Esconder senha' : 'Mostrar senha'}
      >
        <span className="material-symbols-outlined">
          {visible ? 'visibility_off' : 'visibility'}
        </span>
      </button>
    </div>
  );
}
