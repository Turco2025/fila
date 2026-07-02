# MesaCerta Operacoes

Aplicativo web responsivo para gerenciamento inteligente de filas em restaurantes, bares, cafes, hamburguerias, clinicas e operacoes com alta demanda presencial.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Lucide React
- Estado local com dados simulados, organizado para evoluir para Supabase ou Firebase

## Como rodar

```bash
pnpm install
pnpm dev
```

Depois acesse `http://127.0.0.1:5173`. O comando `pnpm dev` sobe dois processos:

- Vite em `http://127.0.0.1:5173`
- API de push em `http://127.0.0.1:8787`

URLs principais:

- Area da equipe: `http://127.0.0.1:5173`
- Tela publica isolada do cliente para QR Code: `http://127.0.0.1:5173/#/cliente/rest-1`

> Neste ambiente, o registry apresentou erro de certificado durante a instalacao inicial. Se isso acontecer em outra maquina, corrija a cadeia de certificados do Node/npm antes de instalar dependencias.

## Estrutura

```text
src/
  components/    componentes reutilizaveis
  data/          dados mockados iniciais
  services/      funcoes de fila, mesas e atendimento
  types/         entidades do dominio
  views/         telas por perfil
```

## Entidades modeladas

- restaurantes
- usuarios
- funcionarios
- mesas
- fila_clientes
- chamados
- configuracoes_fila
- historico_atendimentos

## Fluxos implementados

- Cliente entra via QR Code, preenche cadastro rapido e acompanha o status.
- A URL do QR Code abre uma tela publica isolada, sem abas ou acesso aos paineis internos.
- Cliente pode ativar Web Push no navegador para receber aviso quando a mesa ficar pronta.
- Recepcao visualiza fila, mesas prontas, sugestao automatica de cliente compativel e chamada.
- Ao chamar um cliente, a recepcao e o cliente acompanham um timer de 5 minutos; ao zerar, a recepcao recebe a opcao de excluir/remover o cliente da fila.
- Garcom altera status das mesas, marca mesa em preparo, marca mesa pronta e confirma cliente sentado.
- Administrador visualiza relatorios, mesas, funcionarios e configura tolerancias de encaixe.

## Push notification com VAPID

O MVP inclui Web Push real para navegador:

- `public/sw.js` recebe o push e mostra a notificacao.
- `src/services/pushNotifications.ts` registra o service worker, pede permissao e salva a subscription.
- `server/push-server.js` expoe a chave publica VAPID, guarda subscriptions em memoria e envia a notificacao com `web-push`.

Para desenvolvimento, se `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` nao forem informadas, o servidor gera um par temporario ao iniciar. Para producao, gere chaves estaveis e configure um `.env` baseado em `.env.example`.

Gerar chaves localmente:

```bash
pnpm exec web-push generate-vapid-keys
```

Em producao, a private key fica apenas no backend. O frontend usa somente a public key retornada por `/api/push/vapid-public-key`.

## Regra de compatibilidade

A funcao `sugerirClienteCompativel` em `src/services/queue.ts` considera:

1. Clientes com status `aguardando`.
2. Capacidade maxima da mesa.
3. Tolerancias configuradas pelo administrador.
4. Ordem de chegada dentro dos grupos compativeis.
5. Melhor aproveitamento da mesa.

Exemplo: mesa de 4 prioriza grupos de 4, depois 3, depois 2 somente quando a regra permitir.

## Proximos passos de integracao

- Supabase/Firebase: substituir os arrays locais por repositories com realtime para `mesas`, `fila_clientes` e `chamados`.
- Persistencia de push: salvar `PushSubscription` por cliente em Supabase/Firebase em vez de memoria.
- WhatsApp/SMS: adicionar fallback quando o navegador negar push notification.
- Autenticacao: separar rotas e permissoes por `recepcao`, `garcom` e `admin`.
- Relatorios: persistir `historico_atendimentos` e gerar agregacoes por periodo, setor e mesa.
