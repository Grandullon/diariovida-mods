// Papelera · diariovida.com
// Cuando Claude va a borrar archivos, los manda a ~/.papelera-claude/<fecha-hora>/ en vez de borrarlos.

const CARPETA = '.papelera-claude'
const RM = /(^|[;&|(]\s*|\s)(rm|rmdir|unlink)\s/                       // borrar en terminal
const OTROS = /find\s.*\s-delete\b|shutil\.rmtree|os\.remove|os\.unlink|Remove-Item|\bdel\s|\brd\s/i

// Separa una orden en palabras respetando comillas
function palabras(cmd) {
  const out = []; let cur = ''; let q = null
  for (const ch of cmd) {
    if (q) { cur += ch; if (ch === q) q = null }
    else if (ch === '"' || ch === "'") { q = ch; cur += ch }
    else if (/\s/.test(ch)) { if (cur) { out.push(cur); cur = '' } }
    else cur += ch
  }
  if (cur) out.push(cur)
  return out
}

const sello = () => new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-')

export function register(on) {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'papelera', description: 'Enseña lo que Claude ha mandado a la papelera y cómo recuperarlo' })
    return next(e)
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const cmd = String(e.command || '')
    const simple = /^\s*rm\s/.test(cmd) && !/[;&|`$<>()]/.test(cmd)
    if (simple) {
      const rutas = palabras(cmd).slice(1).filter(p => !p.startsWith('-'))
      if (!rutas.length) return next(e)
      const destino = '"$HOME/' + CARPETA + '/' + sello() + '"'
      const nuevo = 'mkdir -p ' + destino + ' && mv -- ' + rutas.join(' ') + ' ' + destino + '/ && echo "No se ha borrado nada: está en la papelera ' + destino.replace(/"/g, '') + '"'
      $.ui.toast('🗑️ A la papelera, no a la basura: se puede recuperar con /papelera')
      return next({ ...e, command: nuevo })
    }
    if (RM.test(cmd) || OTROS.test(cmd)) {
      return { deny: 'En este ordenador está activo el mod «Papelera»: no se borra nada directamente. Si hay que eliminar archivos, muévelos a la carpeta ~/' + CARPETA + '/' + sello() + '/ (créala si no existe) con una orden aparte, y dile al usuario dónde han quedado.' }
    }
    return next(e)
  })

  on('tool.call', { tool: 'PowerShell' }, async ($, e, next) => {
    const cmd = String(e.command || '')
    if (/Remove-Item|\bdel\s|\brd\s|\brmdir\s|\brm\s/i.test(cmd)) {
      return { deny: 'En este ordenador está activo el mod «Papelera»: no se borra nada directamente. Mueve los archivos a $env:USERPROFILE\\' + CARPETA + '\\' + sello() + '\\ (créala si no existe) con Move-Item, y dile al usuario dónde han quedado.' }
    }
    return next(e)
  })

  on('command.run', { command: 'papelera' }, async ($) => {
    const casa = (await $.env.get('HOME')) || (await $.env.get('USERPROFILE')) || ''
    const raiz = casa + '/' + CARPETA
    let lotes = []
    try { lotes = (await $.fs.list(raiz)).map(x => (typeof x === 'string' ? x : x.name)).sort().reverse() } catch {}
    if (!lotes.length) return { text: '🗑️ La papelera está vacía.' }
    return { text: '🗑️ Papelera (' + raiz + '), lo más reciente primero:\n' + lotes.slice(0, 15).map(l => '  · ' + l).join('\n') +
      '\nPara recuperar algo, pídeselo a Claude: «recupera de la papelera el archivo X». Para vaciarla, borra esa carpeta a mano.' }
  })
}
