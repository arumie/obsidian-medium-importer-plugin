import { Modal, Notice } from "obsidian";
import { syncAuthor } from "src/utils/author";
import { initDropdownModal } from "src/utils/modal";
import MediumImporterPlugin from "../main";

export default class SyncMediumAuthorModal extends Modal {
    plugin: MediumImporterPlugin;

    constructor(plugin: MediumImporterPlugin) {
        super(plugin.app);
        this.plugin = plugin;
    }

    onOpen() {
        const { contentEl } = this;
        const { authors } = this.plugin.settings;
        const authorOptions = Object.entries(authors).map(([_, author]) => ({
            id: author.authorInfo.id,
            displayName: author.authorInfo.fullname,
        }));

        if (authorOptions.length === 0) {
            new Notice(
                "[Medium Importer] No authors found. Please add an author first.",
            );
            this.close();
            return;
        }

        const { select, submitButton } = initDropdownModal(this, {
            title: "Sync Medium Author",
            subtitle: [
                "Pick the author you want to sync with your Obsidian vault.",
                "You can find the username from the user's/author's profile page URL. (https://medium.com/@[user-name])",
            ],
            options: authorOptions,
        });

        submitButton.addEventListener("click", async () => {
            try {
                contentEl.empty();
                contentEl
                    .createDiv({ cls: "loading-wrapper" })
                    .createSpan({ cls: "loading" });

                if (!this.plugin.settings.rapidAPIKey) {
                    new Notice(
                        "[Medium Importer] Please enter your API key in the settings.",
                    );
                    return;
                }
                const selectedAuthor = Object.entries(authors).find(
                    ([_, author]) => author.authorInfo.id === select.value,
                )?.[1];
                if (!selectedAuthor) {
                    new Notice(
                        "[Medium Importer] Author not found. Please add an author first.",
                    );
                    this.close();
                    return;
                }
                syncAuthor(this.plugin, selectedAuthor);
            } catch (error) {
                new Notice(`[Medium Importer] Unexpected Error: ${error}`);
            }

            this.close();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
