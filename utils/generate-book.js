const fse = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const DOCS_DIR = path.join(__dirname, '..', 'docs', 'zh-hans');
const OUTPUT_DIR = path.join(__dirname, '..', 'book');
const PUBLIC_DIR = path.join(__dirname, '..', 'docs', 'public');

async function generateBook() {
    console.log('Starting book generation...');

    // 1. Clean and create output directory
    console.log(`Cleaning and creating directory: ${OUTPUT_DIR}`);
    await fse.ensureDir(OUTPUT_DIR);
    await fse.emptyDir(OUTPUT_DIR);

    // 2. Copy public assets
    console.log(`Copying public assets from ${PUBLIC_DIR} to ${OUTPUT_DIR}`);
    await fse.copy(PUBLIC_DIR, path.join(OUTPUT_DIR, 'public'));

    // 3. Initialize main book file
    let bookAdocContent = `= Salvo 中文文档\n:doctype: book\n:toc: left\n:toclevels: 3\n:sectnums:\n\n`;

    // 4. Process files recursively
    const processMeta = async (dir, level) => {
        const metaPath = path.join(dir, '_meta.json');
        if (!await fse.pathExists(metaPath)) {
            return;
        }

        const meta = await fse.readJson(metaPath);

        for (const item of meta) {
            if (typeof item === 'string') {
                const mdxPath = path.join(dir, `${item}.mdx`);
                const adocFilename = `${path.relative(DOCS_DIR, dir).replace(/[\\/]/g, '-')}-${item}.adoc`;
                const adocPath = path.join(OUTPUT_DIR, adocFilename);

                if (await fse.pathExists(mdxPath)) {
                    console.log(`Converting ${mdxPath} to ${adocPath}`);
                    try {
                        execSync(`pandoc --from=markdown --to=asciidoc --output="${adocPath}" "${mdxPath}"`);
                        bookAdocContent += `include::${adocFilename}[]\n\n`;
                    } catch (error) {
                        console.error(`Error converting ${mdxPath}:`, error.message);
                    }
                }
            } else if (item.type === 'dir') {
                const subdir = path.join(dir, item.name);
                bookAdocContent += `${'='.repeat(level + 1)} ${item.label}\n\n`;
                await processMeta(subdir, level + 1);
            }
        }
    };
    
    // Process donate.mdx
    const donateMdxPath = path.join(DOCS_DIR, 'donate.mdx');
    const donateAdocFilename = 'donate.adoc';
    const donateAdocPath = path.join(OUTPUT_DIR, donateAdocFilename);
    if (await fse.pathExists(donateMdxPath)) {
        console.log(`Converting ${donateMdxPath} to ${donateAdocPath}`);
        try {
            execSync(`pandoc --from=markdown --to=asciidoc --output="${donateAdocPath}" "${donateMdxPath}"`);
        } catch (error) {
            console.error(`Error converting ${donateMdxPath}:`, error.message);
        }
    }

    // Process index.mdx
    const indexMdxPath = path.join(DOCS_DIR, 'index.mdx');
    const indexAdocFilename = 'index.adoc';
    const indexAdocPath = path.join(OUTPUT_DIR, indexAdocFilename);
    if (await fse.pathExists(indexMdxPath)) {
        console.log(`Converting ${indexMdxPath} to ${indexAdocPath}`);
        try {
            execSync(`pandoc --from=markdown --to=asciidoc --output="${indexAdocPath}" "${indexMdxPath}"`);
            bookAdocContent += `include::${indexAdocFilename}[]\n\n`;
        } catch (error) {
            console.error(`Error converting ${indexMdxPath}:`, error.message);
        }
    }

    await processMeta(path.join(DOCS_DIR, 'guide'), 1);
    
    bookAdocContent += `== 资助项目\n\n`;
    bookAdocContent += `include::${donateAdocFilename}[]\n\n`;

    // 5. Write the main book.adoc file
    const bookAdocPath = path.join(OUTPUT_DIR, 'book.adoc');
    console.log(`Writing main book file to ${bookAdocPath}`);
    await fse.writeFile(bookAdocPath, bookAdocContent);

    console.log('Book generation finished successfully!');
}

generateBook().catch(err => {
    console.error('An error occurred during book generation:', err);
    process.exit(1);
});