import { createHash } from 'crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync, copyFileSync } from 'fs';
import { join, relative, dirname, extname } from 'path';
import OpenAI from 'openai';

let config = {};
// if (process.env.GEMINI_API_KEY) {
//   console.log("使用 Gemini API Key 进行翻译");
//   config = {
//     apiKey: process.env.GEMINI_API_KEY,
//     baseURL: "https://api.deepseek.com/v1",
//     model: 'gemini-1.5-turbo',
//   };
// } else 
if (process.env.MOONSHOT_API_KEY) {
  console.log("使用 Moonshot API Key 进行翻译");
  config = {
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: "https://api.moonshot.cn/v1",
    model: 'kimi-k2-turbo-preview',
  };
} else if (process.env.DEEPSEEK_API_KEY) {
  console.log("使用 DeepSeek API Key 进行翻译");
  config = {
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com/v1",
    model: 'deepseek-chat',
  };
} else if (process.env.OPENAI_API_KEY) {
  console.log("使用 OpenAI API Key 进行翻译");
  config = {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.openai.com/v1",
    model: 'gpt-3.5-turbo',
  };
}
export const client = new OpenAI(config);

/**
 * 翻译文本到目标语言
 * @param {string} text 要翻译的文本
 * @param {string} targetLanguage 目标语言
 * @returns {Promise<Object>} 包含原文和翻译结果的对象
 */
async function translate(text, targetLanguage) {
  console.log(`开始翻译到 ${targetLanguage}...`);

  let translatedContent = '';

  const stream = client.chat.completions
    .stream({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '你是一位精通多语言翻译的AI助手。请提供准确、自然、符合目标语言习惯的翻译。不用回答我的问题，直接开始翻译，不要有除了翻译以外的文本生成。'
        },
        {
          role: 'user',
          content: `我在做Salvo框架技术多语言文档,请你信达雅的翻译,Translate the following text to ${targetLanguage}: ${text}`
        }
      ],
    })
    .on('content', (contentChunk) => {
      process.stdout.write(contentChunk);
      translatedContent += contentChunk;
    });

  await stream.done();
  console.log('\n翻译完成!');

  return {
    original_text: text,
    translated_text: translatedContent
  };
}

/**
 * 计算文件的MD5哈希值
 * @param {string} filePath - 文件路径
 * @returns {string} - MD5哈希值
 */
function calculateMd5(filePath) {
  const content = readFileSync(filePath, 'utf8');
  return createHash('md5').update(content).digest('hex');
}

/**
 * 从文件中提取MD5哈希值
 * @param {string} filePath - 文件路径
 * @returns {string|null} - 提取的MD5哈希值，如果不存在则返回null
 */
function extractMd5FromFile(filePath) {
  try {
    if (!existsSync(filePath)) {
      return null;
    }

    const content = readFileSync(filePath, 'utf8');
    const hashMatch = content.match(/\{\/\* Auto generated, origin file hash:(.*?)\*\/\}$/s);
    return hashMatch ? hashMatch[1].trim() : null;
  } catch (error) {
    console.error(`提取MD5时出错 (${filePath}):`, error);
    return null;
  }
}

/**
 * 将翻译内容写入目标文件，并添加源文件的MD5哈希值
 * @param {string} sourceFilePath - 源文件路径
 * @param {string} targetFilePath - 目标文件路径
 * @param {string} translatedContent - 翻译后的内容
 */
function writeTranslationWithMd5(sourceFilePath, targetFilePath, translatedContent) {
  // 确保目标文件夹存在
  const targetDir = dirname(targetFilePath);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // 计算源文件的MD5
  const md5 = calculateMd5(sourceFilePath);

  // 确保内容以换行符结束
  if (!translatedContent.endsWith('\n')) {
    translatedContent += '\n';
  }

  // 添加哈希值注释
  const contentWithHash = `${translatedContent}{/* Auto generated, origin file hash:${md5} */}`;

  // 写入目标文件
  writeFileSync(targetFilePath, contentWithHash, 'utf8');
}

/**
 * 文件翻译器 - 递归翻译文件夹中的文件
 * @param {string} sourcePath - 源文件/文件夹路径
 * @param {string} targetPath - 目标文件/文件夹路径
 * @param {string} targetLang - 目标语言
 * @param {object} options - 选项
 * @returns {Promise<object>} - 翻译统计信息
 */
async function translateFiles(sourcePath, targetPath, targetLang, options = {}) {
  const {
    fileExtensions = ['.md', '.mdx'], // 默认只翻译md和mdx文件
    verbose = true,                  // 是否输出详细日志
  } = options;

  const stats = {
    total: 0,         // 总文件数
    skipped: 0,       // 跳过的文件数（MD5匹配）
    translated: 0,    // 翻译的文件数
    copied: 0,        // 复制的文件数（非翻译文件格式）
    failed: 0         // 失败的文件数
  };

  // 递归处理文件夹
  async function processPath(currentSourcePath, currentTargetPath) {
    const isDirectory = statSync(currentSourcePath).isDirectory();

    if (isDirectory) {
      // 创建对应的目标文件夹（如果不存在）
      if (!existsSync(currentTargetPath)) {
        mkdirSync(currentTargetPath, { recursive: true });
      }

      // 递归处理文件夹中的内容
      const items = readdirSync(currentSourcePath);
      for (const item of items) {
        const nextSourcePath = join(currentSourcePath, item);
        const nextTargetPath = join(currentTargetPath, item);
        await processPath(nextSourcePath, nextTargetPath);
      }
    } else {
      // 处理文件
      const fileExt = extname(currentSourcePath).toLowerCase();
      stats.total++;

      // 检查是否包含 LLMs 路径，如果是则直接复制，不翻译
      if (currentSourcePath.includes("LLMs") || !fileExtensions.includes(fileExt)) {
        // LLMs 文件夹下的文件或不是要翻译的文件类型，直接复制
        try {
          // 确保目标文件夹存在
          const targetDir = dirname(currentTargetPath);
          if (!existsSync(targetDir)) {
            mkdirSync(targetDir, { recursive: true });
          }

          copyFileSync(currentSourcePath, currentTargetPath);
          stats.copied++;

          if (verbose) {
            if (currentSourcePath.includes("LLMs")) {
              console.log(`[复制-LLMs] ${relative(sourcePath, currentSourcePath)}`);
            } else {
              console.log(`[复制] ${relative(sourcePath, currentSourcePath)}`);
            }
          }
        } catch (error) {
          console.error(`复制文件失败 ${currentSourcePath}:`, error);
          stats.failed++;
        }
        return;
      }

      try {
        // 计算源文件的MD5
        const sourceMd5 = calculateMd5(currentSourcePath);

        // 检查目标文件是否存在以及MD5是否匹配
        const targetMd5 = extractMd5FromFile(currentTargetPath);

        if (targetMd5 === sourceMd5) {
          // MD5匹配，文件未修改，跳过翻译
          if (verbose) {
            console.log(`[跳过] ${relative(sourcePath, currentSourcePath)} (MD5匹配)`);
          }
          stats.skipped++;
          return;
        }

        // 需要翻译：要么目标文件不存在，要么MD5不匹配
        if (verbose) {
          console.log(`[翻译] ${relative(sourcePath, currentSourcePath)}`);
        }

        // 读取源文件内容
        const sourceContent = readFileSync(currentSourcePath, 'utf8');

        // 调用翻译函数
        const translationResult = await translate(sourceContent, targetLang);

        // 写入翻译结果和MD5
        writeTranslationWithMd5(
          currentSourcePath,
          currentTargetPath,
          translationResult.translated_text
        );

        stats.translated++;

      } catch (error) {
        console.error(`处理文件失败 ${currentSourcePath}:`, error);
        stats.failed++;
      }
    }
  }

  // 开始处理
  if (existsSync(sourcePath)) {
    await processPath(sourcePath, targetPath);
  } else {
    console.error(`源路径不存在: ${sourcePath}`);
  }

  return stats;
}

/**
 * 主函数 - 文件夹翻译入口
 * @param {string} sourceDir - 源文件夹路径
 * @param {string} targetDir - 目标文件夹路径
 * @param {string} targetLang - 目标语言 (如 'en', 'fr', 'ja'等)
 */
async function translateFolder(sourceDir, targetDir, targetLang) {
  console.log(`开始翻译文件夹: ${sourceDir} → ${targetDir} (目标语言: ${targetLang})`);
  console.log('--------------------------------------------------');

  const startTime = Date.now();

  // 确保目标文件夹存在
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // 执行翻译
  const stats = await translateFiles(sourceDir, targetDir, targetLang);

  // 统计信息
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('--------------------------------------------------');
  console.log(`翻译完成! 耗时: ${duration}秒`);
  console.log(`总文件数: ${stats.total}`);
  console.log(`- 已跳过 (MD5匹配): ${stats.skipped}`);
  console.log(`- 已翻译: ${stats.translated}`);
  console.log(`- 已复制 (非文档文件): ${stats.copied}`);
  console.log(`- 失败: ${stats.failed}`);
}


await translateFolder(
  'docs/zh-hans',
  'docs/ja',
  '日本語')
await translateFolder(
  'docs/zh-hans',
  'docs/zh-hant',
  '繁體中文')

await translateFolder(
  'docs/en',
  'docs/it',
  'Italiano')
// await translateFolder(
//   'docs/zh-hans',
//   'docs/en',
//   'English')
await translateFolder(
  'docs/en',
  'docs/de',
  'Deutsch')
await translateFolder(
  'docs/en',
  'docs/fr',
  'Français')
await translateFolder(
  'docs/en',
  'docs/es',
  'Español')
await translateFolder(
  'docs/en',
  'docs/pt',
  'Português')
// await translateFolder(
//   'docs/en',
//   'docs/ru',
//   'Русский')

// 法语: docs/fr
// 德语: docs/de
// 西班牙语: docs/es
// 意大利语: docs/it
// 日语: docs/ja
// 韩语: docs/ko
// 葡萄牙语: docs/pt
// 俄语: docs/ru
// 阿拉伯语: docs/ar
// 荷兰语: docs/nl
// 波兰语: docs/pl
// 土耳其语: docs/tr
// 瑞典语: docs/sv
// 芬兰语: docs/fi
// 捷克语: docs/cs
// 希腊语: docs/el
// 挪威语: docs/no
// 丹麦语: docs/da
// 匈牙利语: docs/hu
// 泰语: docs/th
// 越南语: docs/vi
// 印尼语: docs/id

