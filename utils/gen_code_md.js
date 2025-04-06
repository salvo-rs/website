// 使用 Bun 的文件系统 API
const {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
  existsSync,
} = require('fs');
const path = require('path');

// 源代码目录和目标MDX目录
const SOURCE_DIR = path.join(__dirname, '..', 'codes');
const TARGET_DIR = path.join(__dirname, '..', 'codes_md');
const SALVO_CARGO_FILE = path.join(__dirname, '..', 'SalvoCargo.toml');

// 存储工作区依赖和版本的全局对象
let workspaceDependencies = {};
let workspaceVersion = '';

// 提取 Cargo.toml 文件信息的函数
function extractCargoInfo(tomlContent) {
  // 初始化结果对象
  const result = {
    edition: null,
    rustVersion: null,
    packageVersion: null,
    dependencies: [],
  };

  // 提取 workspace.package 信息
  const workspacePackageMatch = tomlContent.match(
    /\[workspace\.package\]([\s\S]*?)(?=\[\w|$)/,
  );
  if (workspacePackageMatch) {
    const packageSection = workspacePackageMatch[1];

    // 提取 edition
    const editionMatch = packageSection.match(/edition\s*=\s*"(\d+)"/);
    if (editionMatch) {
      result.edition = editionMatch[1];
    }

    // 提取 rust-version
    const rustVersionMatch = packageSection.match(
      /rust-version\s*=\s*"([^"]+)"/,
    );
    if (rustVersionMatch) {
      result.rustVersion = rustVersionMatch[1];
    }

    // 提取 package version
    const versionMatch = packageSection.match(/version\s*=\s*"([^"]+)"/);
    if (versionMatch) {
      result.packageVersion = versionMatch[1];
    }
  }

  // 提取 dependencies
  const dependenciesMatch = tomlContent.match(
    /\[workspace\.dependencies\]([\s\S]*?)(?=\[\w|$)/,
  );
  if (dependenciesMatch) {
    const depsSection = dependenciesMatch[1];
    const lines = depsSection.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 跳过空行或注释
      if (!line || line.startsWith('#')) continue;

      // 匹配依赖定义行
      const depMatch = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.+)$/);
      if (depMatch) {
        const name = depMatch[1];
        let value = depMatch[2].trim();

        // 处理多行依赖定义
        while (
          value.includes('{') &&
          !value.endsWith('}') &&
          i + 1 < lines.length
        ) {
          i++;
          value += ' ' + lines[i].trim();
        }

        // 提取版本
        let version = null;

        // 简单字符串版本: package = "1.0"
        if (value.startsWith('"') && value.endsWith('"')) {
          version = value.slice(1, -1);
        }
        // 表格形式: package = { version = "1.0", ... }
        else if (value.includes('version')) {
          const versionMatch = value.match(/version\s*=\s*"([^"]+)"/);
          if (versionMatch) {
            version = versionMatch[1];
          }
        }

        if (version) {
          result.dependencies.push({ name, version });
        }
      }
    }
  }

  return result;
}

// 解析 SalvoCargo.toml 文件
function parseSalvoCargo() {
  try {
    const content = readFileSync(SALVO_CARGO_FILE, 'utf-8');

    // 使用新的提取函数
    const cargoInfo = extractCargoInfo(content);

    // 填充工作区版本
    workspaceVersion = cargoInfo.packageVersion || '';
    if (workspaceVersion) {
      console.log(`Workspace version: ${workspaceVersion}`);
    }

    // 填充包属性
    if (cargoInfo.edition) {
      workspaceDependencies['package.edition'] = cargoInfo.edition;
    }
    if (cargoInfo.rustVersion) {
      workspaceDependencies['package.rust-version'] = cargoInfo.rustVersion;
    }

    // 填充依赖版本
    cargoInfo.dependencies.forEach((dep) => {
      workspaceDependencies[dep.name] = dep.version;
      console.log(`Found dependency: ${dep.name} = ${dep.version}`);
    });

    // 特殊处理 salvo 包，使用工作区版本
    if (workspaceVersion) {
      workspaceDependencies['salvo'] = workspaceVersion;
    }

    // 确保包属性可以作为依赖项使用
    Object.keys(workspaceDependencies)
      .filter((key) => key.startsWith('package.'))
      .forEach((key) => {
        const name = key.substring(8); // 移除'package.'前缀
        if (!workspaceDependencies[name]) {
          workspaceDependencies[name] = workspaceDependencies[key];
        }
      });

    console.log(
      `解析了 ${Object.keys(workspaceDependencies).length} 个工作区依赖和属性`,
    );
  } catch (error) {
    console.error('Error parsing SalvoCargo.toml:', error);
  }
}

// 处理 Cargo.toml 文件中的版本引用
function processCargoToml(content) {
  // 1. 替换 package属性.workspace = true 形式的引用 (例如 version.workspace = true)
  content = content.replace(
    /([a-zA-Z0-9_-]+)\.workspace\s*=\s*true/g,
    (match, packageName) => {
      // 检查是否为包属性
      if (workspaceDependencies[`package.${packageName}`]) {
        return `${packageName} = "${workspaceDependencies[`package.${packageName}`]}"`;
      }
      // 检查是否为依赖
      else if (workspaceDependencies[packageName]) {
        return `${packageName} = "${workspaceDependencies[packageName]}"`;
      }

      // 特殊处理：如果是 version，使用工作区版本
      if (packageName === 'version' && workspaceVersion) {
        return `version = "${workspaceVersion}"`;
      }

      console.log(`Warning: No workspace value found for ${packageName}`);
      return match; // 保持不变，如果未找到对应值
    },
  );

  // 2. 替换独立依赖行的 dependency.workspace = true 形式
  content = content.replace(
    /^([a-zA-Z0-9_-]+)\.workspace\s*=\s*true/gm,
    (match, dependencyName) => {
      if (workspaceDependencies[dependencyName]) {
        return `${dependencyName} = "${workspaceDependencies[dependencyName]}"`;
      }
      console.log(
        `Warning: No workspace dependency found for ${dependencyName}`,
      );
      return match;
    },
  );

  // 3. 替换 dependency = { workspace = true, ... } 形式的引用，包括 features 等其他参数
  content = content.replace(
    /([a-zA-Z0-9_-]+)\s*=\s*\{([^{}]*?)workspace\s*=\s*true([^{}]*?)\}/g,
    (match, dependencyName, before, after) => {
      const version = workspaceDependencies[dependencyName];
      if (version) {
        // 替换 workspace = true 为 version = "x.y.z"，保留其他属性如 features
        return `${dependencyName} = {${before}version = "${version}"${after}}`;
      }

      // 特殊处理：如果是 salvo，使用工作区版本
      if (dependencyName === 'salvo' && workspaceVersion) {
        return `${dependencyName} = {${before}version = "${workspaceVersion}"${after}}`;
      }

      // 特殊处理一些常见依赖
      if (dependencyName === 'tokio') {
        return `${dependencyName} = {version = "1"${after}}`;
      }
      if (dependencyName === 'tracing') {
        return `${dependencyName} = {version = "0.1"${after}}`;
      }
      if (dependencyName === 'tracing-subscriber') {
        return `${dependencyName} = {version = "0.3"${after}}`;
      }

      console.log(`Warning: No workspace version found for ${dependencyName}`);
      return match; // 如果没有找到对应的版本，保持不变
    },
  );

  // 4. 处理嵌套情况或更复杂的依赖声明
  // 这是为了捕获任何可能被上面的正则表达式遗漏的情况
  // 这个正则表达式可以匹配更深层次的嵌套结构
  content = content.replace(
    /([a-zA-Z0-9_-]+)\s*=\s*\{([^{}]*?)(\{[^{}]*?\})[^{}]*?workspace\s*=\s*true([^{}]*?)\}/g,
    (match, dependencyName, before, nested, after) => {
      const version = workspaceDependencies[dependencyName];
      if (version) {
        // 保留嵌套结构，只替换 workspace = true
        return `${dependencyName} = {${before}${nested}version = "${version}"${after}}`;
      }
      console.log(
        `Warning: No workspace version found for ${dependencyName} (complex)`,
      );
      return match;
    },
  );

  // 5. 将 version = "x.y.z" 替换为固定的 "0.1.0"，但只替换独立的版本声明
  content = content.replace(/^version\s*=\s*"[^"]+"/gm, 'version = "0.1.0"');

  // 6. 删除任何包含 publish.workspace = true 的行
  content = content.replace(/^publish\.workspace\s*=\s*true.*?\n/gm, '');

  return content;
}

// 确保目录存在
function ensureDirectoryExists(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

// 将代码文件转换为MDX格式
function convertToMdx(filePath, content) {
  // 获取相对于源目录的路径作为title
  const relativePath = path.relative(SOURCE_DIR, filePath);
  const extension = path.extname(filePath).slice(1); // 获取文件扩展名

  // 如果是 Cargo.toml 文件，处理版本引用
  if (path.basename(filePath) === 'Cargo.toml') {
    content = processCargoToml(content);
  }

  // 扩展名到语言的映射
  const languageMap = {
    rs: 'rust',
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    java: 'java',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    sh: 'bash',
    toml: 'toml',
    yaml: 'yaml',
    yml: 'yaml',
    // 可以根据需要添加更多映射
  };

  // 从映射中获取语言，如果没有则使用扩展名
  const language = languageMap[extension] || extension;

  return `\`\`\`${language}  title="${relativePath}"
${content}
\`\`\``;
}

// 递归处理目录
function processDirectory(sourceDir, targetDir) {
  ensureDirectoryExists(targetDir);

  const items = readdirSync(sourceDir);
  // 定义允许转换的文件扩展名
  const allowedExtensions = ['.js', '.html', '.rs', '.toml', '.txt'];

  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);

    const stats = statSync(sourcePath);

    if (stats.isDirectory()) {
      // 如果是目录，递归处理
      processDirectory(sourcePath, targetPath);
    } else {
      // 检查文件扩展名是否在允许列表中
      const fileExtension = path.extname(sourcePath).toLowerCase();
      if (allowedExtensions.includes(fileExtension)) {
        // 如果是允许的文件格式，转换为MDX
        const content = readFileSync(sourcePath, 'utf-8');
        const mdxContent = convertToMdx(sourcePath, content);

        // 更改扩展名为.mdx
        const mdxFilePath = path.join(
          path.dirname(targetPath),
          path.basename(targetPath, path.extname(targetPath)) + '.mdx',
        );

        ensureDirectoryExists(path.dirname(mdxFilePath));
        writeFileSync(mdxFilePath, mdxContent, 'utf-8');
        console.log(`Generated: ${mdxFilePath}`);
      } else {
        console.log(`Skipping unsupported file format: ${sourcePath}`);
      }
    }
  }
}

// 主函数
function main() {
  try {
    console.log('Starting code to MDX conversion...');
    // 首先解析 SalvoCargo.toml
    parseSalvoCargo();
    ensureDirectoryExists(TARGET_DIR);
    processDirectory(SOURCE_DIR, TARGET_DIR);
    console.log('Conversion completed successfully!');
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

// 执行主函数
main();
