import { normalizePath, Notice } from "obsidian";
import MediumImporterPlugin from "../main";

export const createNewNote = async (
    plugin: MediumImporterPlugin,
    title: string,
    content: string,
    subfolder?: string,
) => {
    const { vault, workspace } = plugin.app;
    const { folder } = plugin.settings;

    createFolderIfNotExists(plugin, folder);

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
        const fileFolder = subfolder ? `${folder}/${subfolder}` : folder;
        const file = await vault.create(
            normalizePath(`${fileFolder}/${fileName}.md`),
            content,
        );
        const leaf = workspace.getLeaf(true);
        await leaf.openFile(file);
    } catch (error) {
        new Notice(`[Medium Importer] Error: ${error}`);
    }
};

export const createFolderIfNotExists = async (
    plugin: MediumImporterPlugin,
    folderName: string,
) => {
    const { vault } = plugin.app;
    const folderPath = normalizePath(folderName);
    if (!vault.getAbstractFileByPath(folderPath)) {
        new Notice(`Creating folder: ${folderName}`);
        await vault.createFolder(folderPath);
    }
};
