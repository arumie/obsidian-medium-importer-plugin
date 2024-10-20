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
