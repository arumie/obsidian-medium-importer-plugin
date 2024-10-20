import { Modal, Notice } from "obsidian";
import { addAuthor } from "src/utils/author";
import { initTextInputModal } from "src/utils/modal";
import MediumImporterPlugin from "../main";

export default class AddMediumAuthorModal extends Modal {
    plugin: MediumImporterPlugin;

    constructor(plugin: MediumImporterPlugin) {
        super(plugin.app);
        this.plugin = plugin;
    }

    onOpen() {
        const { contentEl } = this;
        const { input, submitButton } = initTextInputModal(this, {
            title: "Add Medium Author",
            subtitle: [
                "Enter the user name of the Medium author you want to add to your library.",
                "You can find the username from the user's/author's profile page URL. (https://medium.com/@[user-name])",
            ],
            inputPlaceholder: "Username",
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
                addAuthor(this.plugin, input.value);
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
