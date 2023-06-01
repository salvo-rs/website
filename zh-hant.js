import { glob } from 'glob';
import fs from "fs-extra";

import OpenCC from 'opencc';
const converter = new OpenCC('s2t.json');

let files = await glob('src/zh-hans/**/*.*', {});
for (let i = 0, il = files.length; i < il; i++) {
    let file = files[i];
    console.log(file);
    let hans = fs.readFileSync(file, 'utf-8');
    converter.convertPromise(hans).then((hant) => {
        console.log(hant);
        let target_path = file.replace('src/zh-hans/', 'src/zh-hant/');
        fs.outputFileSync(target_path, hant);
    });
}