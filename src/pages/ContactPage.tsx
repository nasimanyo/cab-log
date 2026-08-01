import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/Card'

interface ContactFormState {
  name: string
  email: string
  category: string
  content: string
  consent: boolean
}

type ContactStep = 'form' | 'confirm' | 'done'

const defaultForm: ContactFormState = {
  name: '',
  email: '',
  category: 'question',
  content: '',
  consent: false
}

const CATEGORY_LABEL: Record<string, string> = {
  question: '質問',
  bug: '不具合報告',
  other: 'その他'
}

const CONTACT_EMAIL = 'cab.log.jp@gmail.com'

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormState>(defaultForm)
  const [step, setStep] = useState<ContactStep>('form')
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({})

  const validate = () => {
    const nextErrors: Partial<Record<keyof ContactFormState, string>> = {}

    if (!form.name.trim()) nextErrors.name = 'お名前を入力してください。'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'メールアドレスを正しく入力してください。'
    if (!form.content.trim()) nextErrors.content = '内容を入力してください。'
    if (!form.consent) nextErrors.consent = 'お問い合わせの前に同意が必要です。'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handlePreview = () => {
    if (validate()) setStep('confirm')
  }

  const handleBack = () => {
    setStep('form')
  }

  const handleSubmit = () => {
    const subject = `[カブログ] ${CATEGORY_LABEL[form.category] ?? 'お問い合わせ'}`
    const body = [
      `お名前: ${form.name}`,
      `メールアドレス: ${form.email}`,
      `カテゴリ: ${CATEGORY_LABEL[form.category] ?? form.category}`,
      '',
      form.content
    ].join('\n')

    if (typeof window !== 'undefined') {
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }

    setStep('done')
  }

  const handleReset = () => {
    setForm(defaultForm)
    setErrors({})
    setStep('form')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-bold text-lg">お問い合わせ</h1>
        <Link to="/help" className="text-sm text-brand-600 dark:text-brand-400 font-medium">
          ヘルプへ戻る
        </Link>
      </div>

      <Card id="contact-form" title={step === 'confirm' ? '内容確認' : step === 'done' ? '送信完了' : 'お問い合わせ内容'} icon="mail">
        {step === 'form' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="contact-name">お名前</label>
              <input
                id="contact-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="input-field"
                placeholder="例: かぶろぐ　たろう"
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="contact-email">メールアドレス</label>
              <input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="input-field"
                placeholder="example@example.com"
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="contact-category">お問い合わせ種別</label>
              <select
                id="contact-category"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="input-field"
              >
                <option value="question">質問</option>
                <option value="bug">不具合報告</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="contact-content">内容</label>
              <textarea
                id="contact-content"
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                className="input-field min-h-32 resize-y"
                placeholder="お問い合わせ内容を入力してください"
              />
              {errors.content && <p className="text-xs text-red-600">{errors.content}</p>}
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm((prev) => ({ ...prev, consent: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <span>
                お問い合わせ内容を確認し、返信のためにメールアドレスを利用することに同意します。
              </span>
            </label>
            {errors.consent && <p className="text-xs text-red-600">{errors.consent}</p>}

            <button type="button" onClick={handlePreview} className="btn-primary w-full">
              <span className="material-symbols-outlined">preview</span>
              内容を確認する
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              以下の内容でお問い合わせを送信します。よろしければ「送信する」を押してください。
            </p>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2 text-sm">
              <p><span className="text-gray-500 dark:text-gray-400">お名前:</span> {form.name}</p>
              <p><span className="text-gray-500 dark:text-gray-400">メールアドレス:</span> {form.email}</p>
              <p><span className="text-gray-500 dark:text-gray-400">カテゴリ:</span> {CATEGORY_LABEL[form.category] ?? form.category}</p>
              <p><span className="text-gray-500 dark:text-gray-400">内容:</span></p>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{form.content}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={handleBack} className="btn-secondary flex-1">
                <span className="material-symbols-outlined">arrow_back</span>
                修正する
              </button>
              <button type="button" onClick={handleSubmit} className="btn-primary flex-1">
                <span className="material-symbols-outlined">send</span>
                送信する
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              お問い合わせありがとうございます。送信用のメール作成画面を開きました。内容をご確認のうえ、送信してください。
            </p>
            <div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 p-3 text-sm text-brand-700 dark:text-brand-300">
              送信先: {CONTACT_EMAIL}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={handleReset} className="btn-secondary flex-1">
                <span className="material-symbols-outlined">restart_alt</span>
                もう一度入力する
              </button>
              <Link to="/help" className="btn-primary flex-1 text-center">
                <span className="material-symbols-outlined">home</span>
                ヘルプへ戻る
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
