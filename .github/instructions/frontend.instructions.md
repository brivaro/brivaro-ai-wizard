---
applyTo: "frontend/src/components/**/*.tsx, frontend/src/app/**/*.tsx"
---

# Reglas estrictas para el Frontend (React/Next.js)

Estás trabajando en la capa visual del proyecto. Aplica siempre estas reglas a tus sugerencias de código:

1. **Estilos:** Usa EXCLUSIVAMENTE Tailwind CSS. Nunca uses CSS-in-JS, archivos `.module.css` ni estilos en línea (`style={{...}}`).
2. **Componentes Server vs Client:** 
   - Asume que todos los componentes son Server Components por defecto.
   - Solo añade la directiva `"use client"` si el componente usa `useState`, `useEffect` o eventos de usuario como `onClick`.
3. **Accesibilidad (a11y):** 
   - Todos los elementos interactivos (`<button>`, `<a>`) deben tener atributos `aria-label` si no tienen texto descriptivo interno.
   - Las imágenes `<img>` o `<Image>` SIEMPRE deben incluir el atributo `alt`.
4. **Exportaciones:** Usa siempre exportaciones con nombre (`export const MiComponente`), NUNCA uses `export default`.