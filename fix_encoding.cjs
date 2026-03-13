const fs = require('fs');
const path = require('path');

const replacements = {
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Ã\\x81': 'Á',
    'Ã\\x89': 'É',
    'Ã\\x8D': 'Í',
    'Ã\\x93': 'Ó',
    'Ã\\x9A': 'Ú',
    'Ã\\x91': 'Ñ',
    'Ã\x81': 'Á', // literal variants
    'Ã\x89': 'É',
    'Ã\x8D': 'Í',
    'Ã\x93': 'Ó',
    'Ã\x9A': 'Ú',
    'Ã\x91': 'Ñ'
};

const dirsToSearch = ['components', 'data', 'pages', 'store', 'services', 'hooks', 'types', 'app', 'docs', 'public', 'utils'];

function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                processDirectory(fullPath);
            }
        } else {
            if (fullPath.match(/\.(tsx|ts|js|jsx|json|md|html)$/)) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let modified = false;

                for (const [bad, good] of Object.entries(replacements)) {
                    if (content.includes(bad)) {
                        content = content.split(bad).join(good);
                        modified = true;
                    }
                }

                if (modified) {
                    console.log('Fixed encoding in:', fullPath);
                    fs.writeFileSync(fullPath, content, 'utf8');
                }
            }
        }
    }
}

console.log('Starting encoding fix script...');
for (const dir of dirsToSearch) {
    const targetDir = path.join(process.cwd(), dir);
    if (fs.existsSync(targetDir)) {
        processDirectory(targetDir);
    }
}
console.log('Encoding fix script complete.');
