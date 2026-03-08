# 📚 Guía Definitiva: Prompt Files (.prompt.md)

Los **Prompt Files** (o Slash Commands) son comandos reutilizables que permiten estandarizar tareas repetitivas en el chat de IA. Funcionan como "macros": en lugar de escribir instrucciones complejas una y otra vez, las guardas en un archivo Markdown y las invocas escribiendo `/nombre` en el chat.

A diferencia de las *Custom Instructions* (que son pasivas y automáticas), los Prompt Files son **activos** y manuales. Tú decides cuándo usarlos.

---

## 🏗️ Estructura y Ubicación

### Ubicación
| Ámbito | Ruta por defecto | Descripción |
| :--- | :--- | :--- |
| **Workspace** | `.github/prompts/` | Solo disponible en el proyecto actual. |
| **Usuario (Perfil)** | Carpeta de perfil de VS Code | Disponible en todos tus proyectos. |

### Formato del Archivo (.prompt.md)
Es un archivo Markdown estándar con un encabezado YAML (Frontmatter) opcional pero recomendado.

| Campo YAML | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `name` | El comando que escribirás en el chat (sin espacios). | `AuditSecurity` (se invoca con `/AuditSecurity`) |
| `description` | Breve texto de ayuda que aparece al escribir `/`. | "Analiza vulnerabilidades OWASP" |
| `agent` | Qué agente debe ejecutarlo (`agent` por defecto). | `agent`, `workspace`, o un agente personalizado. |
| `tools` | Lista de herramientas o servidores MCP permitidos. | `['githubRepo', 'mcp-server/*']` |
| `argument-hint` | Pista visual en la caja de texto para el usuario. | "pega el código aquí" |

---

## 🧩 Variables Dinámicas
Puedes hacer tus prompts inteligentes usando variables dentro del cuerpo del Markdown:

*   **Variables de Contexto:**
    *   `${selection}` / `${selectedText}`: El código que tienes seleccionado.
    *   `${file}`: El contenido del archivo actual abierto.
    *   `${workspaceFolder}`: Ruta del proyecto.
*   **Variables de Input (Interactivas):**
    *   `${input:variableName}`: Pide al usuario que escriba un valor en el chat.
    *   Ejemplo: `Crea un componente llamado ${input:componentName}`.

---

## ⚡ Ejemplos Prácticos

### 1. Auditoría de Seguridad (Hardening)
Imagina que estás cansado de escribirle a la IA: *"Actúa como un experto en ciberseguridad..."*.

**Archivo:** `.github/prompts/audit.prompt.md`
**Comando:** `/AuditSecurity`

```markdown
---
name: AuditSecurity
description: "Realiza una auditoría de seguridad exhaustiva del código seleccionado."
tools: ["githubRepo"]
---

Eres un ingeniero experto en ciberseguridad especializado en el Top 10 de OWASP. 
Por favor, analiza el código en `${selection}` prestando especial atención a:

- Posibles inyecciones (SQL, NoSQL, Command Injection).
- Vulnerabilidades de Cross-Site Scripting (XSS).
- Exposición de datos sensibles (hardcoded secrets).

## Formato de Salida:
1. Si es seguro: "✅ **Auditoría superada**".
2. Si hay fallos, genera una tabla: `Severidad` | `Línea` | `Vulnerabilidad` | `Fix`.
```

### 2. Generador de Tests Estandarizados
Ideal para que todo el equipo escriba los tests igual.

**Archivo:** `.github/prompts/tests.prompt.md`
**Comando:** `/MakeTests`

```markdown
---
name: MakeTests
description: "Genera pruebas unitarias usando Vitest para el archivo actual."
model: "gpt-4o"
---

Actúa como un QA Engineer Senior. Escribe pruebas unitarias para `${file}` utilizando **Vitest** y **React Testing Library**.

Reglas de Oro:
1. Agrupa los tests usando `describe()` con el nombre de la funcionalidad.
2. Usa estrictamente el patrón **AAA** (Arrange, Act, Assert).
3. **Mocks:** Haz mock de todas las llamadas a API externas (no uses red real).
4. Cobertura: Incluye 1 "Happy Path" y al menos 2 "Edge Cases" (errores o límites).
```

### 3. Scaffold con Variables (Input del Usuario)
Para crear estructuras de código repetitivas pidiendo datos al usuario.

**Archivo:** `.github/prompts/new-component.prompt.md`
**Comando:** `/NewComponent`

```markdown
---
name: NewComponent
description: "Crea un nuevo componente de React con su archivo de estilos."
argument-hint: "Nombre del componente"
---

Genera un nuevo componente de React llamado **${input:nombreComponente}**.
1. Crea el archivo `${input:nombreComponente}.tsx` con tipado fuerte en TypeScript.
2. Crea el archivo `${input:nombreComponente}.module.css` (vacío por ahora).
3. Asegúrate de importar los estilos correctamente en el `.tsx`.
```

---

## 🚀 Cómo usarlos
1.  **Crear:** Usa el comando `Chat: New Prompt File` (Ctrl+Shift+P) o crea el archivo manualmente en `.github/prompts/`.
2.  **Invocar:** Ve al chat y escribe `/`. Verás tu comando en la lista.
    *   Ejemplo: `/NewComponent nombreComponente=Header`
3.  **Probar:** Puedes abrir el archivo `.prompt.md` y darle al botón de "Play" (▶️) en la barra de título del editor para probarlo al instante.

> **Tip Pro:** Usa el ajuste `chat.promptFilesRecommendations` para que VS Code te sugiera tus propios prompts cuando empieces un chat nuevo o abras un archivo relevante.