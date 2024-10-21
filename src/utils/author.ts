import { Notice } from "obsidian";
import {
    articleInfoToProperties,
    getArticleInfo,
    getArticleMarkdownFromId,
    getAuthorInfo,
    getUserArticles,
    MediumAuthorArticles,
    MediumAuthorInfo,
} from "./medium";
import { createFolderIfNotExists, createNewNote } from "./vault";
import MediumImporterPlugin from "src/main";

export const addAuthor = async (
    plugin: MediumImporterPlugin,
    username: string,
) => {
    const { rapidAPIKey, folder, authors } = plugin.settings;

    if (rapidAPIKey == null) {
        new Notice(
            "[Medium Importer] Please enter your API key in the settings.",
        );
        return;
    }

    const authorInfo: MediumAuthorInfo = await getAuthorInfo(
        username,
        rapidAPIKey,
    );

    createFolderIfNotExists(plugin, `${folder}/${authorInfo.fullname}`);

    const articles: MediumAuthorArticles = await getUserArticles(
        authorInfo.id,
        rapidAPIKey,
    );

    new Notice(
        `[Medium Importer] Found ${articles.count} articles by ${authorInfo.fullname}`,
    );

    let author = authors[authorInfo.id];

    if (author == null) {
        author = { articles: [], authorInfo };
        plugin.settings.authors[authorInfo.id] = author;
    }

    await importMediumArticles(
        author,
        authorInfo,
        articles,
        rapidAPIKey,
        plugin,
    );

    await plugin.saveSettings();
};

export const syncAuthor = async (
    plugin: MediumImporterPlugin,
    author: { articles: string[]; authorInfo: MediumAuthorInfo },
) => {
    const { rapidAPIKey } = plugin.settings;
    const { authorInfo } = author;

    if (rapidAPIKey == null) {
        new Notice(
            "[Medium Importer] Please enter your API key in the settings.",
        );
        return;
    }

    const articles: MediumAuthorArticles = await getUserArticles(
        authorInfo.id,
        rapidAPIKey,
    );

    new Notice(
        `[Medium Importer] Synchronizing articles by ${authorInfo.fullname}`,
    );

    await importMediumArticles(
        author,
        authorInfo,
        articles,
        rapidAPIKey,
        plugin,
    );

    await plugin.saveSettings();
};

async function importMediumArticles(
    author: { articles: string[]; authorInfo: MediumAuthorInfo },
    authorInfo: MediumAuthorInfo,
    articles: MediumAuthorArticles,
    rapidAPIKey: string,
    plugin: MediumImporterPlugin,
) {
    const alreadyImportedArticles = author.articles;
    const articlesToImport = articles.associated_articles.filter(
        (articleId) => !alreadyImportedArticles.includes(articleId),
    );
    if (articlesToImport.length === 0) {
        new Notice(
            `[Medium Importer] No new articles found for ${authorInfo.fullname}`,
        );
        return;
    }

    for (const articleId of articlesToImport) {
        try {
            const markdown = await getArticleMarkdownFromId(
                articleId,
                rapidAPIKey,
            );
            const articleInfo = await getArticleInfo(articleId, rapidAPIKey);
            if (!markdown) {
                continue;
            }

            const title = articleInfo.title;
            const properties = articleInfoToProperties(articleInfo);
            const content = `${properties}\n${markdown}`;
            await createNewNote(plugin, title, content, authorInfo.fullname);
        } catch (error) {
            new Notice(
                `[Medium Importer] Unexpected Error importing article with id: ${articleId}`,
            );
        }
    }

    new Notice(
        `[Medium Importer] Imported ${articlesToImport.length} articles by ${authorInfo.fullname}`,
    );
    author.articles = author.articles.concat(articlesToImport);
    plugin.settings.authors[authorInfo.id] = author;
}
