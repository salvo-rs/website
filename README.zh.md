# Salvo 网站项目

这是 Salvo 的官方文档项目，基于 [Rspress](https://rspress.dev/) 构建。

## 环境准备

本项目使用 [pnpm](https://pnpm.io/) 作为包管理器和运行时环境。在开始之前，请确保已安装 pnpm：

```bash
# 安装pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## 安装依赖

使用pnpm安装项目依赖：

```bash
pnpm install
```

## 项目结构

本项目包含以下主要目录：

- `docs`: 文档源文件目录，包含所有 Salvo 的官方文档内容
- `utils`: 实用工具脚本目录，用于辅助文档生成和维护的各种脚本
- `codes`: Salvo 库仓库中的示例代码，直接从 Salvo 主仓库复制而来

## 工具脚本说明
pnpm run utils/工具名称 运行工具
- `pnpm run utils/files2md`: 将所有mdx文件转换为成一个 md 文件（为llm生成长上下文使用）
- `pnpm run utils/translation_tool`: 翻译工具，
  1.设置环境变量 `OPENAI_API_KEY` 目前使用deepseek V3 进行翻译。
  2. 会根据翻译文件的 md5 作为注释，附加到翻译后的文档中，翻译时跳过已翻译的文档。

使用工具前请查看工具注释
使用翻译工具后请检查，页面渲染符合预期，无报错

## 开发指南

启动开发服务器：

```bash
pnpm run dev
```

构建生产版本：

```bash
pnpm run build
```

本地预览生产构建：

```bash
pnpm run preview
```

## 贡献指南

我们欢迎每一位对 Salvo 感兴趣的开发者参与文档的改进和完善。您可以通过以下方式贡献：

- 提交错误修复或文档更新
- 改进现有文档的内容和结构

提交贡献前，请确保您的更改符合项目的风格和标准。

感谢您对 Salvo 项目的支持！
