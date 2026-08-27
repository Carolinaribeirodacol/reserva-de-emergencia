import { Button } from './Button';
import type { Theme } from '../hooks/useTheme';

interface Props {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeSwitch({ theme, onToggle }: Props) {
  const goingTo = theme === 'dark' ? 'claro' : 'escuro';

  return (
    <Button onClick={onToggle} title={`Mudar para o tema ${goingTo}`}>
      {
        theme === 'dark' ?
          <span className="material-symbols-outlined">
            light_mode
          </span> :
          <span className="material-symbols-outlined">
            dark_mode
          </span>
      }
    </Button>
  );
}
