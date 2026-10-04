// Mis reglas · diariovida.com
// Una franja encima del cuadro de texto con las reglas que tienes activas,
// y el indicador de «pensando» en español.

const PALABRAS = ['Dándole una vuelta', 'Atando cabos', 'Currando', 'Echando cuentas', 'Ordenando ideas',
  'Leyendo con calma', 'Pensándoselo', 'Repasando', 'Poniéndolo en limpio', 'Buscando el hilo']
let comandos = ''
let visto = 0

export function register(on) {
  on('session.start', async ($, e, next) => {
    try { comandos = JSON.stringify(await $.command.list()) } catch {}
    $.ui.invalidate('ui.render')
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!comandos.length || Date.now() - visto > 15000) {
      try { comandos = JSON.stringify(await $.command.list()); visto = Date.now() } catch {}
    }
    const { Box, Text } = $.ui.resolve(e)
    const reglas = []
    if (/["/:]cristiano["]/.test(comandos)) reglas.push('💬 En cristiano')
    if (/["/:]papelera["]/.test(comandos)) reglas.push('🗑️ Papelera')
    if (/["/:]mejora["]/.test(comandos)) reglas.push('✍️ /mejora')
    if (/["/:]grabar["]/.test(comandos)) reglas.push('🔒 /grabar')
    const lista = reglas.length ? reglas.join('   ') : 'ninguna todavía'
    return Box({ borderStyle: 'round', borderColor: 'magenta', paddingX: 1, children: [
      Text({ bold: true, color: 'magenta', children: ['🛡️ Mi Claude · reglas activas:  '] }),
      Text({ color: 'white', children: [lista] }),
    ] })
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    const p = PALABRAS[Math.floor(Date.now() / 4000) % PALABRAS.length]
    return next({ ...e, props: { ...e.props, word: p } })
  })
}
