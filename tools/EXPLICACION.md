En `tools/scripts/` pueden colocarse scripts y utilidades que la IA (o procesos automatizados) puede ejecutar directamente.

Recomendaciones para `tools/scripts/`:
- Mantener scripts idempotentes y sin efectos secundarios inesperados.
- No incluir secretos ni credenciales en texto plano.
- Documentar la finalidad y los argumentos esperados en la cabecera del script.

En `tools/prompts/` guarda plantillas de prompts y ejemplos de entrada/salida.

Recomendaciones para `tools/prompts/`:
- Escribir prompts concisos y específicos; evita largas explicaciones sobre cómo funciona la IA.
- Proveer ejemplos de entrada y salida esperada para mayor precisión.
- Indicar claramente restricciones, formato de respuesta y criterios de éxito.

Estas carpetas facilitan la colaboración entre humanos y asistentes: los scripts permiten automatizar tareas reproducibles, y los prompts ayudan a mantener consistencia en las interacciones.
