# Salvo Website

This is the official documentation project of Salvo, built on [Rspress](https://rspress.dev/).

## Environment Preparation

This project uses [pnpm](https://pnpm.io/) as the package manager and runtime environment. Before you begin, make sure pnpm is installed:

```bash
# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## Install dependencies

Use pnpm to install project dependencies:

```bash
pnpm install
```

## Project structure

This project contains the following main directories:

- `docs`: Document source file directory, containing all official Salvo documentation
- `utils`: Utility script directory, various scripts for assisting document generation and maintenance
- `codes`: Sample code in the Salvo library repository, copied directly from the Salvo main repository

## Tool script description
pnpm run utils/tool ​​name Run tool
1. Convert sample code (such as .rs files) to .mdx format
2. Replace Salvo and other third-party library dependencies in cargo.toml with specific version numbers
- `pnpm run utils/translation_tool`: Translation tool,
1. Set the environment variable `OPENAI_API_KEY` Currently using deepseek V3 for translation.
2. The md5 of the translation file will be used as a comment and attached to the translated document, and the translated document will be skipped during translation.
Please check the tool notes before using the tool

After using the translation tool, please check that the page rendering is as expected and there are no errors

## Development Guide

Start the development server:

```bash
pnpm run dev
```

Build the production version:

```bash
pnpm run build
```

Preview the production build locally:

```bash
pnpm run preview
```

## Contribution Guide

We welcome every developer interested in Salvo to participate in the improvement and improvement of the documentation. You can contribute in the following ways:

- Submit bug fixes or document updates
- Improve the content and structure of existing documents

Before submitting a contribution, please make sure your changes meet the style and standards of the project.

Thank you for your support of the Salvo project!