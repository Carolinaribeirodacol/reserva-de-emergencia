import type { PropsWithChildren } from "react";
import { Button } from "./Button";

interface Props {
  theme: 'dark' | 'light'
}

export function ThemeSwitch({theme, children}: PropsWithChildren<Props>) {
  const handleClick = () => {
    const shouldHandleTheme = confirm(`Deseja alterar o tema para ${theme}?`)

    if (!shouldHandleTheme) {
      return
    }

    document.body.classList.add(`${theme}-theme`)

    const themeToRemove = theme === 'dark' ? 'light' : 'dark'
    document.body.classList.remove(`${themeToRemove}-theme`)
  }

  return (
    <Button onClick={handleClick}>{children}</Button>
  )
}