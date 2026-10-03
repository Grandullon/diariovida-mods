// En cristiano · diariovida.com
// Debajo de cada acción de Claude añade una línea que explica, en español normal, qué está haciendo.
// Solo dibuja: no cambia lo que Claude hace ni lo que lee.

const nombre = (ruta) => String(ruta || '').split(/[\\/]/).filter(Boolean).pop() || String(ruta || '')
const corto = (t, n = 60) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t }

// Traduce una orden de terminal a algo comprensible
function terminal(cmd, desc) {
  const partes = String(cmd || '').split(/&&|\|\||;/).map(x => x.trim()).filter(Boolean)
  const vistas = []
  for (const parte of partes.slice(0, 4)) {
    const t = una(parte.split('|')[0].trim(), partes.length === 1 ? desc : '')
    if (t && !vistas.includes(t)) vistas.push(t)
  }
  return vistas.length ? vistas.join('  ·  ') : (desc ? '⚙️ ' + corto(desc, 70) : '⚙️ Ejecutando una orden en tu ordenador')
}

function una(primera, desc) {
  const [p, ...resto] = primera.split(/\s+/)
  const args = resto.filter(a => !a.startsWith('-'))
  const ultimo = args.length ? nombre(args[args.length - 1]) : ''
  const tabla = {
    ls: '👀 Mirando qué hay en la carpeta' + (ultimo ? ` «${ultimo}»` : ''),
    dir: '👀 Mirando qué hay en la carpeta',
    cd: '🚶 Entrando en la carpeta' + (ultimo ? ` «${ultimo}»` : ''),
    mkdir: '📁 Creando la carpeta' + (ultimo ? ` «${ultimo}»` : ''),
    mv: '🚚 Moviendo o cambiando de nombre' + (args.length > 1 ? ` «${nombre(args[0])}» → «${ultimo}»` : ''),
    cp: '📑 Haciendo una copia' + (args.length > 1 ? ` de «${nombre(args[0])}»` : ''),
    rm: '⚠️ BORRANDO' + (args.length ? ` ${args.length === 1 ? '«' + ultimo + '»' : args.length + ' cosas'}` : ''),
    del: '⚠️ BORRANDO archivos',
    cat: '📖 Leyendo' + (ultimo ? ` «${ultimo}»` : ' un archivo'),
    head: '📖 Leyendo el principio de' + (ultimo ? ` «${ultimo}»` : ' un archivo'),
    tail: '📖 Leyendo el final de' + (ultimo ? ` «${ultimo}»` : ' un archivo'),
    grep: '🔎 Buscando un texto dentro de los archivos',
    find: '🔎 Buscando archivos',
    curl: '🌐 Descargando algo de internet', wget: '🌐 Descargando algo de internet',
    pip: '📦 Instalando un programa (Python)', pip3: '📦 Instalando un programa (Python)',
    npm: '📦 Instalando o usando un programa (Node)', npx: '📦 Usando un programa (Node)',
    python: '▶️ Ejecutando un programa de Python', python3: '▶️ Ejecutando un programa de Python', node: '▶️ Ejecutando un programa',
    git: '🗂️ Guardando o consultando versiones (git)',
    zip: '🗜️ Comprimiendo archivos', unzip: '🗜️ Descomprimiendo' + (ultimo ? ` «${ultimo}»` : ''),
    chmod: '🔑 Cambiando permisos de un archivo', sudo: '🔐 Ejecutando algo con permisos de administrador',
    echo: '✍️ Escribiendo un texto', touch: '📄 Creando un archivo vacío' + (ultimo ? ` «${ultimo}»` : ''),
    ffmpeg: '🎬 Procesando un vídeo o un audio', open: '🖱️ Abriendo un archivo', start: '🖱️ Abriendo un archivo',
  }
  if (tabla[p]) return tabla[p]
  if (desc) return '⚙️ ' + corto(desc, 70)
  return '⚙️ Ejecutando una orden en tu ordenador'
}

function traduce(tool, input) {
  const i = input || {}
  switch (tool) {
    case 'Read': return '📖 Leyendo el archivo «' + nombre(i.file_path) + '»'
    case 'Write': return '📝 Creando (o reescribiendo) el archivo «' + nombre(i.file_path) + '»'
    case 'Edit': case 'MultiEdit': return '✏️ Cambiando una parte del archivo «' + nombre(i.file_path) + '»'
    case 'NotebookEdit': return '✏️ Cambiando un cuaderno de datos'
    case 'Glob': return '🔎 Buscando archivos que se llamen «' + corto(i.pattern, 40) + '»'
    case 'Grep': return '🔎 Buscando el texto «' + corto(i.pattern, 40) + '» dentro de los archivos'
    case 'Bash': case 'PowerShell': return terminal(i.command, i.description)
    case 'WebFetch': { let h = ''; try { h = new URL(i.url).hostname } catch {} ; return '🌐 Abriendo la página web ' + (h || 'que ha encontrado') }
    case 'WebSearch': return '🌐 Buscando en internet: «' + corto(i.query, 50) + '»'
    case 'TodoWrite': case 'TaskCreate': case 'TaskUpdate': return '📋 Apuntando o actualizando su lista de tareas'
    case 'Task': case 'Agent': return '👥 Encargando una parte del trabajo a un ayudante'
    case 'AskUserQuestion': return '❓ Te va a hacer una pregunta'
    default:
      if (String(tool).startsWith('mcp__')) return '🔌 Usando una herramienta conectada: ' + String(tool).split('__')[1]
      return '🧰 Usando la herramienta «' + tool + '»'
  }
}

export function register(on) {
  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    const suyo = await next(e)
    let linea
    try { linea = traduce(e.props.tool, e.props.input) } catch { return suyo }
    const { Box, Text } = $.ui.resolve(e)
    return Box({ flexDirection: 'column', children: [suyo, Text({ color: 'cyan', children: ['   ↳ ' + linea] })] })
  })

  // Cuando Claude Code agrupa varias acciones en una sola línea, explica cada una debajo
  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    const suyo = await next(e)
    if (e.props.isExpanded) return suyo
    const calls = (e.props.calls || []).slice(0, 8)
    if (!calls.length) return suyo
    const { Box, Text } = $.ui.resolve(e)
    const lineas = calls.map((c, k) => { let t; try { t = traduce(c.tool, c.input) } catch { t = '🧰 ' + c.tool } ; return Text({ key: 'l' + k, color: 'cyan', children: ['   ↳ ' + t] }) })
    return Box({ flexDirection: 'column', children: [suyo, ...lineas] })
  })
}
