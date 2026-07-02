interface FiltrosPorQuantidadePessoasProps {
  valor: number | 'todos'
  onChange: (valor: number | 'todos') => void
}

export function FiltrosPorQuantidadePessoas({ valor, onChange }: FiltrosPorQuantidadePessoasProps) {
  const opcoes: Array<number | 'todos'> = ['todos', 2, 4, 6, 8]

  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((opcao) => (
        <button
          key={opcao}
          type="button"
          onClick={() => onChange(opcao)}
          className={`rounded-lg px-4 py-2 text-sm font-bold ${
            valor === opcao ? 'bg-slate-950 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'
          }`}
        >
          {opcao === 'todos' ? 'Todos' : `${opcao} pessoas`}
        </button>
      ))}
    </div>
  )
}
