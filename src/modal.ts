import { Modal, Notice, normalizePath } from "obsidian";
import MediumImporterPlugin from "./main";

export default class ImportMediumArticleModal extends Modal {
    plugin: MediumImporterPlugin;

    constructor(plugin: MediumImporterPlugin) {
        super(plugin.app);
        this.plugin = plugin;
    }

    async createNewNote(title: string, content: string) {
        const { vault, workspace } = this.plugin.app;

        let fileName = title;
        fileName = fileName
            .replace(/\*/g, "")
            .replace(/"/g, "")
            .replace(/\\/g, "")
            .replace(/\//g, "")
            .replace(/</g, "")
            .replace(/>/g, "")
            .replace(/:/g, " -")
            .replace(/\|/g, "")
            .replace(/\?/g, "");
        new Notice(`Creating note with title: ${fileName}`);
        try {
            const file = await vault.create(
                normalizePath(`${fileName}.md`),
                content,
            );
            const leaf = workspace.getLeaf(true);
            await leaf.openFile(file);
        } catch (error) {
            new Notice(`[Medium Importer] Error: ${error}`);
        }
    }

    async getArticleMarkdownFromId(
        id: string,
        apiKey: string,
    ): Promise<string | undefined> {
        const url = `https://medium2.p.rapidapi.com/article/${id}/markdown`;
        const options = {
            method: "GET",
            headers: {
                "x-rapidapi-key": apiKey,
                "x-rapidapi-host": "medium2.p.rapidapi.com",
            },
        };

        try {
            const response = await fetch(url, options);
            const result = await response.text();
            const markdown = JSON.parse(result).markdown;
            return markdown;
        } catch (error) {
            new Notice(`[Medium Importer] Error: ${error}`);
            return undefined;
        }
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: "Import Medium article" });
        contentEl.createEl("p", {
            cls: "mi-subtitle",
            text: "Enter the URL of the Medium article you want to import.",
        });

        contentEl.createEl("p", {
            cls: "mi-subtitle",
            text: "Should be in the format https://medium.com/[published-in]/[title-of-the-article]-[id]",
        });

        const input = contentEl.createEl("input", {
            cls: "mi-input",
            type: "text",
            placeholder: "Medium article URL",
        });

        const button = contentEl.createEl("button", {
            cls: "mi-submit",
            text: "Submit",
        });

        button.addEventListener("click", async () => {
            new Notice("Importing article...");
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

            const markdown = await this.getArticleMarkdownFromId(
                id,
                this.plugin.settings.rapidAPIKey,
            );

            if (!markdown) {
                return;
            }

            const title = markdown.split("\n")[0].replace("# ", "");
            const content = markdown.split("\n").slice(1).join("\n");
            await this.createNewNote(title, content);

            this.close();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}