import { useState } from 'react'
import { X } from 'lucide-react'
import type { Mesa } from '../types/domain'

interface ModalMesaProntaProps {
  mesa: Mesa
  onConfirm: (ideal: number, setor: string) => void
  onClose: () => void
}

export function ModalMesaPronta({ mesa, onConfirm, onClose }: ModalMesaProntaProps) {
  const [ideal, setIdeal] = useState(mesa.quantidade_ideal_pessoas)
  const [setor, setSetor] = useState(mesa.setor_ou_area)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <form
        className="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault()
          onConfirm(ideal, setor)
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Mesa pronta</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Informar liberacao da Mesa {mesa.numero_mesa}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 p-2" aria-label="Fechar">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">
            Numero da mesa
            <input
              value={mesa.numero_mesa}
              readOnly
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-3 text-slate-900"
            />
          </label>
          <label className="text-sm font-bold text-slate-700">
            Capacidade maxima
            <input
              value={mesa.capacidade_maxima}
              readOnly
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-3 text-slate-900"
            />
          </label>
          <label className="text-sm font-bold text-slate-700">
            Quantidade ideal
            <input
              type="number"
              min="1"
              max={mesa.capacidade_maxima}
              value={ideal}
              onChange={(event) => setIdeal(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-3 text-slate-900"
            />
          </label>
          <label className="text-sm font-bold text-slate-700">
            Setor ou area
            <input
              value={setor}
              onChange={(event) => setSetor(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-3 text-slate-900"
            />
          </label>
        </div>

        <p className="mt-4 rounded-lg bg-teal-50 p-3 text-sm font-black text-teal-900">
          Mesa {mesa.numero_mesa} pronta para {ideal} pessoas.
        </p>

        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-teal-600 px-5 py-4 text-base font-black text-white hover:bg-teal-700"
        >
          Marcar mesa pronta
        </button>
      </form>
    </div>
  )
}
