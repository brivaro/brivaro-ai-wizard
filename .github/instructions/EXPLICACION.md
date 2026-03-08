# 📚 Guía Definitiva: Custom Instructions en VS Code & GitHub Copilot

Las **Custom Instructions** (Instrucciones Personalizadas) permiten definir directrices, reglas y estándares que influyen automáticamente en cómo la IA genera código y responde en el chat. En lugar de repetir contexto en cada prompt, se configuran archivos Markdown.

> **Nota:** Las instrucciones personalizadas afectan al Chat, pero **no** se tienen en cuenta para las sugerencias en línea (inline suggestions) mientras escribes código (ghost text).

---

## 🏗️ Tipos de Archivos de Instrucciones

VS Code soporta dos categorías principales. Si existen múltiples archivos, VS Code los combina en el contexto del chat (sin un orden garantizado específico).

### 1. Instrucciones "Always-on" (Globales)
Se incluyen automáticamente en **todas** las peticiones al chat dentro del workspace.

| Tipo de Archivo | Ubicación | Uso Principal |
| :--- | :--- | :--- |
| **`.github/copilot-instructions.md`** | Raíz del workspace (`.github/`) | Estándares generales del proyecto, arquitectura, estilo de código. Es el estándar por defecto. |
| **`AGENTS.md`** | Raíz o subcarpetas | Ideal si trabajas con múltiples agentes de IA. Soporta anidamiento experimental en subcarpetas (ver configuración). |
| **`CLAUDE.md`** | Raíz, carpeta `.claude/` o Home | Para compatibilidad con herramientas basadas en Claude (Claude Code). |
| **Nivel Organización** | Configurado en GitHub | Reglas que aplican a todos los repositorios de una organización. |

### 2. Instrucciones "File-based" (Contextuales)
Se aplican dinámicamente **solo** cuando los archivos con los que trabaja el agente coinciden con un patrón específico o la tarea lo requiere.

*   **Extensión:** `*.instructions.md`
*   **Ubicación por defecto:** `.github/instructions/` (Workspace) o carpeta de perfil de usuario.
*   **Activación:** Se basa en patrones `glob` definidos en el archivo o coincidencia semántica.

---

## 🛠️ Detalle de Archivos Específicos

### A. `.github/copilot-instructions.md` (El Estándar)
Úsalo para reglas que aplican a **todo** el proyecto:
*   Convenciones de nomenclatura y estilo.
*   Stack tecnológico y librerías preferidas.
*   Patrones arquitectónicos a seguir o evitar.
*   Manejo de errores y seguridad.

### B. `*.instructions.md` (Reglas por Ruta/Contexto)
Esta es una función avanzada para reglas modulares. Permite tener reglas que solo se activan si estás editando un tipo de archivo específico.

**Formato del Archivo:**
Requiere un encabezado YAML (Frontmatter) y luego el cuerpo en Markdown.

| Campo YAML | Requerido | Descripción |
| :--- | :--- | :--- |
| `name` | No | Nombre visible en la UI. |
| `description` | No | Breve descripción para el agente. |
| `applyTo` | **Importante** | Patrón `glob` que define dónde se aplica (ej: `**/*.ts`). Si no se pone, no se aplica automáticamente. |

#### Ejemplo Práctico: Reglas Frontend
Imagina que tienes un proyecto Full-Stack y no quieres que la IA te sugiera reglas de base de datos cuando estás editando un botón de la interfaz.

**Archivo:** `.github/instructions/frontend.instructions.md`

```markdown
---
name: 'Frontend Rules'
description: 'Reglas para React y Next.js'
applyTo: "src/components/**/*.tsx, src/app/**/*.tsx"
---

# Reglas estrictas para el Frontend (React/Next.js)

Estás trabajando en la capa visual del proyecto. Aplica siempre estas reglas:

1. **Estilos:** Usa EXCLUSIVAMENTE Tailwind CSS. Nunca uses CSS-in-JS ni estilos en línea.
2. **Componentes:** 
   - Asume que son Server Components por defecto.
   - Solo añade `"use client"` si usas hooks (`useState`) o eventos (`onClick`).
3. **Accesibilidad (a11y):** 
   - Elementos interactivos deben tener `aria-label`.
   - Imágenes siempre con atributo `alt`.
4. **Exportaciones:** Usa `export const`, NUNCA `export default`.
```

### C. `AGENTS.md` (Multi-Agente y Anidado)
VS Code detecta automáticamente este archivo en la raíz.
*   **Uso:** Para instrucciones que deben reconocer múltiples agentes de IA distintos.
*   **Experimental (Nested):** Si activas `chat.useNestedAgentsMdFiles`, VS Code buscará archivos `AGENTS.md` recursivamente en subcarpetas. Esto permite tener un `AGENTS.md` en `/backend` y otro en `/frontend` que se activan según dónde estés trabajando.

### D. `CLAUDE.md` (Compatibilidad)
VS Code busca en este orden:
1. Raíz del workspace.
2. Carpeta `.claude/CLAUDE.md`.
3. Directorio Home del usuario (`~/.claude/CLAUDE.md`) -> Útil para reglas personales globales.

---

## ⚙️ Configuración y Creación

### Cómo crear instrucciones
1.  **Vía Chat:** Escribe `/instructions` o `/init` en el chat.
2.  **Vía UI:** Icono de engranaje en la vista de Chat > **Chat Instructions** > **New instruction file**.
3.  **Vía Comandos:** `Ctrl+Shift+P` -> `Chat: New Instructions File`.
4.  **Generación Automática:** El comando `/init` analiza tu código y estructura del proyecto para generar un archivo de instrucciones inicial automáticamente.

### Ubicaciones y Ajustes
*   **Workspace:** `.github/instructions` (por defecto). Puedes añadir más rutas con `chat.instructionsFilesLocations`.
*   **Usuario (Global):** Se guardan en el perfil actual de VS Code y aplican a **todos** tus proyectos.
*   **Sincronización:** Puedes sincronizar tus reglas de usuario entre dispositivos activando "Prompts and Instructions" en el **Settings Sync** de VS Code.

### Referencias en Markdown
Puedes referenciar herramientas del agente dentro de las instrucciones usando `#tool:`.
Ejemplo: `Usa #tool:githubRepo para buscar contexto antes de responder.`

---

## 🏆 Prioridad de Instrucciones
Cuando existen múltiples tipos de instrucciones, la IA las recibe todas, pero en caso de conflicto, este es el orden de precedencia (de mayor a menor):

1.  **Instrucciones Personales** (Nivel usuario / Perfil).
2.  **Instrucciones del Repositorio** (Workspace: `.github/copilot-instructions.md`, `AGENTS.md`, etc.).
3.  **Instrucciones de la Organización** (Configuradas en GitHub Enterprise).

---

## 💡 Mejores Prácticas (Tips)
*   **Sé conciso:** Una instrucción = Una declaración simple.
*   **Explica el "Por qué":** La IA razona mejor si entiende el motivo (ej: "Usa `date-fns` porque `moment.js` está obsoleto").
*   **Usa Ejemplos:** Muestra patrones de código preferidos (y patrones a evitar).
*   **Modulariza:** Empieza con un `copilot-instructions.md` global. Luego añade archivos `*.instructions.md` específicos para casos concretos (tests, docs, lenguajes específicos).

---

## ❓ Troubleshooting (Solución de problemas)

**¿Por qué no se aplica mi archivo?**
1.  **Ubicación:** Verifica que `copilot-instructions.md` esté exactamente en `.github/` (no en `.github/instructions/`).
2.  **Glob Pattern:** En archivos `*.instructions.md`, verifica que el campo `applyTo` coincida con el archivo que tienes abierto. Si no hay `applyTo`, no se activa solo.
3.  **Configuración:** Revisa que `chat.useAgentsMdFile` o `chat.useClaudeMdFile` estén activados si usas esos formatos.
4.  **Diagnóstico:** Haz clic derecho en la vista de Chat > **Diagnostics**. Ahí verás qué archivos de instrucciones se han cargado y si hay errores.