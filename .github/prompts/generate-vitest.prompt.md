---
name: MakeTests
description: "Genera pruebas unitarias usando Vitest para el archivo actual."
---

Actúa como un QA Engineer Senior. Escribe pruebas unitarias exhaustivas para el código adjunto utilizando **Vitest** y **React Testing Library**.

Reglas:
1. Agrupa los tests usando `describe()` describiendo el comportamiento esperado, no solo el nombre de la función.
2. Usa el patrón AAA (Arrange, Act, Assert).
3. Haz mock de todas las llamadas a la API externas. No quiero peticiones de red reales.
4. Incluye al menos un "Happy Path" y dos "Edge Cases" (casos límite o de error).