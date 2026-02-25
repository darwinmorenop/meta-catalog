---
name: doc-to-app
description: Convierte un documento (PDF/texto) en una mini-app web interactiva lista para abrir en preview. Úsalo cuando quieras pasar de “contenido” a “producto usable”.
---
# Doc-to-App (Documento a Mini-App)

## Cuándo usar esta habilidad
- Cuando tengas información en un PDF, texto o notas y quieras transformarla en una mini web navegable.
- Cuando necesites un buscador, filtros y secciones claras para un conjunto de contenido.
- Para pasar de “contenido bruto” a un “producto usable” listo para enseñar o compartir.

## Inputs necesarios (si faltan, pregunta primero)
1) **Fuente**: PDF o texto pegado.
2) **Tipo de app**: Guía, catálogo, checklist, itinerario, etc.
3) **Prioridad**: “Más visual” o “más práctica”.
4) **Idioma y estilo**: Claro, sencillo, sin jerga.

## Workflow (orden fijo)
1) **Extracción**: Leer el documento y extraer la estructura (secciones, listas, tablas, puntos clave).
2) **Estructuración**: Convertir la información a un archivo `data.json` ordenado.
3) **Generación**: Generar un archivo `index.html` que lea de `data.json` (usando Vanilla JS, sin frameworks externos complejos).
4) **Validación**: Verificar que el diseño es responsive, que el buscador funciona y que no hay contenido roto.
5) **Entrega**: Informar al usuario sobre la carpeta creada y el archivo principal.

## Instrucciones y Reglas de Calidad
- **No solo texto**: Debes crear archivos físicos y una estructura de aplicación.
- **No sobrescribas**: Cada ejecución debe crear una carpeta nueva siguiendo el patrón: `miniapp_<tema>_<YYYYMMDD_HHMM>`.
- **Móvil Primero**: La app debe ser perfectamente responsive.
- **Estructura de salida obligatoria**:
  - `index.html`: La aplicación interactiva.
  - `data.json`: Los datos extraídos.
  - `README.txt`: Instrucciones de uso.
- **Funcionalidades mínimas**:
  - Buscador por texto.
  - Filtros por categorías/etiquetas.
  - Navegación por secciones.
  - Diseño limpio y premium.
  - Micro-interacciones (copiar, marcar hecho, colapsar).

## Output (formato exacto)
Al terminar, responde siempre con:
1) **Carpeta creada**: [Ruta de la carpeta].
2) **Archivo principal**: [Ruta al index.html].
3) **Resumen**: Breve lista de secciones y funcionalidades implementadas.
