# Medium Importer

This is a plugin for Obsidian (https://obsidian.md).

## What is Medium Importer?

Medium Importer is a plugin for Obsidian that allows you to import your Medium articles into your Obsidian vault. The plugin uses the [Unofficial Medium API](https://mediumapi.com/) to fetch the articles and saves them as markdown files in your vault.


A valid RapidAPI key is required to use this plugin. You can get a free key by signing up at [RapidAPI](https://rapidapi.com/).

## How to use

- Set up a RapidAPI key using the "Set RapidAPI API Key" command. 

### Manually installing the plugin

- Clone this repo into your Obsidian vault's plugins folder.
- `npm i` to install dependencies.
- `npm run build` to start compilation in watch mode.
- `npm run build:css` to build the css
- Reload Obsidian.

**Note**: The plugin saves the API key in the Obsidian vault settings. Make sure to keep your API key safe. 
- If using Git plugin. Add .gitignore with `.obsidian/plugins/medium-importer/data.json` to the vault to avoid pushing the RapidAPI API key to your repository.

## Demo

![Demo](assets/demo.gif)