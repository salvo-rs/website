import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, extname, dirname, basename } from 'node:path';

/**
 * 将 Markdown (.md) 文件转换为 MDX (.mdx) 文件
 * @param {string} folderPath 要处理的文件夹路径
 */
function convertMd2Mdx(folderPath) {
  // 检查输入目录是否存在
  if (!existsSync(folderPath) || !statSync(folderPath).isDirectory()) {
    console.error(`错误: 目录 "${folderPath}" 不存在或不是一个有效的目录`);
    return;
  }

  console.log(`开始处理目录: ${folderPath}`);
  
  // 开始递归处理文件
  const stats = {
    converted: 0,
    skipped: 0,
    errors: 0
  };
  
  processDirectoryRecursively(folderPath, stats);
  
  console.log(`转换完成! 统计信息:`);
  console.log(`- 转换文件数: ${stats.converted}`);
  console.log(`- 跳过文件数: ${stats.skipped}`);
  console.log(`- 错误文件数: ${stats.errors}`);
}

/**
 * 递归处理目录中的Markdown文件
 * @param {string} currentPath 当前处理的目录路径
 * @param {object} stats 统计信息对象
 */
function processDirectoryRecursively(currentPath, stats) {
  const items = readdirSync(currentPath);
  
  for (const item of items) {
    const itemPath = join(currentPath, item);
    const itemStat = statSync(itemPath);
    
    if (itemStat.isDirectory()) {
      // 递归处理子目录
      processDirectoryRecursively(itemPath, stats);
    } 
    else if (itemStat.isFile() && extname(item) === '.md') {
      // 转换 .md 文件
      try {
        const content = readFileSync(itemPath, 'utf8');
        
        // 创建 .mdx 文件名
        const mdxFilePath = join(dirname(itemPath), `${basename(item, '.md')}.mdx`);
        
        // 写入 .mdx 文件
        writeFileSync(mdxFilePath, content, 'utf8');
        
        // 删除原始的 .md 文件
        unlinkSync(itemPath);
        
        console.log(`已转换并删除原文件: ${itemPath} -> ${mdxFilePath}`);
        stats.converted++;
      } catch (error) {
        console.error(`转换文件 "${itemPath}" 时出错:`, error);
        stats.errors++;
      }
    } else {
      // 跳过非 .md 文件
      stats.skipped++;
    }
  }
}

/**
 * 处理命令行参数并执行转换
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('错误: 请提供要处理的目录路径');
    console.log('用法: bun md2mdx.js <目录路径>');
    return;
  }
  
  const inputDir = args[0];
  convertMd2Mdx(inputDir);
}
//bun run utils/md2mdx.js docs/zh-hans
// 执行主函数
main();
