### 7. Fase 6: Ecosistema, IDEs e Integración Continua (CI/CD)

Has dominado la terminal, los agentes, los permisos y las herramientas personalizadas. Ahora vamos a sacar a OpenCode de tu consola local y llevarlo a tu editor favorito, a tu navegador y, lo más importante, a los repositorios de tu equipo para que trabaje solo.

---

#### A. Integración Nativa en IDEs (Protocolo ACP)

No tienes que usar OpenCode exclusivamente en una terminal separada. OpenCode soporta **ACP (Agent Client Protocol)**, un estándar abierto que permite que tu editor de código se comunique directamente con agentes de IA.

Al configurar tu editor para ejecutar `opencode acp`, OpenCode se convierte en el "cerebro" integrado de tu IDE, manteniendo todas tus reglas (`AGENTS.md`), herramientas MCP y permisos.

**Ejemplos de configuración:**
*   **Zed:** En `~/.config/zed/settings.json`, añades un `agent_server` llamado "OpenCode" que ejecuta el comando `opencode` con el argumento `["acp"]`. Luego lo abres desde la paleta de comandos.
*   **JetBrains (IntelliJ, WebStorm):** Creas un archivo `acp.json` apuntando al binario de OpenCode y usas el chat de IA nativo del IDE.
*   **Neovim:** Usando plugins como `Avante.nvim` o `CodeCompanion.nvim`, configuras el adaptador para que apunte a `opencode acp`.

*La ventaja de esto es que OpenCode puede leer directamente lo que tienes seleccionado en el editor y aplicar los cambios visualmente sin salir de tu entorno.*

---

#### B. OpenCode Web y Servidor Remoto

Si prefieres una interfaz gráfica (GUI) en lugar de la terminal, o si quieres dejar OpenCode corriendo en un servidor (como una Raspberry Pi o un servidor de la empresa) y conectarte desde tu portátil:

1. **Lanzar la interfaz web:**
   ```bash
   opencode web --hostname 0.0.0.0 --port 4096
   ```
   Esto levanta un servidor local y abre una interfaz web moderna en tu navegador. Al usar `0.0.0.0`, puedes acceder desde cualquier dispositivo en tu red local (ej. `http://192.168.1.100:4096`).

2. **Seguridad:**
   Si lo expones en red, protégelo con contraseña iniciando el servidor así:
   ```bash
   OPENCODE_SERVER_PASSWORD=mi_secreto_super_seguro opencode web
   ```

3. **Modo Híbrido (Attach):**
   Puedes tener la web abierta y, al mismo tiempo, en otra terminal, conectarte a esa misma sesión por consola usando: `opencode attach http://localhost:4096`. Ambos verán lo mismo en tiempo real.

---

#### C. Automatización en GitHub (El Bot Autónomo)

Este es el verdadero nivel Dios. Puedes instalar OpenCode en tu repositorio para que actúe como un desarrollador más de tu equipo. Funciona de forma segura **dentro de los runners de GitHub Actions**.

**1. Instalación rápida:**
Ejecuta `opencode github install` en tu repositorio local y sigue las instrucciones para crear el archivo `.github/workflows/opencode.yml`.

**2. Casos de Uso del Bot:**
Una vez configurado (y habiendo puesto tus API Keys en los *Secrets* de GitHub), OpenCode reacciona a eventos:

*   **Fix Automático de Bugs:** Alguien abre un Issue diciendo *"El botón de login falla en móvil"*. Tú entras al issue y comentas: 
    > `/oc fix this`
    OpenCode se despierta, clona el repo, analiza el código, **crea una rama nueva, arregla el bug y abre una Pull Request (PR)** automáticamente con los cambios.
*   **Code Review Específico:** En una PR que ha abierto un compañero, vas a la pestaña "Files changed", seleccionas unas líneas de código dudosas y dejas un comentario:
    > `/oc añade manejo de errores aquí`
    OpenCode lee exactamente ese archivo, esas líneas y el contexto del diff, y responde o sugiere el código corregido.
*   **Tareas Programadas (Cron):** Puedes configurar el workflow para que se ejecute todos los lunes a las 9:00 AM. Le pasas un `prompt` que diga: *"Revisa todo el código en busca de comentarios TODO, haz un resumen y abre un Issue nuevo con la lista"*.

---

#### D. Automatización en GitLab

Si tu empresa usa GitLab, el flujo es idéntico pero usando **GitLab CI** o **GitLab Duo**.
*   Puedes usar el componente de la comunidad `nagyv/gitlab-opencode` en tu `.gitlab-ci.yml`.
*   Mencionas `@opencode` en un Issue o Merge Request.
*   Para máxima seguridad en empresas, OpenCode no se lleva tu código a ningún servidor externo; todo se procesa dentro de tus propios runners de GitLab, haciendo llamadas directas a la API del LLM o a tu AI Gateway corporativo.

---

### 🏆 Conclusión: Ya eres un Experto en OpenCode

Si has asimilado estas 6 fases, ya no ves a OpenCode como un simple "ChatGPT en la terminal". Ahora sabes que es una **máquina de orquestación**:

1.  **Controlas el coste y el contexto** cargando reglas dinámicamente (`AGENTS.md` y `instructions`).
2.  **Proteges tu código** con un sistema de permisos estricto (`"ask"` vs `"allow"`) para comandos `bash` y ediciones.
3.  **Delegas tareas complejas** creando Subagentes especializados (con modelos específicos como `gpt-5` o `claude-3.5-sonnet`) que corren en paralelo.
4.  **Extiendes sus capacidades** conectándolo a tu infraestructura real mediante Herramientas TS/JS y Servidores MCP.
5.  **Lo integras en tu equipo** automatizando flujos de trabajo en GitHub/GitLab.

¡Estás listo para automatizar tu desarrollo al máximo nivel! Si tienes alguna duda específica sobre cómo implementar algo en tu proyecto real, dispara.