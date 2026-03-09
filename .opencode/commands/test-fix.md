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