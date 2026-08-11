import type { PropsWithChildren } from "react"

interface Props{
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  title?: string
}

export function Button({children, onClick, title}: PropsWithChildren<Props>) {
  return (
    <button className="button" onClick={onClick} title={title} aria-label={title}>{children}</button>
  )
}
