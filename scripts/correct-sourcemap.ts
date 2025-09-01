import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '../es/assets');
for (const file of fs.readdirSync(root)) {
  if (file.endsWith('.js')) {
    const full = path.join(root, file);
    const code = fs.readFileSync(full, 'utf8');
    if (fs.existsSync(full + '.map')) {
      if (code.includes(`//# sourceMappingURL=${file}`) && !code.includes(`//# sourceMappingURL=${file}.map`)) {
        fs.writeFileSync(
          full,
          code.replace(`//# sourceMappingURL=${file}`, `//# sourceMappingURL=${file}.map`),
          'utf8'
        );
      }
    }
  }
}
