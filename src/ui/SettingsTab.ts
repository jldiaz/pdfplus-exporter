import { App, PluginSettingTab, Setting } from 'obsidian';
import type PDFPlusExporterPlugin from '../main';
import { t } from '../i18n';

export interface PDFPlusExporterSettings {
    defaultAnnotationColor: string;
    removeCallouts: boolean;
    removeBullets: boolean;
    authorName: string;
    replacementText: string;
    highlightAlpha: number;
    embedCommentInHighlight: boolean;
    exportStickyNotes: boolean;
    aliasMaxLength: number;
    lastOutputPdfName: string;
}

export const DEFAULT_SETTINGS: PDFPlusExporterSettings = {
    defaultAnnotationColor: 'default',
    removeCallouts: true,
    removeBullets: true,
    authorName: 'User',
    replacementText: '[...]',
    highlightAlpha: 0.3,
    embedCommentInHighlight: true,
    exportStickyNotes: true,
    aliasMaxLength: 0,
    lastOutputPdfName: '',
}

export class PDFPlusExporterSettingTab extends PluginSettingTab {
    plugin: PDFPlusExporterPlugin;

    constructor(app: App, plugin: PDFPlusExporterPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();
        new Setting(containerEl).setName(t('settings_header')).setHeading();

        new Setting(containerEl)
            .setName(t('setting_default_color'))
            .setDesc(t('setting_default_color_desc'))
            .addText(text => text
                .setPlaceholder('default')
                .setValue(this.plugin.settings.defaultAnnotationColor)
                .onChange(async (value) => {
                    this.plugin.settings.defaultAnnotationColor = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('setting_author_name'))
            .setDesc(t('setting_author_name_desc'))
            .addText(text => text
                .setPlaceholder('User')
                .setValue(this.plugin.settings.authorName)
                .onChange(async (value) => {
                    this.plugin.settings.authorName = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('setting_replacement_text'))
            .setDesc(t('setting_replacement_text_desc'))
            .addText(text => text
                .setPlaceholder('[...]')
                .setValue(this.plugin.settings.replacementText)
                .onChange(async (value) => {
                    this.plugin.settings.replacementText = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('setting_alias_max_length'))
            .setDesc(t('setting_alias_max_length_desc'))
            .addText(text => text
                .setPlaceholder('0')
                .setValue(this.plugin.settings.aliasMaxLength.toString())
                .onChange(async (value) => {
                    const parsed = parseInt(value);
                    if (!isNaN(parsed)) {
                        this.plugin.settings.aliasMaxLength = parsed;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl)
            .setName(t('setting_highlight_alpha'))
            .setDesc(t('setting_highlight_alpha_desc'))
            .addSlider(slider => slider
                .setLimits(0.1, 1.0, 0.1)
                .setValue(this.plugin.settings.highlightAlpha)
                .onChange(async (value) => {
                    this.plugin.settings.highlightAlpha = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('setting_remove_callouts'))
            .setDesc(t('setting_remove_callouts_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.removeCallouts)
                .onChange(async (value) => {
                    this.plugin.settings.removeCallouts = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('setting_remove_bullets'))
            .setDesc(t('setting_remove_bullets_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.removeBullets)
                .onChange(async (value) => {
                    this.plugin.settings.removeBullets = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('setting_embed_comment_in_highlight'))
            .setDesc(t('setting_embed_comment_in_highlight_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.embedCommentInHighlight)
                .onChange(async (value) => {
                    this.plugin.settings.embedCommentInHighlight = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('setting_export_sticky_notes'))
            .setDesc(t('setting_export_sticky_notes_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.exportStickyNotes)
                .onChange(async (value) => {
                    this.plugin.settings.exportStickyNotes = value;
                    await this.plugin.saveSettings();
                }));
    }
}
