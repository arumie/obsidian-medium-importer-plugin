import {
    App,
    Notice,
    PluginSettingTab,
    Setting,
    TextComponent,
} from "obsidian";
import MediumImporterPlugin from "./main";
import { MediumAuthorInfo } from "./utils/medium";

export interface MediumImporterSettings {
    rapidAPIKey?: string;
    folder: string;
    authors: {
        [key: string]: {
            articles: string[];
            authorInfo: MediumAuthorInfo;
            syncOnBoot?: boolean;
        };
    };
}

export const DEFAULT_SETTINGS: MediumImporterSettings = {
    folder: "Medium",
    authors: {},
};

export default class MediumImporterSettingsTab extends PluginSettingTab {
    plugin: MediumImporterPlugin;

    constructor(app: App, plugin: MediumImporterPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        let apiInput: TextComponent | null = null;
        new Setting(containerEl)
            .setName("RapidAPI key")
            .setDesc(
                "Create an account at https://rapidapi.com/ to get an API key. Click '✓' to save.",
            )
            .addText((text) => {
                text.setPlaceholder("API key");
                apiInput = text;
            })
            .addExtraButton((button) =>
                button
                    .setIcon("checkmark")
                    .setTooltip("Set API key")
                    .onClick(async () => {
                        if (apiInput == null) return;
                        this.plugin.settings.rapidAPIKey = apiInput.getValue();
                        apiInput.setValue("");
                        await this.plugin.saveSettings();
                        new Notice("API key set successfully");
                    }),
            );
        new Setting(containerEl)
            .setName("Folder")
            .setDesc("Folder to store imported Medium articles.")
            .addText((text) =>
                text
                    .setPlaceholder("Folder name")
                    .setValue(this.plugin.settings.folder)
                    .onChange(async (value) => {
                        this.plugin.settings.folder = value;
                        await this.plugin.saveSettings();
                    }),
            );
        const authors = Object.values(this.plugin.settings.authors);
        console.log(authors);
        if (authors.length > 0) {
            new Setting(containerEl)
                .setHeading()
                .setName("Authors")
                .setDesc(
                    "Choose whether to sync author on startup or delete author.",
                );
            for (const author of authors) {
                new Setting(containerEl)
                    .setName(author.authorInfo.fullname)
                    .setDesc(author.authorInfo.bio)
                    .addToggle((toggle) =>
                        toggle.setValue(false).onChange(async (value) => {
                            author.syncOnBoot = value;
                            await this.plugin.saveSettings();
                        }),
                    )
                    .addExtraButton((button) =>
                        button
                            .setIcon("trash")
                            .setTooltip("Remove author")
                            .onClick(async () => {
                                delete this.plugin.settings.authors[
                                    author.authorInfo.id
                                ];
                                await this.plugin.saveSettings();
                                new Notice("Author removed successfully");
                                this.display();
                            }),
                    );
            }
        }
    }
}
