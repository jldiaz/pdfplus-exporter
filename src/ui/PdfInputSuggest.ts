import { App, AbstractInputSuggest, TFile } from 'obsidian';

export class PdfInputSuggest extends AbstractInputSuggest<TFile> {
    constructor(app: App, textInputEl: HTMLInputElement, private onSelectCb: (file: TFile) => void) {
        super(app, textInputEl);
    }

    getSuggestions(query: string): TFile[] {
        if (!query) {
            return []; // Según lo pedido: si está vacío, lista vacía
        }
        const files = this.app.vault.getFiles().filter(file => file.extension === 'pdf');
        return files.filter(f => f.path.toLowerCase().includes(query.toLowerCase()));
    }

    renderSuggestion(file: TFile, el: HTMLElement): void {
        el.setText(file.path);
    }

    selectSuggestion(file: TFile, evt: MouseEvent | KeyboardEvent): void {
        this.setValue(file.path);
        this.onSelectCb(file);
        this.close();
    }
}
