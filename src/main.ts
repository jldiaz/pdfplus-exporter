import { Plugin } from 'obsidian';
import { PDFPlusExporterSettings, DEFAULT_SETTINGS, PDFPlusExporterSettingTab } from './ui/SettingsTab';
import { ExportModal } from './ui/ExportModal';
import { t } from './i18n';

export default class PDFPlusExporterPlugin extends Plugin {
    settings!: PDFPlusExporterSettings;

    async onload() {
        await this.loadSettings();

        // Ya no verificamos si PDF++ está instalado porque el exportador es independiente

        // Registrar el comando
        this.addCommand({
            id: 'export-pdf-annotations',
            name: t('export_command_name'),
            callback: () => {
                new ExportModal(this).open();
            }
        });

        // Añadir botón al ribbon
        this.addRibbonIcon('file-down', t('export_command_name'), (evt: MouseEvent) => {
                new ExportModal(this).open();
        });

        // Registrar pestaña de configuración
        this.addSettingTab(new PDFPlusExporterSettingTab(this.app, this));
    }

    onunload() {
        // Nada específico que limpiar por ahora
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<PDFPlusExporterSettings>);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
