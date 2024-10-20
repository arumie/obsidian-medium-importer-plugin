import { Modal } from "obsidian";

export const initTextInputModal = (
    modal: Modal,
    config: {
        title: string;
        subtitle: string[];
        inputPlaceholder: string;
    },
): { input: HTMLInputElement; submitButton: HTMLButtonElement } => {
    const { contentEl } = modal;
    const { title, subtitle, inputPlaceholder } = config;
    contentEl.createEl("h2", { text: title });

    for (const sub of subtitle) {
        contentEl.createEl("p", {
            cls: "mi-subtitle",
            text: sub,
        });
    }

    const input = contentEl.createEl("input", {
        cls: "mi-input",
        type: "text",
        placeholder: inputPlaceholder,
    });

    const button = contentEl.createEl("button", {
        cls: "mi-submit",
        text: "Submit",
    });

    return { input, submitButton: button };
};

export const initDropdownModal = (
    modal: Modal,
    config: {
        title: string;
        subtitle: string[];
        options: { id: string; displayName: string }[];
    },
): { select: HTMLSelectElement; submitButton: HTMLButtonElement } => {
    const { contentEl } = modal;
    const { title, subtitle, options } = config;
    contentEl.createEl("h2", { text: title });

    for (const sub of subtitle) {
        contentEl.createEl("p", {
            cls: "mi-subtitle",
            text: sub,
        });
    }

    const select = contentEl.createEl("select", {
        cls: "mi-select",
    });

    for (const option of options) {
        select.createEl("option", {
            text: option.displayName,
            value: option.id,
        });
    }

    const button = contentEl.createEl("button", {
        cls: "mi-submit",
        text: "Submit",
    });

    return { select, submitButton: button };
};
