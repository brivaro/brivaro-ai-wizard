### 4. La Guía Maestra de `opencode.json`

El archivo `opencode.json` es el cerebro de la configuración de OpenCode. La regla de oro es la **Jerarquía de Fusión**: lo que pongas en el `opencode.json` de la raíz de tu proyecto **sobrescribe** lo que tengas en tu configuración global (`~/.config/opencode/opencode.json`). 

Podemos encontrar el esquema completo de configuración en [https://opencode.ai/config.json](https://opencode.ai/config.json), pero vamos a diseccionar un ejemplo extremo para que veas todo lo que puedes controlar. Tembién podemos encontrar + info en [https://docs.evroc.com/integrations/opencode.html](https://docs.evroc.com/integrations/opencode.html).

```json
{
  "$schema": "https://opencode.ai/config.json",
  
  // 1. MODELOS BASE
  // El modelo principal para programar (ej. Claude 3.5 Sonnet o GPT 5.2)
  "model": "anthropic/claude-sonnet-4-5",
  // Un modelo más barato/rápido para tareas menores (como generar títulos de sesión)
  "small_model": "anthropic/claude-haiku-4-5",

  // 2. CONFIGURACIÓN DE PROVEEDORES Y VARIABLES
  "provider": {
    "anthropic": {
      "options": {
        // Usa variables de entorno ({env:...}) o lee de un archivo ({file:...})
        "apiKey": "{env:ANTHROPIC_API_KEY}",
        "timeout": 600000 
      }
    }
  },

  // 3. SISTEMA GRANULAR DE PERMISOS (Sustituye a "tools")
  // "allow" (ejecuta solo), "ask" (te pide permiso), "deny" (bloqueado)
  "permission": {
    // Permisos por defecto para las herramientas principales
    "read": "allow",
    "webfetch": "deny", // Bloqueamos que la IA navegue por internet
    
    // Control estricto de Bash (Terminal) usando comodines (*)
    "bash": {
      "git status *": "allow",
      "npm test *": "allow",
      "rm *": "deny",       // Nunca le dejes borrar cosas sin preguntar
      "*": "ask"            // Para cualquier otro comando, que pregunte
    },
    
    // Control de edición de archivos
    "edit": {
      "*.md": "allow",                   // Puede editar markdowns libremente
      "packages/core/**/*.ts": "ask",    // Si toca el core, que te avise
      "*": "allow"                       // El resto de archivos los puede editar
    },

    // Si la IA intenta leer/editar algo fuera de tu carpeta actual (ej. un repo paralelo)
    "external_directory": {
      "~/projects/shared-libs/**": "ask",
      "*": "deny" // Bloquea acceso a otras carpetas de tu PC
    }
  },

  // 4. CREACIÓN Y MODIFICACIÓN DE AGENTES
  // Aquí puedes sobreescribir el agente "build" (por defecto) o crear nuevos
  "agent": {
    "build": {
      "permission": {
        "edit": "allow" // El agente build tiene vía libre
      }
    },
    // Creando un Subagente personalizado para Base de Datos
    "db-expert": {
      "mode": "subagent",
      "model": "openai/gpt-5", // Usa un modelo más potente solo para esto
      "description": "Experto en migraciones SQL y optimización de queries",
      "prompt": "Eres un experto en PostgreSQL. Analiza esquemas y sugiere índices.",
      "temperature": 0.1,
      "permission": {
        "bash": { "psql *": "allow", "*": "deny" },
        "edit": "deny" // Este subagente solo aconseja, no edita
      }
    }
  },

  // 5. LSPs (Language Server Protocol) Y FORMATTERS
  // OpenCode arranca LSPs en segundo plano para que la IA entienda referencias y errores
  "lsp": {
    "typescript": {
      "disabled": false,
      "initialization": {
        "preferences": { "importModuleSpecifierPreference": "relative" }
      }
    },
    "python": { "disabled": true } // Apaga el LSP de Python si no lo usas en este proyecto
  },
  
  "formatter": {
    "prettier": { "disabled": false }, // Auto-formatea usando prettier si lo detecta
    "custom-oxfmt": { // Usar un formateador experimental
      "command":["npx", "oxlint", "--fix", "$FILE"],
      "extensions": [".js", ".ts"]
    }
  },

  // 6. INSTRUCCIONES MODULARES (La evolución del AGENTS.md)
  // En vez de un AGENTS.md gigante, cargas reglas específicas desde archivos
  "instructions":[
    "docs/architecture.md",
    "docs/api-guidelines.md",
    "https://raw.githubusercontent.com/mi-empresa/rules/main/style.md" // Reglas remotas compartidas
  ],

  // 7. PLUGINS y MCPs (Se explicará a fondo luego)
  "plugin":[
    "opencode-vibeguard", // Plugin de NPM para ocultar secretos antes de ir al LLM
    "./.opencode/plugins/mi-plugin-local.ts"
  ],

  // 8. OPTIMIZACIÓN DEL ENTORNO
  "watcher": {
    "ignore":["node_modules/**", "dist/**", ".git/**", "coverage/**"]
  },
  "share": "disabled" // Por seguridad en la empresa, bloquea el comando /share
}
```

### ¿Qué es lo más importante aquí para un flujo de experto?

1. **`instructions` (Reglas Modulares):** En proyectos grandes, un archivo `AGENTS.md` se vuelve inmanejable y consume demasiados tokens. Poniendo rutas de archivos en `"instructions"`, OpenCode los añade al contexto de manera organizada, e incluso soporta URLs para que todo tu equipo comparta el mismo `style.md` alojado en un repo de reglas de la empresa.
2. **Control Granular con `"permission"`:** La verdadera autonomía se logra configurando qué comandos `bash` y qué carpetas puede tocar sin preguntar. Si pones `"npm test": "allow"`, puedes decirle a la IA: *"Implementa esta feature y corre los tests hasta que pasen"*. La IA hará un bucle de (Escribir código -> Correr tests -> Ver errores -> Corregir código) de forma 100% automática sin que tengas que darle al `Enter` para aprobar cada intento.
3. **Agentes en el JSON:** Aunque puedes crear agentes con archivos `.md`, declararlos aquí te permite asignarles **modelos específicos**. Por ejemplo, puedes tener el agente primario en un modelo barato (Claude Haiku o Gemini Flash), y un subagente de arquitectura apuntando a `gpt-5` para tareas de alto nivel lógico.
