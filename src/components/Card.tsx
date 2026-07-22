import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  icon?: string
  children: ReactNode
  className?: string
  id?: string
}

export default function Card({ title, icon, children, className = '', id }: CardProps) {
  return (
    <section id={id} className={`card ${className}`}>
      {title && (
        <div className="flex items-center gap-1.5 mb-3">
          {icon && <span className="material-symbols-outlined text-brand-600 dark:text-brand-400">{icon}</span>}
          <h2 className="font-bold text-base">{title}</h2>
        </div>
      )}
      {children}
    </section>
  )
}
