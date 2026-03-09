# 🗺️ Planificación: Ruta hacia el nivel Experto

*   **Fase 1: Fundamentos.** Instalación, inicialización de proyectos y configuración de LLMs.
*   **Fase 2: Dominio de la Interfaz y Flujo de Trabajo.** Uso de la TUI, comandos rápidos, referencias de contexto y gestión del historial (undo/redo).
*   **Fase 3: Arquitectura de Agentes y Herramientas.** Entender los roles (Plan vs. Build) y el sistema estricto de permisos.
*   **Fase 4: Personalización y Reglas.** Archivos `AGENTS.md`, comandos personalizados e inyección de contexto.
*   **Fase 5: Extensibilidad Máxima (Superpoderes).** Herramientas personalizadas (TS/JS), Servidores MCP, Habilidades (`SKILL.md`) y Plugins.
*   **Fase 6: Ecosistema e Integración Continua.** Uso en IDEs (ACP), versión Web y automatización en GitHub/GitLab.

---

# 🧠 Explicación Detallada (Guía Maestra)

## Fase 1: Fundamentos
Para empezar, OpenCode se instala fácilmente mediante script (`curl -fsSL https://opencode.ai/install | bash`) o usando gestores como `npm`, `bun` o `brew`.

1. **Configurar Proveedores de IA (LLMs):**
   OpenCode soporta más de 75 proveedores (OpenAI, Anthropic, Gemini, modelos locales vía Ollama/llama.cpp, etc.). 
   * **OpenCode Zen / Go:** Es el servicio curado y optimizado de OpenCode para acceder a los mejores modelos sin pelear con configuraciones.
   * Ejecuta `/connect` en la terminal para añadir tus API Keys.
   * Ejecuta `/models` para seleccionar el modelo a utilizar.

2. **Inicializar un Proyecto:**
   Navega a la carpeta de tu código y ejecuta `opencode`. Una vez dentro, escribe `/init`. Esto analizará tu código base y creará un archivo `AGENTS.md` en la raíz, enseñándole a la IA la estructura y patrones de tu proyecto.

## Fase 2: Dominio de la Interfaz (TUI) y Flujo de Trabajo
OpenCode usa una **Terminal User Interface (TUI)** muy potente. La tecla líder (Leader Key) por defecto es `Ctrl+x`, que te permite ejecutar acciones rápidas sin tocar el ratón.

* **El Contexto es Rey:**
  * **`@` (Archivos):** Escribe `@` seguido del nombre de un archivo para inyectar su contenido en el prompt (ej. `@src/api.ts`).
  * **`!` (Comandos Bash):** Empieza con `!` para ejecutar un comando y pasar su salida a la IA (ej. `!npm run test`).
* **Comandos Slash (`/`):**
  * `/plan` o `<TAB>`: Cambia entre el modo "Build" (hacer cambios) y "Plan" (solo pensar y sugerir).
  * `/undo` y `/redo`: Si la IA rompe algo, puedes revertir los cambios en los archivos (OpenCode usa Git internamente para esto).
  * `/share`: Crea un enlace público para compartir la conversación con tu equipo.
  * `/compact`: Resume la sesión para ahorrar tokens (o se hace solo si está configurado en `auto`).

## Fase 3: Arquitectura de Agentes y Herramientas
OpenCode no usa un solo cerebro, sino un sistema multi-agente.
* **Agentes Primarios:** Los que manejan la conversación principal.
  * **Build (Construir):** Tiene acceso a todas las herramientas (leer, escribir, ejecutar shell). Es el trabajador principal.
  * **Plan (Planificar):** Restringido. No puede modificar código, ideal para pedirle arquitecturas o análisis de errores sin riesgo.
* **Subagentes:** Invocados por los primarios o por ti usando `@` (ej. `@explore busca dónde se define X`).
  * **General:** Para tareas complejas en paralelo.
  * **Explore:** Acceso de solo lectura ultrarrápido para navegar por repositorios.

**Gestión de Permisos:**
Tú decides qué herramientas puede usar la IA modificando el archivo `opencode.json` (global o local). Tienes 3 niveles: `"allow"` (permitido siempre), `"ask"` (pedir permiso antes de ejecutar), `"deny"` (prohibido).
*Ejemplo experto:* Puedes decirle que permita buscar código, pero que siempre pregunte (`"ask"`) antes de ejecutar comandos `bash` peligrosos.

## Fase 4: Personalización Avanzada
La configuración de OpenCode tiene **jerarquía** (Remoto de empresa -> Global del usuario -> Variable de entorno -> Proyecto local -> Inline).

1. **Reglas del Proyecto (`AGENTS.md`):** Aquí defines el estilo de código, convenciones del monorepo, etc. Se puede modularizar usando el campo `"instructions"` en tu `opencode.json` para cargar archivos como `@docs/style.md` solo cuando la IA los necesite.
2. **Comandos Personalizados:** Puedes crear archivos `.md` en la carpeta `.opencode/commands/`.
   * *Ejemplo:* Crear `test.md`. Dentro pones un prompt para ejecutar tests, analizar la cobertura y arreglar los fallos. Al escribir `/test` en la TUI, hará exactamente ese flujo complejo.
3. **Formateadores y LSPs:** OpenCode detecta automáticamente tus linters y formateadores (Prettier, ruff, biome, etc.) y auto-formatea el código que escribe. Además, se conecta a tus Servidores de Lenguaje (LSP) para entender definiciones y referencias como si fuera un IDE.

## Fase 5: Extensibilidad Máxima (Tus Superpoderes)
Aquí es donde te separas de los usuarios básicos.

1. **Herramientas Personalizadas:** Si necesitas que OpenCode interactúe con una base de datos de tu empresa, puedes escribir una herramienta en TypeScript/JavaScript dentro de `.opencode/tools/`. La IA sabrá cómo y cuándo llamarla.
2. **Servidores MCP (Model Context Protocol):** Es un estándar para conectar IAs con herramientas externas. Puedes conectar OpenCode a servidores MCP de GitHub, Sentry, JIRA, etc., (usando `/mcp add`) para que la IA lea tickets o busque bugs de producción.
3. **Skills (`SKILL.md`):** Son habilidades modulares. Imagina que creas un `SKILL.md` llamado `git-release` que le enseña a la IA cómo publicar una versión exacta de tu app. Cuando la IA necesite hacerlo, cargará esa habilidad dinámicamente.
4. **Plugins:** Puedes inyectar código JS/TS en el ciclo de vida de OpenCode. Por ejemplo, un plugin que se ejecute en el evento `session.idle` para mandar una notificación push a tu Mac cuando la IA haya terminado una tarea larga.

## Fase 6: Ecosistema e Integración Continua (CI/CD)
Un experto no solo usa OpenCode en la terminal.
* **En el Navegador:** Ejecuta `opencode web` para levantar una interfaz gráfica moderna accesible desde tu navegador.
* **En el IDE (ACP):** Protocolos como ACP permiten usar OpenCode dentro de Neovim, Zed o JetBrains como tu agente integrado nativo (`opencode acp`).
* **GitHub y GitLab:**
  * Puedes instalar OpenCode como una Acción de GitHub o un pipeline de GitLab CI.
  * *Flujo experto:* Alguien abre una Pull Request -> Tú comentas `/oc review this` o `@opencode fix this` -> OpenCode se ejecuta en la nube, clona el repo, lee el error, hace el commit con el código arreglado y actualiza la PR automáticamente.

### Resumen para el éxito:
Para dominar OpenCode hoy mismo, tu primera acción debe ser crear un archivo `opencode.json` en tu proyecto, levantar la TUI con `opencode`, pulsar `Tab` para probar el **Modo Plan**, usar **`!`** para pasar errores de consola y crear tu primer **Comando Personalizado** en `.opencode/commands/`. ¡Con esto y el uso del sistema de **Permisos** tendrás un desarrollador junior autónomo en tu máquina!