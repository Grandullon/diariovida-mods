# Mods gratis de Diario Vida para Claude Code

Cinco **mods** para que Claude Code se entienda mejor y trabaje mejor, aunque no sepas programar.
Hechos y probados por [Paco Vida](https://www.youtube.com/@Paco_Vida) · [diariovida.com](https://diariovida.com)

| Mod | Qué hace | Cómo se usa |
|---|---|---|
| **mis-reglas** | Tu Claude se ve distinto: una franja encima del cuadro de texto con las reglas que tienes activas, y el «pensando» en español castizo («Dándole una vuelta…», «Atando cabos…») | Se activa solo |
| **en-cristiano** | Debajo de cada cosa que hace Claude, una línea en español normal: «📁 Creando la carpeta "actas"», «⚠️ BORRANDO "acta.txt"», «🌐 Buscando en internet…» | Se activa solo · `/cristiano` lo apaga y lo enciende |
| **papelera** | Cuando Claude va a borrar algo, en vez de borrarlo lo manda a una papelera (`~/.papelera-claude`) para que puedas recuperarlo | Se activa solo · `/papelera` para ver qué hay |
| **mejora-prompts** | Convierte una frase en un prompt que funciona a la primera: te hace 3-5 preguntas (incluida «¿con bucle o sin bucle?»), lo escribe con contexto y sin rol, lo puntúa y lo corrige | `/mejora un correo para pedir vacaciones` |
| **modo-grabacion** | Mientras grabas la pantalla o presentas, tapa correos, rutas de usuario, IPs, DNI, claves y los nombres que tú elijas | `/grabar` (y otra vez para quitarlo) |

## Requisitos
- **Claude Code 2.1.287 o posterior** (en el terminal o en la pestaña *Code* de la app de escritorio de Claude). Compruébalo con `claude --version`.
- Los mods **no** funcionan en el chat normal de claude.ai.

## Instalar (dos líneas)
Dentro de Claude Code escribe:
```
/plugin marketplace add Grandullon/diariovida-mods
/plugin install mejora-prompts@diariovida
```
Cambia `mejora-prompts` por `mis-reglas`, `en-cristiano`, `papelera` o `modo-grabacion` para instalar los otros.
Al instalar `modo-grabacion` te pedirá los nombres que quieres ocultar (tu nombre, tu ciudad, tu empresa…), separados por comas. Puedes cambiarlos luego con `/plugin configure modo-grabacion`.

Para quitar uno: `/plugin` → pestaña **Installed** → desactívalo o desinstálalo.

## Antes de instalar cualquier mod (este también)
Un mod funciona con tus permisos: puede leer tus archivos y lo que escribes. Instala solo mods de gente en la que confíes y **mira el código**: está todo en la carpeta `plugins/`, son pocas líneas y están comentadas en español.
Si descargas la carpeta, puedes ver qué hace cada uno sin ejecutarlo:
```
claude plugin validate ./plugins/mejora-prompts
```

## Qué hace cada uno por dentro
- **en-cristiano**: solo cambia lo que ves en pantalla; no toca lo que Claude hace.
- **papelera**: si Claude intenta borrar con una orden sencilla, la cambia por «mover a la papelera»; si es una orden más compleja, la frena y le pide a Claude que mueva los archivos a la papelera. La papelera no se vacía sola: bórrala tú cuando quieras.
- **mejora-prompts**: añade el comando `/mejora` y le pasa a Claude las instrucciones del método (preguntar → escribir con etiquetas → puntuar → ficha). No ejecuta la tarea: te pregunta si quieres hacerlo.
- **modo-grabacion**: solo cambia lo que ves en pantalla; Claude sigue trabajando con los datos reales.

## Más recursos
Prompts, habilidades y la newsletter gratis en **[diariovida.com](https://diariovida.com)**.

Licencia MIT: úsalos, cámbialos y compártelos.
