// install: é disparado quando o service worker é instalado pela primeira vez ou quando o arquivo do service worker é alterado. Esse evento é usado para armazenar em cache os recursos estáticos da aplicação, como HTML, CSS, JavaScript e imagens.
// activate: é disparado quando o service worker é ativado, ou seja, quando ele passa a controlar as páginas da aplicação. Esse evento é usado para limpar os caches antigos ou fazer outras tarefas de inicialização.
// fetch: é disparado quando o service worker intercepta uma solicitação de rede feita pela aplicação. Esse evento é usado para implementar estratégias de cache dinâmico, como cache first, network first, stale while revalidate, etc.
// push: é disparado quando o service worker recebe uma mensagem push do servidor. Esse evento é usado para mostrar uma notificação ao usuário ou atualizar os dados da aplicação em segundo plano.
// sync: é disparado quando o service worker recebe um sinal de sincronização periódica ou de uma tarefa em segundo plano. Esse evento é usado para enviar ou receber dados do servidor quando há conectividade disponível.
// message: é disparado quando o service worker recebe uma mensagem simples de outra parte da aplicação, como a janela principal ou outro service worker. Esse evento é usado para comunicar dados entre o service worker e a aplicação.

self.addEventListener('activate', event => {
    const broadcast = new BroadcastChannel('notifications')
    broadcast.postMessage({title:'ativado o sw'})
    broadcast.close()
})

self.addEventListener('message', event => {
    const broadcast = new BroadcastChannel('notifications')
    broadcast.postMessage(JSON.stringify(event))
    broadcast.close()
})