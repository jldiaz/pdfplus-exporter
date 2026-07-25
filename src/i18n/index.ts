import { moment } from 'obsidian';

export const en = {
    'plugin_not_installed': 'PDF++ Exporter: The PDF++ plugin is not installed or enabled. It is required for this to work.',
    'version_warning': '⚠️ PDF++ Exporter: You are using PDF++ version {version}. This exporter was designed for version 0.40.31, so there might be incompatibilities.',
    'export_command_name': 'Export PDF++ annotations',
    'settings_header': 'PDF++ Exporter Settings',
    'setting_default_color': 'Default color',
    'setting_default_color_desc': 'Color to use if the PDF++ annotation does not specify one (e.g., default, red, blue)',
    'setting_author_name': 'Author name',
    'setting_author_name_desc': 'Name to use in the PDF annotations (tooltips)',
    'setting_remove_callouts': 'Remove callout formatting',
    'setting_remove_callouts_desc': 'If enabled, the ">" prefix from blockquotes and callouts will be removed in the exported comment.',
    'setting_remove_bullets': 'Remove bullets',
    'setting_remove_bullets_desc': 'If enabled, the "- " or "* " prefix from list items will be removed.',
    'setting_replacement_text': 'Link Replacement Text',
    'setting_replacement_text_desc': 'The text that will replace the markdown link in the exported PDF context.',
    'setting_alias_max_length': 'Max Alias Length',
    'setting_alias_max_length_desc': 'If an alias is longer than this, it will be replaced by the replacement text. Set to 0 to always replace aliases.',
    'setting_highlight_alpha': 'Highlight Opacity (Alpha)',
    'setting_highlight_alpha_desc': 'The opacity of the colored highlights in the exported PDF (0.1 to 1.0).',
    'setting_embed_comment_in_highlight': 'Embed Comment inside Highlight/Square',
    'setting_embed_comment_in_highlight_desc': 'Embed the comment directly into the highlight or rectangular selection annotation.',
    'setting_export_sticky_notes': 'Add Sticky Notes in Margin',
    'setting_export_sticky_notes_desc': 'Creates a sticky note icon (post-it) in the margin next to the selection for maximum compatibility across PDF viewers (like macOS Preview).',
    'modal_title': 'Export PDF++ Annotations',
    'modal_pdf_source': 'Source PDF',
    'modal_pdf_source_desc': 'Name or path of the original PDF (e.g., attention-paper.pdf)',
    'modal_pdf_dest': 'Destination PDF',
    'modal_pdf_dest_desc': 'Name of the PDF that will be generated',
    'default_output_pdf_name': 'exported.pdf',
    'modal_source_glob': 'Source Files (Glob)',
    'modal_source_glob_desc': 'Filter which Markdown files to extract annotations from (e.g. *public*). Leave empty for all.',
    'modal_colors': 'Color Filter',
    'modal_colors_desc': 'Colors to export separated by comma (leave empty for all)',
    'modal_tags': 'Tag Filter',
    'modal_tags_desc': 'Specific tag required (e.g., #important, leave empty to ignore)',
    'modal_export_btn': 'Export',
    'export_starting': 'Starting export of {pdf}...',
    'export_no_refs': 'No references found for that PDF.',
    'export_no_matches': 'No annotations match the current filters.',
    'export_success': 'PDF exported successfully as {pdf}!',
    'export_error': 'An error occurred during export: {error}',
    'cannot_export_missing': 'Cannot export because PDF++ is not installed or enabled.',
};

export const es = {
    'plugin_not_installed': 'PDF++ Exporter: El plugin PDF++ no está instalado o activado. Es necesario para que esto funcione.',
    'version_warning': '⚠️ PDF++ Exporter: Estás usando la versión {version} de PDF++. El exportador fue diseñado para la 0.40.31, por lo que podría haber incompatibilidades.',
    'export_command_name': 'Exportar anotaciones de PDF++',
    'settings_header': 'Opciones de PDF++ Exporter',
    'setting_default_color': 'Color por defecto',
    'setting_default_color_desc': 'Color a usar si la anotación de PDF++ no especifica uno (ej: default, red, blue)',
    'setting_author_name': 'Nombre del autor',
    'setting_author_name_desc': 'Nombre a usar en las anotaciones PDF (tooltips)',
    'setting_remove_callouts': 'Eliminar formato de callouts',
    'setting_remove_callouts_desc': 'Si está activado, se eliminará el prefijo "> " de las citas y callouts en el comentario exportado.',
    'setting_remove_bullets': 'Eliminar viñetas',
    'setting_remove_bullets_desc': 'Si está activado, se eliminará el prefijo "- " o "* " de los elementos de lista.',
    'setting_replacement_text': 'Texto de Reemplazo',
    'setting_replacement_text_desc': 'El texto o símbolo que sustituirá al enlace en el contexto del PDF exportado (ej: [...]).',
    'setting_alias_max_length': 'Longitud máxima de alias',
    'setting_alias_max_length_desc': 'Si un alias supera esta longitud de caracteres, será sustituido por el texto de reemplazo. Ponlo a 0 para sustituir siempre los alias.',
    'setting_highlight_alpha': 'Opacidad del Subrayado (Alpha)',
    'setting_highlight_alpha_desc': 'La transparencia del color de resaltado en el PDF exportado (0.1 a 1.0).',
    'setting_embed_comment_in_highlight': 'Incrustar comentario en la zona resaltada',
    'setting_embed_comment_in_highlight_desc': 'Incrustar el texto del comentario dentro del propio resaltado o recuadro.',
    'setting_export_sticky_notes': 'Añadir nota flotante en el margen (pósit)',
    'setting_export_sticky_notes_desc': 'Crea un icono de nota flotante junto al resaltado para asegurar la visibilidad del comentario en todos los visores de PDF (como Vista Previa de macOS).',
    'modal_title': 'Exportar Anotaciones de PDF++',
    'modal_pdf_source': 'PDF Origen',
    'modal_pdf_source_desc': 'Nombre o ruta del PDF original (ej: attention-paper.pdf)',
    'modal_pdf_dest': 'PDF Destino',
    'modal_pdf_dest_desc': 'Nombre del PDF que se generará',
    'default_output_pdf_name': 'salida.pdf',
    'modal_source_glob': 'Filtro de Ficheros (Glob)',
    'modal_source_glob_desc': 'Filtra de qué ficheros Markdown extraer las anotaciones (ej. *public*). Déjalo vacío para usar todos.',
    'modal_colors': 'Filtro de Colores',
    'modal_colors_desc': 'Colores a exportar separados por coma (vacío para todos)',
    'modal_tags': 'Filtro de Etiquetas',
    'modal_tags_desc': 'Etiqueta específica requerida (ej: #importante, vacío para ignorar)',
    'modal_export_btn': 'Exportar',
    'export_starting': 'Iniciando exportación de {pdf}...',
    'export_no_refs': 'No se encontraron referencias a ese PDF.',
    'export_no_matches': 'No hay anotaciones que cumplan los filtros.',
    'export_success': 'PDF exportado correctamente como {pdf}!',
    'export_error': 'Ocurrió un error al exportar: {error}',
    'cannot_export_missing': 'No se puede exportar porque PDF++ no está instalado o activado.',
};

const localeMap: { [k: string]: Partial<typeof en> } = {
    en,
    es,
};

export function t(strId: keyof typeof en, params?: Record<string, string>): string {
    const locale = (window.localStorage.getItem('language') || moment.locale() || 'en') as string;
    const baseLocale = (locale.split('-')[0]) as string;
    const lang = localeMap[locale] || localeMap[baseLocale] || en;
    
    let result = (lang[strId] || en[strId] || strId) as string;
    
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            result = result.replace(`{${key}}`, value);
        }
    }
    
    return result;
}
