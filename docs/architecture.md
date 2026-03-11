# Arquitectura del Proyecto

## Visión general
Breve descripción de la arquitectura general, componentes principales y responsabilidades. Si hay muchos elementos de infraestructura, considera crear subdocumentos para cada uno y meterlos por separado en la carpeta `docs/architecture/` para explicar cada componente de forma resumida y no inundar al agente de IA con información excesiva.

## Componentes
- **Frontend**: descripción, tecnologías.
- **Backend / API**: descripción, endpoints clave, responsabilidades.
- **Bases de datos**: modelos, particionamiento/replicación, backups.
- **Integraciones externas**: colas, servicios de terceros, autenticación.

## Decisiones de diseño
- Resumen de decisiones arquitectónicas clave, con enlaces a los documentos en `docs/decisions/` que expliquen cada decisión de forma resumida (ej. elección de base de datos, patróns de diseño, etc.).

## Diagramas
- Incluye diagramas de alto nivel (referenciar imágenes o archivos dot/mermaid).

## Escalabilidad y disponibilidad
- Consideraciones para scale-out, balanceo, tolerancia a fallos.

## Seguridad
- Autenticación, autorización, gestión de secretos, límites de rate.

## Operaciones y runbooks
- Referencia a la carpeta `runbooks/` para procedimientos operativos.
