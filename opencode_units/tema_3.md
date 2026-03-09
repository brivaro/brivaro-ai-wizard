### 5. Personalización Avanzada: Comandos Custom y Contexto Dinámico

Para ser un experto, no puedes estar escribiendo el mismo prompt de 10 líneas cada vez que quieres hacer un refactor, revisar una Pull Request o crear un componente. Para eso existen los **Comandos Personalizados** y el **Control de Contexto (`AGENTS.md`)**.

---

#### A. Comandos Personalizados (`.opencode/commands/`)

Puedes crear tus propios comandos que se ejecutan escribiendo `/tu-comando` en la TUI. Se definen creando archivos Markdown en la carpeta `.opencode/commands/` de tu proyecto (o globalmente en `~/.config/opencode/commands/`).

El archivo tiene dos partes: un bloque YAML (Frontmatter) para configurar cómo se ejecuta, y el cuerpo (Template) que es el prompt que se enviará a la IA.

**Ejemplo de Experto: `/test-fix`**
Crea el archivo `.opencode/commands/test-fix.md`:

```markdown
---
description: Corre los tests, analiza el fallo y lo arregla en un subagente
agent: general
subtask: true
model: anthropic/claude-sonnet-4-5
---
He ejecutado la suite de tests para el archivo $1. 
Aquí tienes los resultados actuales de la terminal:

! `npm test $1`

Revisa también las reglas de testing de nuestro proyecto en @docs/testing-rules.md.

Tu tarea:
1. Analiza por qué fallan los tests.
2. Modifica el código para arreglarlos.
3. Vuelve a ejecutar `npm test $1` para verificar que todo pasa.
```

**La Magia (Sintaxis Especial):**
1. **`$1`, `$2` o `$ARGUMENTS`:** Captura lo que escribes en la TUI. Si escribes `/test-fix auth.spec.ts`, el `$1` se reemplaza por `auth.spec.ts`.
2. **`! comando` (Inyección de Shell):** Esto es vital. OpenCode ejecutará `npm test auth.spec.ts` en tu consola **antes** de enviar el prompt a la IA, y pegará la salida del error directamente en el mensaje.
3. **`@archivo` (Inyección de Archivo):** Lee el contenido de `docs/testing-rules.md` y lo mete en el prompt automáticamente.
4. **`subtask: true`:** Fuerza a que este comando se ejecute en un Subagente invisible. Así, la IA arregla tu test en paralelo sin ensuciar la conversación principal que tienes en tu TUI.

---

#### B. `AGENTS.md` y el "Lazy Loading" (Carga Perezosa de Contexto)

El archivo `AGENTS.md` (en la raíz de tu proyecto) es lo primero que lee OpenCode al arrancar. Le da a la IA el contexto global del proyecto (arquitectura, convenciones de nombres, etc.).

**El problema del novato:** Meter 500 líneas de reglas en el `AGENTS.md`. Esto satura el contexto del LLM en cada mensaje, gasta tokens a lo bestia y hace que la IA se confunda.

**La solución del experto (Lazy Loading):**
Mantén el `AGENTS.md` muy corto y enséñale a la IA a **usar su herramienta de lectura (`read`) solo cuando lo necesite**.

Ejemplo de un `AGENTS.md` optimizado:

```markdown
# Proyecto Monorepo E-commerce

## Estructura
- `apps/web/` - Frontend en Next.js
- `packages/db/` - Esquema de Prisma y migraciones
- `packages/core/` - Lógica de negocio

## Carga Dinámica de Reglas (CRÍTICO)
No cargues todas las reglas de golpe. Cuando vayas a trabajar en un área específica, usa tu herramienta `read` para leer los siguientes archivos según los necesites:

- Si vas a tocar base de datos, lee primero: `@docs/db-rules.md`
- Si vas a crear componentes UI, lee: `@docs/react-patterns.md`
- Si vas a escribir tests, revisa: `@docs/testing-guidelines.md`

Instrucciones: Trata el contenido de esos archivos como reglas obligatorias que sobrescriben cualquier comportamiento por defecto.
```

De esta forma, si le pides a OpenCode: *"Crea un nuevo botón en el frontend"*, la IA leerá el `AGENTS.md`, verá que para UI necesita leer `@docs/react-patterns.md`, **ejecutará la herramienta `read` de forma autónoma** para aprender tus patrones, y luego escribirá el código. Has salvado miles de tokens y ganado precisión.