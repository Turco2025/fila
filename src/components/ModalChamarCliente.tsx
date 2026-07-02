import { X } from 'lucide-react'
import type { FilaCliente, Mesa } from '../types/domain'

interface ModalChamarClienteProps {
  cliente: FilaCliente
  mesa: Mesa
  onConfirm: () => void
  onClose: () => void
}

export function ModalChamarCliente({ cliente, mesa, onConfirm, onClose }: ModalChamarClienteProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Tela de chamada</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Sua mesa esta pronta</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 p-2" aria-label="Fechar">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-4 rounded-lg bg-slate-950 p-4 text-lg font-black text-white">
          {cliente.nome_cliente}, dirija-se a recepcao. Mesa {mesa.numero_mesa} pronta para{' '}
          {mesa.quantidade_ideal_pessoas} pessoas.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-500">Capacidade</p>
            <p className="text-xl font-black text-slate-950">{mesa.capacidade_maxima} pessoas</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-500">Setor</p>
            <p className="text-xl font-black text-slate-950">{mesa.setor_ou_area}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          className="mt-5 w-full rounded-lg bg-teal-600 px-5 py-4 text-base font-black text-white hover:bg-teal-700"
        >
          Enviar chamada
        </button>
      </div>
    </div>
  )
}
