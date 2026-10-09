// Down-levels a packaged asset folder (default dist/) in place so it runs on old kiosk
// players (Chrome 53). Called by build-asset.ps1 after the runtime files are copied.
//   1. Babel-transpiles js/, dependencies/ (except *.min.js) and sw.js.
//   2. Bundles the core-js polyfills Chrome 53 is missing into dependencies/polyfills.js.
//   3. Injects that polyfill script ahead of every other script in index.html.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformAsync } from '@babel/core';
import presetEnv from '@babel/preset-env';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const coreJsCompat = require('core-js-compat');

const TARGET = 'chrome 53';
const outDir = path.resolve(process.argv[2] || 'dist');
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function listJs(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...await listJs(full));
        } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.min.js')) {
            files.push(full);
        }
    }
    return files;
}

async function transpileFile(file) {
    const source = await readFile(file, 'utf8');
    const result = await transformAsync(source, {
        filename: file,
        configFile: false,
        babelrc: false,
        // Most files are classic <script>s; devConfigPanel.js is an ES module.
        sourceType: 'unambiguous',
        presets: [[presetEnv, { targets: TARGET, modules: false }]]
    });
    await writeFile(file, result.code);
}

async function buildPolyfills() {
    const { list } = coreJsCompat({ targets: TARGET, modules: ['core-js/stable'] });
    const entry = list.map(m => `import "core-js/modules/${m}.js";`).join('\n');
    const outfile = path.join(outDir, 'dependencies', 'polyfills.js');
    await build({
        stdin: { contents: entry, resolveDir: projectRoot, loader: 'js' },
        bundle: true,
        format: 'iife',
        minify: true,
        target: 'chrome53',
        outfile,
        logLevel: 'warning'
    });
    return list.length;
}

async function injectPolyfillTag() {
    const indexPath = path.join(outDir, 'index.html');
    const html = await readFile(indexPath, 'utf8');
    if (html.includes('dependencies/polyfills.js')) return;
    const tag = '<script type="text/javascript" src="dependencies/polyfills.js"></script>\n    ';
    const firstScript = html.indexOf('<script');
    if (firstScript === -1) throw new Error('No <script> tag found in ' + indexPath);
    await writeFile(indexPath, html.slice(0, firstScript) + tag + html.slice(firstScript));
}

const files = [
    ...await listJs(path.join(outDir, 'js')),
    ...await listJs(path.join(outDir, 'dependencies')),
    path.join(outDir, 'sw.js')
];
for (const file of files) {
    await transpileFile(file);
}
const polyfillCount = await buildPolyfills();
await injectPolyfillTag();

console.log(`Transpiled ${files.length} files for ${TARGET}; bundled ${polyfillCount} core-js polyfills.`);
