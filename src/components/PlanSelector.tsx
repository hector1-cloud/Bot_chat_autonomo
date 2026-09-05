import React, { useState } from 'react'
import { Check, Crown, Loader2 } from 'lucide-react'

export const PlanSelector: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function startCheckout() {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || 'Checkout no disponible')
      window.location.assign(data.url)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo iniciar el pago')
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6" aria-labelledby="plans-title">
      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Gratis</p>
          <h2 className="mt-2 text-xl font-bold text-slate-100">HECTRON Free</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">Explora el universo con telemetría local y memoria durante la sesión.</p>
          <p className="mt-4 text-2xl font-bold text-slate-100">0 €</p>
        </article>
        <article className="rounded-2xl border border-indigo-500/50 bg-indigo-950/30 p-5 shadow-lg shadow-indigo-950/30">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Pro HECTRON</p>
            <Crown className="h-5 w-5 text-amber-300" aria-hidden="true" />
          </div>
          <h2 id="plans-title" className="mt-2 text-xl font-bold text-slate-100">Memoria que permanece</h2>
          <p className="mt-1 text-sm leading-6 text-slate-300">Neon, telemetría avanzada y controles premium del universo.</p>
          <p className="mt-4 text-2xl font-bold text-slate-100">9,99 € <span className="text-sm font-normal text-slate-400">/ mes</span></p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-300">
            {['Memoria persistente', 'Telemetría avanzada', 'Controles avanzados'].map((feature) => <li key={feature} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />{feature}</li>)}
          </ul>
          <button type="button" onClick={startCheckout} disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-wait disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Abriendo Checkout…' : 'Activar Pro'}
          </button>
          {message && <p role="alert" className="mt-3 text-xs text-rose-300">{message}</p>}
        </article>
      </div>
    </section>
  )
}
