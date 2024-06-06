import { Modal, Notice, normalizePath, request } from "obsidian";
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

        const result = await request({
            url,
            method: "GET",
            headers: {
                "x-rapidapi-key": apiKey,
                "x-rapidapi-host": "medium2.p.rapidapi.com",
            },
        });
        const markdown = JSON.parse(result).markdown;
        return markdown;
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

                const markdown = await this.getArticleMarkdownFromId(
                    id,
                    this.plugin.settings.rapidAPIKey,
                );
                console.log(markdown);
                if (!markdown) {
                    return;
                }

                const title = markdown.split("#")[1].split("\n")[0];
                const content = markdown;
                await this.createNewNote(title, content);
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
