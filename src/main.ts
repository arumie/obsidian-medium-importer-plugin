import { Notice, Plugin } from "obsidian";
import ImportMediumArticleModal from "./modal";
import MediumImporterSettingsTab from "./settings";

interface MediumImporterSettings {
    rapidAPIKey?: string;
}

export default class MediumImporterPlugin extends Plugin {
    settings: MediumImporterSettings;

    async onload() {
        await this.loadSettings();
        if (!this.settings.rapidAPIKey) {
            new Notice(
                "[Medium Importer] Please enter your API key with the command 'Set API key'",
            );
        }

        this.addCommand({
            id: "import-medium-article",
            name: "Import Medium Article",
            callback: () => {
                new ImportMediumArticleModal(this).open();
            },
        });

        this.addSettingTab(new MediumImporterSettingsTab(this.app, this));
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign({}, {}, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
