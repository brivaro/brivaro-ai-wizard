


### 1. Atajos de Teclado (Keybinds) y Navegación

OpenCode usa una **tecla líder (Leader)** para no pisar los atajos de tu terminal. Por defecto es `Ctrl+x`. Primero pulsas `Ctrl+x`, lo sueltas, y luego pulsas la siguiente tecla.

**Gestión de la App y TUI:**
*   `Ctrl+x` + `q` (o `Ctrl+c` / `Ctrl+d`): Salir de OpenCode.
*   `Ctrl+x` + `e`: Abrir tu editor externo configurado (VS Code, Vim, etc.) para escribir un prompt largo cómodamente.
*   `Ctrl+x` + `t`: Abrir la lista de temas.
*   `Ctrl+x` + `m`: Abrir la lista de modelos.
*   `Ctrl+x` + `b`: Mostrar/Ocultar la barra lateral.
*   `Ctrl+x` + `d`: Alternar los detalles de ejecución de las herramientas (ver los logs de lo que hace la IA por debajo).
*   `Ctrl+x` + `h`: Mostrar/Ocultar consejos (tips) y ocultar tu nombre de usuario.

**Gestión de Sesiones:**
*   `Ctrl+x` + `n`: Nueva sesión.
*   `Ctrl+x` + `l`: Listar sesiones anteriores (para continuar una).
*   `Ctrl+x` + `x`: Exportar la sesión a Markdown.
*   `Ctrl+x` + `s`: Compartir sesión (genera URL pública).
*   `Ctrl+x` + `c`: Compactar sesión manualmente (`/compact`).

**Navegación por el Historial de Mensajes:**
*   `Ctrl+x` + `u`: Deshacer (Undo) el último mensaje y revertir cambios en los archivos (requiere Git).
*   `Ctrl+x` + `r`: Rehacer (Redo).
*   `Ctrl+x` + `y`: Copiar el último mensaje de la IA.
*   `Re Pág` / `Av Pág` o `Ctrl+Alt+b` / `Ctrl+Alt+f`: Subir/Bajar página en el historial.

**Entrada de Texto (Prompt):**
*   `Tab`: Cambiar de Agente (Ciclo entre Build, Plan, etc.).
*   `Shift+Tab`: Ciclo de Agentes hacia atrás.
*   `Enter`: Enviar mensaje.
*   `Shift+Enter` o `Ctrl+j`: Salto de línea sin enviar (en algunas terminales de Windows hay que mapear `Shift+Enter` en la config de Windows Terminal).
*   `Ctrl+t`: Cambiar de "Variante" del modelo (ej. pasar de razonamiento "low" a "high").
*   `Ctrl+p`: Lista de comandos (como `/test`, `/init`).
*   `F2`: Ciclo entre los modelos usados recientemente.

**Atajos exclusivos del Desktop App (Estilo Emacs/Readline):**
*   `Ctrl+a` / `Ctrl+e`: Ir al inicio / final de la línea.
*   `Ctrl+u` / `Ctrl+k`: Borrar todo hasta el inicio / borrar hasta el final de la línea.
*   `Ctrl+w`: Borrar la palabra anterior.
*   `Alt+b` / `Alt+f`: Mover el cursor una palabra atrás / adelante.

*Nota: Puedes cambiar cualquier atajo editando el archivo `tui.json`.*

---

### 2. Configurar `/compact` en Automático

La compactación sirve para que, cuando el LLM se queda sin tokens de memoria (contexto), OpenCode resuma la conversación en un mensaje corto y siga trabajando sin perder el hilo.

Para que se haga solo, no usas la TUI, lo configuras en tu archivo `opencode.json` (puede ser global en `~/.config/opencode/opencode.json` o en la raíz de tu proyecto):

```json
{
  "compaction": {
    "auto": true,
    "prune": true
  }
}
```
*   `"auto": true`: Cuando el contexto se llena, lanza automáticamente el "Agente de Compactación" oculto.
*   `"prune": true`: Borra los resultados de herramientas viejas (logs largos de bash o lecturas de archivos pasadas) para ahorrar tokens antes incluso de tener que resumir todo.

---

### 3. Agentes en Paralelo, Subagentes y el Orquestador

**¿Cómo funciona la arquitectura Primary vs Subagent?**
Tú siempre hablas con un **Agente Primario** (por defecto, `Build`). El primario tiene acceso a una herramienta interna especial llamada `task`. 

**¿El primario *crea* a los subagentes?**
No, no los inventa sobre la marcha. Los subagentes (`general`, `explore`, o los que tú crees) ya están definidos en la configuración de OpenCode. Lo que hace el primario es **invocarlos** pasándoles un prompt a través de la herramienta `task`. 

**Tu escenario del Orquestador en `AGENTS.md`:**
Si tú pones en tu `AGENTS.md`: *"Eres un orquestador, no programes tú mismo. Analiza el problema, divídelo en tareas y usa a los subagentes para ejecutarlas en paralelo"*.
1. Tú pides: "Crea el frontend y el backend para un login".
2. Tu agente primario lee la orden. Llama a la herramienta `task` dos veces simultáneamente:
   * `task({ agent: "general", prompt: "Crea el backend en Node..." })`
   * `task({ agent: "general", prompt: "Crea el frontend en React..." })`

**¿Cómo ves qué están haciendo los subagentes?**
Cuando el primario invoca a un subagente, OpenCode crea una **sesión secundaria (Child Session)** invisible a simple vista para no ensuciar tu chat principal. Pero puedes "entrar" a verlas:

*   Usa **`Ctrl+x` + `Abajo`**: Entras a la primera sesión secundaria activa.
*   Usa **`Ctrl+x` + `Derecha`** o **`Izquierda`**: Navegas en ciclo por todas las sesiones secundarias que se estén ejecutando en paralelo. Podrás ver en vivo cómo el subagente escribe código, tira comandos bash, etc.
*   Usa **`Ctrl+x` + `Arriba`**: Vuelves a la sesión "Padre" (tu chat principal con el orquestador).

Cuando los subagentes terminan, le devuelven un resumen de su trabajo al Agente Primario (orquestador), y este te responde a ti en el chat principal: *"Listo, el subagente 1 terminó el backend y el 2 el frontend"*.