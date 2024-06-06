import { Plugin } from "obsidian";
import ImportMediumArticleModal from "./modal";
import MediumImporterSettingsTab from "./settings";

interface MediumImporterSettings {
    rapidAPIKey?: string;
}

export default class MediumImporterPlugin extends Plugin {
    settings: MediumImporterSettings;

    async onload() {
        await this.loadSettings();
        this.addCommand({
            id: "import-medium-article",
            name: "Import article from Medium",
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
