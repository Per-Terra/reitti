import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// In ESM, __dirname is not defined, so we create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Move up from e2e/scripts/ to Project Root
const PROJECT_ROOT = path.join(__dirname, '../../');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs/testing');
const TESTS_DIR = path.join(PROJECT_ROOT, 'e2e/tests');

const ID_PREFIXES = ['AUTH', 'PHOTO'];
const idPattern = new RegExp(`(${ID_PREFIXES.join('|')})-[0-9]+`, 'g');

function getFiles(dir, ext, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getFiles(filePath, ext, fileList);
        } else if (path.extname(file) === ext) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const mdFiles = getFiles(DOCS_DIR, '.md');
const requiredIds = new Set();
mdFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(idPattern);
    if (matches) matches.forEach(id => requiredIds.add(id));
});

const testFiles = getFiles(TESTS_DIR, '.js');
const testContent = testFiles.map(file => fs.readFileSync(file, 'utf-8')).join('\n');
const missingIds = Array.from(requiredIds).filter(id => !testContent.includes(id));

if (missingIds.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Missing test implementation for:', missingIds.join(', '));
    process.exit(1);
} else {
    console.log('\x1b[32m%s\x1b[0m', '✅ Requirement coverage verified.');
    process.exit(0);
}