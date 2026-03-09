### 6. El Jefe Final: Herramientas Personalizadas y Servidores MCP

Hasta ahora, la IA de OpenCode usaba sus herramientas integradas (leer, escribir, ejecutar bash). Pero, ¿qué pasa si necesitas que la IA consulte tu base de datos de producción, lea tickets de Jira o ejecute un script de Python complejo? Para eso existen las **Herramientas Personalizadas** y los **Servidores MCP**.

---

#### A. Herramientas Personalizadas (Custom Tools)

Las herramientas personalizadas son funciones que tú programas (en TypeScript o JavaScript) y que el LLM puede invocar a voluntad. Se guardan en `.opencode/tools/` (para el proyecto) o en `~/.config/opencode/tools/` (globales).

**El superpoder:** Aunque la definición de la herramienta se escribe en TS/JS, ¡por dentro puede ejecutar scripts en Bash, Python, Go o cualquier cosa!

**Ejemplo de Experto: Herramienta para consultar una Base de Datos**
Crea el archivo `.opencode/tools/db.ts`. El nombre del archivo (`db`) será el nombre de la herramienta que verá la IA.

```typescript
import { tool } from "@opencode-ai/plugin"

// Zod viene incluido en tool.schema para definir los argumentos estrictamente
export default tool({
  description: "Ejecuta una consulta SQL de solo lectura en la base de datos de desarrollo",
  args: {
    query: tool.schema.string().describe("La consulta SQL a ejecutar"),
  },
  async execute(args, context) {
    // context te da información útil como context.directory o context.worktree
    console.log(`La IA está ejecutando: ${args.query}`);
    
    try {
      // Usamos Bun.$ (incluido en OpenCode) para ejecutar un comando real de BD
      const result = await Bun.$`psql -d mi_bd_dev -c ${args.query}`.text();
      return `Resultado de la query:\n${result}`;
    } catch (error) {
      return `Error ejecutando la query: ${error.message}`;
    }
  },
})
```

**Ejemplo 2: Ejecutar un script de Python**
Imagina que tienes un script de Machine Learning complejo. En `.opencode/tools/predict.ts`:

```typescript
import { tool } from "@opencode-ai/plugin"
import path from "path"

export default tool({
  description: "Usa el modelo de Python para predecir un valor basado en un input",
  args: {
    inputData: tool.schema.string().describe("JSON con los datos de entrada"),
  },
  async execute(args, context) {
    const script = path.join(context.worktree, "scripts/ml_predict.py");
    // Ejecuta Python y le pasa el JSON como argumento
    const result = await Bun.$`python3 ${script} '${args.inputData}'`.text();
    return result.trim();
  },
})
```

Cuando le pidas a OpenCode: *"Dame una predicción para estos datos"*, la IA sabrá que tiene la herramienta `predict`, generará el JSON, ejecutará tu código TS, que a su vez llama a Python, y te devolverá el resultado.

---

#### B. Servidores MCP (Model Context Protocol)

**¿Qué es MCP?** Es un estándar (creado por Anthropic) que permite conectar LLMs a fuentes de datos externas sin tener que programar integraciones desde cero. La comunidad ya ha creado servidores MCP para GitHub, Sentry, Jira, Slack, Postgres, Google Drive, etc.

Puedes añadir servidores MCP a OpenCode de dos formas: **Locales** (se ejecutan en tu máquina) o **Remotos** (te conectas a una URL).

**1. Configurar un MCP Local (ej. Explorar todo tu PC de forma segura)**
Edita tu `opencode.json`. Vamos a añadir un servidor MCP de prueba o uno de SQLite:

```json
{
  "mcp": {
    "sqlite_db": {
      "type": "local",
      "command":["npx", "-y", "@modelcontextprotocol/server-sqlite", "mi_base_de_datos.db"],
      "enabled": true
    }
  }
}
```
*Ahora, OpenCode arranca automáticamente ese servidor. La IA de repente "aprende" a usar todas las herramientas que exponga ese servidor MCP (leer tablas, hacer queries, etc.).*

**2. Configurar un MCP Remoto (ej. Sentry para leer bugs en producción)**
Añade esto a tu `opencode.json`:

```json
{
  "mcp": {
    "sentry": {
      "type": "remote",
      "url": "https://mcp.sentry.dev/mcp",
      "oauth": {} 
    }
  }
}
```
Como requiere autenticación (OAuth), vas a tu terminal y ejecutas:
`opencode mcp auth sentry`
Se abrirá el navegador, te logueas en Sentry, y OpenCode guardará el token de forma segura en `~/.local/share/opencode/mcp-auth.json`. 

Ahora puedes decirle a OpenCode: *"Revisa los últimos errores críticos en mi proyecto de Sentry y arréglalos en mi código local"*. ¡Magia negra!

**⚠️ ADVERTENCIA DE EXPERTO (Control de Contexto con MCPs)**
Los servidores MCP exponen MUCHAS herramientas (por ejemplo, el de GitHub añade docenas de comandos). Esto inunda el contexto de la IA y **quema tokens brutalmente**. 

**La solución pro:** Apaga el MCP globalmente, y enciéndelo **SOLO** para un agente específico.

En tu `opencode.json`:
```json
{
  "mcp": {
    "github_mcp": {
      "type": "local",
      "command":["npx", "-y", "@modelcontextprotocol/server-github"]
    }
  },
  // 1. Apagamos todas las herramientas de github_mcp para el agente primario por defecto
  "tools": {
    "github_mcp*": false 
  },
  // 2. Creamos un subagente especializado al que SÍ le damos permiso
  "agent": {
    "github-manager": {
      "mode": "subagent",
      "description": "Se encarga de leer y responder issues en GitHub",
      "tools": {
        "github_mcp*": true 
      }
    }
  }
}
```
Así mantienes a tu Agente "Build" rápido y ligero, y cuando necesite ver GitHub, invocará al subagente `github-manager` que sí tiene las herramientas cargadas.
