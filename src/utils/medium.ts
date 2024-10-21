import { request } from "obsidian";

const MEDIUM_API_BASE_URL = "https://medium2.p.rapidapi.com";

export const getArticleMarkdownFromId = async (
    id: string,
    apiKey: string,
): Promise<string | undefined> => {
    const url = `/article/${id}/markdown`;

    const result = await mediumRequest(url, "GET", apiKey);
    const markdown = JSON.parse(result).markdown;
    return markdown;
};

export interface MediumArticleInfo {
    id: string;
    title: string;
    subtitle?: string;
    author?: string;
    publication_id?: string;
    published_at?: string;
    last_modified_at?: string;
    tags?: string[];
    topics?: string[];
    claps?: number;
    voters?: number;
    word_count?: number;
    responses_count?: number;
    reading_time?: number;
    url?: string;
    unique_slug?: string;
    image_url?: string;
    lang?: string;
    is_series?: boolean;
    is_locked?: boolean;
    is_shortform?: boolean;
    top_highlight?: string;
}

export const getArticleInfo = async (
    id: string,
    apiKey: string,
): Promise<MediumArticleInfo> => {
    const url = `/article/${id}`;

    const result = await mediumRequest(url, "GET", apiKey);
    return JSON.parse(result);
};

export const articleInfoToProperties = (
    articleInfo: MediumArticleInfo,
    authorInfo?: MediumAuthorInfo,
): string => {
    const tags = articleInfo.tags ? `\n- ${articleInfo.tags.join("\n- ")}` : "";
    const topics = articleInfo.topics
        ? `\n- ${articleInfo.topics.join("\n- ")}`
        : "";

    const properties =
        "---\n" +
        `id: ${articleInfo.id}\n` +
        `title: ${articleInfo.title.replace(":", "-")}\n` +
        `subtitle: ${articleInfo.subtitle?.replace(":", "-") ?? ""}\n` +
        `author: ${authorInfo?.fullname ?? articleInfo.author}\n` +
        `published: ${articleInfo.published_at}\n` +
        `modified: ${articleInfo.last_modified_at}\n` +
        `url: ${articleInfo.url}\n` +
        `word_count: ${articleInfo.word_count}\n` +
        `tags: ${tags}\n` +
        `topics: ${topics}\n` +
        "---";
    return properties;
};

export interface MediumAuthorInfo {
    id: string;
    username: string;
    fullname: string;
    bio: string;
}

export const getAuthorInfo = async (
    username: string,
    apiKey: string,
): Promise<MediumAuthorInfo> => {
    const userId = await getUserIdFromUsername(username, apiKey);
    const url = `/user/${userId}`;

    const result = await mediumRequest(url, "GET", apiKey);
    return JSON.parse(result);
};

export interface MediumAuthorArticles {
    id: string;
    associated_articles: string[];
    count: number;
}

export const getUserArticles = async (
    userId: string,
    apiKey: string,
): Promise<MediumAuthorArticles> => {
    const url = `/user/${userId}/articles`;

    const result = await mediumRequest(url, "GET", apiKey);
    return JSON.parse(result);
};

const getUserIdFromUsername = async (username: string, apiKey: string) => {
    const url = `/user/id_for/${username}`;

    const result = await mediumRequest(url, "GET", apiKey);
    return JSON.parse(result).id;
};

const mediumRequest = async (
    url: string,
    method: string,
    apiKey: string,
): Promise<string> => {
    const result = await request({
        url: `${MEDIUM_API_BASE_URL}${url}`,
        method,
        headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "medium2.p.rapidapi.com",
        },
    });
    return result;
};
