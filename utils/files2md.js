import { readFileSync, writeFileSync, appendFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * 递归读取目录中的所有md和mdx文件，并将内容合并到一个文件
 * @param {string} folderPath 要读取的文件夹路径
 * @param {string} outputPath 输出文件路径
 */
function combineMarkdownFiles(folderPath, outputPath) {
  // 检查输入目录是否存在
  if (!existsSync(folderPath) || !statSync(folderPath).isDirectory()) {
    console.error(`错误: 目录 "${folderPath}" 不存在或不是一个有效的目录`);
    return;
  }

  // 创建或清空输出文件
  writeFileSync(outputPath, '', 'utf8');
  
  // 开始递归读取文件
  let fileCount = 0;
  readMarkdownFilesRecursively(folderPath, outputPath, folderPath, fileCount);
  
  console.log(`合并完成! 所有Markdown文件已写入到: ${outputPath}`);
}

/**
 * 递归读取目录中的Markdown文件并写入到输出文件
 * @param {string} currentPath 当前处理的目录路径
 * @param {string} outputPath 输出文件路径
 * @param {string} basePath 基础路径(用于计算相对路径)
 * @param {number} fileCount 已处理的文件计数
 * @returns {number} 处理后的文件总数
 */
function readMarkdownFilesRecursively(currentPath, outputPath, basePath, fileCount) {
  const items = readdirSync(currentPath);
  
  for (const item of items) {
    const itemPath = join(currentPath, item);
    const stats = statSync(itemPath);
    const relativePath = relative(basePath, itemPath);
    
    if (stats.isDirectory()) {
      // 写入目录分隔符
      appendFileSync(outputPath, `\n\n---${relativePath}---\n\n`, 'utf8');
      console.log(`处理目录: ${relativePath}`);
      fileCount = readMarkdownFilesRecursively(itemPath, outputPath, basePath, fileCount);
    } 
    else if (stats.isFile() && (item.endsWith('.md') || item.endsWith('.mdx'))) {
      // 处理Markdown文件
      const content = readFileSync(itemPath, 'utf8');
      appendFileSync(outputPath, `\n\n---${relativePath}---\n\n${content}`, 'utf8');
      fileCount++;
      console.log(`已处理文件: ${relativePath}`);
    }
  }
  
  return fileCount;
}

// // 如果直接运行此脚本，则处理命令行参数
// if (import.meta.main) {
//   const args = process.argv.slice(2);
//   if (args.length === 2) {
//     const [inputDir, outputFile] = args;
//     combineMarkdownFiles(inputDir, outputFile);
//   } else {
//     // 没有提供参数时，使用默认路径
//     const inputDir = './codes';  // 假设代码在codes目录
//     const outputFile = './codes_md/combined.md';  // 输出到codes_md目录
//     console.log(`使用默认参数: 输入目录=${inputDir}, 输出文件=${outputFile}`);
//     combineMarkdownFiles(inputDir, outputFile);
//   }
// }

// 直接调用函数，生成codes_md文件夹下的文件
const inputDir = 'docs/zh-hans';  // 你可以根据实际情况修改输入目录
const outputFile = './combined.md';
combineMarkdownFiles(inputDir, outputFile);
