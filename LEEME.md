# PDF++ Exporter para Obsidian

**PDF++ Exporter** es un plugin para Obsidian diseñado para "quemar" (escribir físicamente) tus anotaciones y notas tomadas en archivos Markdown de vuelta en tus archivos PDF utilizando anotaciones estándar (rectángulos de resaltado y comentarios desplegables/popups).

Es el compañero perfecto para el plugin **PDF++**, permitiéndote compartir tus documentos estudiados o anotados con cualquier persona que no use Obsidian (abribles en Adobe Acrobat, vista previa de macOS, cualquier visor PDF estándar).

---

## 🎯 Propósito General

[PDF++](https://github.com/RyotaUshio/obsidian-pdf-plus) permite anotar PDFs sin modificar los archivos originales, manteniendo una copia "pristina" en tu vault y guardando todas las notas, resaltados y comentarios en notas Markdown. 

Si bien este enfoque bidireccional es ideal dentro de Obsidian, se pierde la relación entre la nota y el PDF cuando deseas exportar o compartir tus archivos anotados con terceros. **PDF++ Exporter** resuelve este problema analizando tus enlaces en Markdown, extrayendo el contexto y los comentarios asociados, y generando un nuevo PDF físico con anotaciones nativas estándar.

---

## 💡 Casos de Uso

1. **Compartir lecturas o artículos académicos anotados**:
   Estudias un paper usando PDF++ y tomas notas en tu bóveda. Con este plugin, exportas una versión final del PDF con todos los resaltados de color y notas adjuntas para enviar a tus compañeros o profesores.
   
   <!-- PLACEHOLDER: Captura de pantalla de la ventana de exportación -->
   *(Insertar aquí captura del modal de exportación)*

2. **Revisión de documentos y contratos**:
   Anotas contratos o borradores en Markdown. Exportas el documento PDF final conservando tus comentarios como tooltips/anotaciones nativas de PDF.
   
   <!-- PLACEHOLDER: Captura del PDF resultante abierto en Adobe Acrobat / Preview -->
   *(Insertar aquí captura del PDF resultante en un visor externo)*

---

## ⚙️ Características Principales

- **Independiente**: Aunque genera las anotaciones basadas en los enlaces de PDF++, el proceso de exportación es completamente autónomo y no requiere que el plugin PDF++ esté activo.
- **Auto-completado inteligente**: Modal intuitivo que busca y filtra PDFs en tu bóveda de Obsidian.
- **Soporte para todo tipo de anotaciones**: Exporta tanto resaltados de texto (`Highlight`) como selecciones de áreas rectangulares (`Square`).
- **Notas flotantes (Sticky Notes)**: Opción para generar notas flotantes (`Text`) con tus comentarios, además de los popups estándar de resaltado, maximizando la compatibilidad con distintos visores PDF (Vista Previa, Edge, Acrobat).
- **Personalización de resaltados**:
  - Filtro por color de anotación o tipo de nota.
  - Opacidad regulable (Alpha) para evitar colores demasiado saturados.
  - Opción para incrustar los comentarios en el propio resaltado, como notas flotantes, o ambos.
  - Texto de reemplazo configurable (por defecto `[...]`) para los enlaces Markdown dentro de los comentarios.
  - Opción para configurar una "Longitud Máxima de Alias". Los alias más cortos que esta longitud se mantendrán en el comentario (útil para alias cortos tecleados manualmente), mientras que los generados automáticamente más largos serán reemplazados. Ponlo a 0 para reemplazar siempre.
  - Opción para limpiar viñetas (`- `, `* `) y callouts de Markdown en los comentarios finales.
- **Soporte para "Dummy PDFs"**: Compatibilidad completa con PDFs remotos referenciados mediante URL.

---

## 🖼️ Capturas de Pantalla

*(Por favor, reemplaza estos placeholders con imágenes reales antes de publicar)*

- **Modal de Exportación**:
  ![Placeholder Modal Exportación](https://via.placeholder.com/600x400?text=Captura+Modal+Exportacion)
- **PDF Exportado en Visor Externo**:
  ![Placeholder Visor PDF](https://via.placeholder.com/600x400?text=PDF+en+Acrobat+o+Vista+Previa)
- **Panel de Configuración**:
  ![Placeholder Opciones](https://via.placeholder.com/600x400?text=Captura+Opciones)

---

## 🛠️ Detalles Técnicos e Implementación

### 1. El Problema de la Extracción del Comentario (Heurísticas y Convenciones)

#### El Desafío:
Extraer un "comentario" de una nota Markdown para incrustarlo como popup en un PDF es un problema abierto y mal definido. PDF++ crea el hiperenlace en Markdown apuntando a la selección (y maneja la capa visual dentro de Obsidian), pero no dicta nada respecto a cómo el usuario estructura sus comentarios alrededor de ese enlace. El formato Markdown otorga total libertad al usuario.

#### La Solución Actual (Heurísticas basadas en convenciones):
**PDF++ Exporter** resuelve esto implementando soporte para dos convenciones comunes de toma de notas:

1. **Citas en Callouts (`> [!PDF|...]`)**:
   PDF++ permite generar callouts que contienen una cita del texto resaltado y, a continuación, los comentarios del usuario.
   - El plugin extrae el cuerpo del callout como el texto principal del comentario del PDF.
   - Si el encabezado del callout contiene texto tras el tipo (ej: `> [!PDF|2026-03-06 14:00]`), este texto se extrae y se utiliza como título/metadato (autor/timestamp) del desplegable de anotación en el PDF.
2. **Texto Continuo y Elementos de Lista**:
   Los enlaces pueden incluirse dentro de frases o viñetas (ej: `"- Lo expuesto en [[paper.pdf#page=1|este párrafo]] es prohibitivo."`).
   - El exportador extrae el párrafo o ítem completo, limpiando el marcador de lista inicial (`- `, `* `).
   - Como los enlaces crudos de Markdown quedan antiestéticos dentro de un visor de PDF tradicional, la heurística reemplaza el enlace completo por un texto configurable (por defecto `[...]`).
   - Si el enlace contiene un alias corto escrito manualmente por el usuario (ej: `[[paper.pdf#page=1|aquí]]`), este puede preservarse en lugar del texto de reemplazo configurando la "Longitud Máxima de Alias" en los ajustes.

> *Nota: Conforme la comunidad adopte el plugin, se podrán incorporar nuevas heurísticas y patrones de extracción configurables por el usuario.*

### 2. El Problema del Mapeo de Coordenadas

#### El Desafío:
PDF++ no almacena las coordenadas físicas del PDF ($X, Y$ en puntos de página) en los enlaces de Markdown. En su lugar, codifica la selección de texto en la parte fragment del enlace usando números que representan líneas e índices de caracteres dentro del flujo de texto extraído por PDF.js (por ejemplo, `#page=1&selection=10,2,12,5`).

#### La Solución:
Para poder pintar rectángulos de resaltado (`Highlight`) y cuadriláteros (`QuadPoints`) nativos con la librería `pdf-lib`, **PDF++ Exporter** implementa un motor de geometría propio (`PDFGeometry`) basado en ingeniería inversa de las funciones matemáticas internas de PDF++:

1. Carga el texto de la página correspondiente utilizando la API interna de PDF.js (`window.pdfjsLib`).
2. Mapea los índices de caracteres y líneas almacenados en el fragment a los contenedores de glifos y rectángulos de texto devueltos por el motor de PDF.js.
3. Convierte y fusiona esos rectángulos en coordenadas físicas PDF en el sistema de coordenadas estándar (origen en la esquina inferior izquierda).
4. Genera la estructura de diccionario bajo la especificación PDF (`PDFDict` / `/Subtype /Highlight` / `/QuadPoints` / `/Rect`) e inyecta la anotación en la página con `pdf-lib`.

### 3. Tratamiento de "Dummy PDFs" (PDFs Remotos)

#### El Desafío:
PDF++ permite crear "Dummy PDFs": archivos locales con extensión `.pdf` que en realidad contienen texto plano con una URL externa (`https://...`). Esto evita llenar la bóveda con archivos pesados. Sin embargo, intentar leerlos o clonarlos como binarios estándar provoca errores de corrupción en el archivo.

#### La Solución:
El exportador gestiona estos archivos de forma transparente mediante una estrategia en 3 niveles:

1. **Detección de cabecera**: Al leer un PDF, analiza los primeros bytes. Si no comienza por `%PDF-` y contiene una URL `http(s)://`, activa el modo remoto.
2. **Caché en disco (Integración con Fork de PDF++)**: Revisa si el archivo ya fue descargado por la extensión de PDF++ buscando su hash SHA-256 en la carpeta local `.obsidian/plugins/pdf-plus/dummy-cache/HASH.pdf`. Si existe, lo lee directamente del disco.
3. **Descarga en memoria y Caché RAM**: Si no está en disco, realiza una petición de red con `requestUrl` de Obsidian (evitando problemas de CORS). El binario resultante se guarda en una caché en memoria RAM (`pdfBufferCache`) durante la sesión de exportación para asegurar que el archivo solo se descargue una vez aunque se use tanto en la fase de geometría (`pdfjsLib`) como en la de escritura (`pdf-lib`).
4. **Protección contra desvinculación (Detached ArrayBuffers)**: Al entregar el buffer de memoria a la librería de renderizado, se entrega siempre una copia desvinculada (`buffer.slice(0)`), evitando errores de transferencia de memoria en los Web Workers de PDF.js.

---

## 📜 Licencia

MIT License.
