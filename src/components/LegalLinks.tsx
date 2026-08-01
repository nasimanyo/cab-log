import { Link } from 'react-router-dom'

interface LegalLinksProps {
  className?: string
}

export default function LegalLinks({ className = '' }: LegalLinksProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 ${className}`.trim()}>
      <Link to="/terms" className="transition hover:text-brand-600 dark:hover:text-brand-400">
        利用規約
      </Link>
      <span aria-hidden="true">・</span>
      <Link to="/privacy-policy" className="transition hover:text-brand-600 dark:hover:text-brand-400">
        プライバシーポリシー
      </Link>
    </div>
  )
}
