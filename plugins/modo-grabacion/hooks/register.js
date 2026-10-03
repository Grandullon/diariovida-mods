// Modo grabación: mientras está activo, tapa en pantalla los datos sensibles.
// Solo cambia lo que se VE; lo que Claude lee y hace no se toca.
let grabando = false

// Palabras propias que quieres ocultar (tu nombre, tu ciudad, tu empresa...)
let PROPIOS = []

const PATRONES = [
  [/[\w.+-]+@[\w-]+\.[\w.]+/g, '•••@•••'],                          // correos
  [/\/home\/[^\/\s]+/g, '/home/•••'],                               // rutas de usuario Linux
  [/C:\\Users\\[^\\\s]+/gi, 'C:\\Users\\•••'],                      // rutas de usuario Windows
  [/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, '•.•.•.•'],                      // IPs
  [/\b(?:sk|pk|ghp|xox[abp])[-_][A-Za-z0-9_-]{12,}\b/g, '[clave oculta]'], // claves con prefijo típico
  [/\b\d{8}[A-HJ-NP-TV-Z]\b/g, '[DNI oculto]'],                     // DNI
]

function tapa(texto) {
  let t = texto
  for (const [re, sust] of PATRONES) t = t.replace(re, sust)
  for (const p of PROPIOS) t = t.split(p).join('•••')
  return t
}

// Recorre las propiedades y tapa todo el texto que encuentre
function tapaTodo(v) {
  if (typeof v === 'string') return tapa(v)
  if (Array.isArray(v)) return v.map(tapaTodo)
  if (v && typeof v === 'object') {
    const o = {}
    for (const k of Object.keys(v)) o[k] = tapaTodo(v[k])
    return o
  }
  return v
}

const SITIOS = ['UserMessage', 'AssistantMessage', 'ToolUse', 'ToolResult', 'ToolGroup', 'CommandOutput', 'InfoNotice']

export function register(on, options = {}) {
  PROPIOS = String(options.nombres || '').split(',').map(x => x.trim()).filter(Boolean)
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'grabar', description: 'Activa o desactiva el modo grabación (oculta datos en pantalla)' })
    return next(e)
  })

  on('command.run', { command: 'grabar' }, async ($) => {
    grabando = !grabando
    $.ui.invalidate('ui.render')
    return { text: grabando ? '🔴 Modo grabación ACTIVADO: correos, rutas, IPs, claves, DNI y tus nombres salen ocultos en pantalla.' : '⚪ Modo grabación desactivado.' }
  })

  for (const sitio of SITIOS) {
    on('ui.render', { component: sitio }, async ($, e, next) => {
      if (!grabando) return next(e)
      return next({ ...e, props: tapaTodo(e.props) })
    })
  }

  // Aviso fijo junto al indicador de "pensando" mientras se graba
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (!grabando) return next(e)
    return next({ ...e, props: { ...e.props, suffix: (e.props.suffix || '') + ' · 🔴 grabando' } })
  })
}
