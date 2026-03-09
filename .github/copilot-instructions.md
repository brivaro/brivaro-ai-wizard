# AGENTS.md

Contexto, reglas y convenciones de este proyecto para los asistentes de IA.

## Cómo usar esta guía

- Empieza aquí para normas transversales del repositorio.
- Cada componente puede tener su propio `AGENTS.md` que sea específica de ese componente. 
- En el `AGENTS.md` raíz se listan el resto de los `AGENTS.md`, las skills disponibles y las reglas generales.

## Secciones recomendadas

- **How to Use This Guide:** Indica cómo y cuándo seguir estas reglas.
- **Available Skills:** Lista breve de skills comunes y su ruta (por ejemplo: skills/typescript/SKILL.md).
- **Auto-invoke Rules:** Acciones que deben invocar una skill específica antes de modificar código.
- **Project Overview:** Resumen corto de componentes y tecnologías.
- **Commit & PR Guidelines:** Estilo de commits, checklist de PR y requisitos de CI.

## Ejemplo rápido de "Available Skills"

- typescript: patrones de tipos y utilidades — skills/typescript/SKILL.md
- nextjs-15: App Router y Server Actions — skills/nextjs-15/SKILL.md
- ai-sdk-5: mensajería, streaming — skills/ai-sdk-5/SKILL.md
- review-project: Analyzes a project to find implementable ideas and areas for improvement — skills/revisar-el-proyecto/SKILL.md

## Buenas prácticas

- Mantén las entradas de `SKILL.md` pequeñas y enfocadas.
- Cuando crees una nueva skill, actualiza la sección "Available Skills".
- Para cambios en infra/CI, añade la skill correspondiente en la tabla "Auto-invoke Rules".

## Antes de crear un PR

1. Sigue la convención de commits: `<type>[scope]: <descripción>` (feat, fix, docs, chore, test).
2. Ejecuta linters y tests relevantes.
3. Añade una entrada de changelog si aplica.
