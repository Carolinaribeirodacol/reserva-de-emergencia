import { Button } from './Button';
import type { Tema } from '../hooks/useTema';

interface Props {
  tema: Tema;
  onAlternar: () => void;
}

export function ThemeSwitch({ tema, onAlternar }: Props) {
  const vaiPara = tema === 'dark' ? 'claro' : 'escuro';

  return (
    <Button onClick={onAlternar} title={`Mudar para o tema ${vaiPara}`}>
      {tema === 'dark' ? '☀️' : '🌙'}
    </Button>
  );
}
