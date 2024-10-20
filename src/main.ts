import { Plugin } from "obsidian";
import ImportMediumArticleModal from "./modals/import_article_modal";
import MediumImporterSettingsTab, {
    DEFAULT_SETTINGS,
    MediumImporterSettings,
} from "./settings";
import AddMediumAuthorModal from "./modals/add_author_modal";
import SyncMediumAuthorModal from "./modals/sync_author_modal";

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

        this.addCommand({
            id: "add-medium-author",
            name: "Add Medium author",
            callback: () => {
                new AddMediumAuthorModal(this).open();
            },
        });
        this.addCommand({
            id: "sync-medium-author",
            name: "Sync Medium author",
            callback: () => {
                new SyncMediumAuthorModal(this).open();
            },
        });

        this.addSettingTab(new MediumImporterSettingsTab(this.app, this));
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
