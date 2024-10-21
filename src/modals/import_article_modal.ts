import { Modal, Notice } from "obsidian";
import MediumImporterPlugin from "../main";
import { createNewNote } from "../utils/vault";
import {
    articleInfoToProperties,
    getArticleInfo,
    getArticleMarkdownFromId,
} from "../utils/medium";
import { initTextInputModal } from "src/utils/modal";

export default class ImportMediumArticleModal extends Modal {
    plugin: MediumImporterPlugin;

    constructor(plugin: MediumImporterPlugin) {
        super(plugin.app);
        this.plugin = plugin;
    }

    onOpen() {
        const { contentEl } = this;
        const { input, submitButton } = initTextInputModal(this, {
            title: "Import Medium Article",
            subtitle: [
                "Enter the URL of the Medium article you want to import.",
                "Should be in the format https://medium.com/[published-in]/[title-of-the-article]-[id]",
            ],
            inputPlaceholder: "Medium article URL",
        });

        submitButton.addEventListener("click", async () => {
            try {
                contentEl.empty();
                contentEl
                    .createDiv({ cls: "loading-wrapper" })
                    .createSpan({ cls: "loading" });

                if (!this.plugin.settings.rapidAPIKey) {
                    new Notice(
                        "[Medium Importer] Please enter your API key with the command 'Set API key'",
                    );
                    return;
                }

                const id = input.value.split("-").pop();
                if (!id) {
                    new Notice(
                        "[Medium Importer] Invalid URL. Please enter a valid Medium article URL.",
                    );
                    return;
                }

                const markdown = await getArticleMarkdownFromId(
                    id,
                    this.plugin.settings.rapidAPIKey,
                );
                const articleInfo = await getArticleInfo(
                    id,
                    this.plugin.settings.rapidAPIKey,
                );

                if (!markdown) {
                    return;
                }

                const title = articleInfo.title;
                const properties = articleInfoToProperties(articleInfo);
                const content = `${properties}\n${markdown}`;
                await createNewNote(this.plugin, title, content);
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
