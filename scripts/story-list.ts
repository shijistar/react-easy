import { type Dirent, promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../.storybook');
const STORIES_DIR = path.join(ROOT, 'stories');
const OUTPUT = path.join(ROOT, 'stories-list.json');
const CATEGORIES = ['components', 'hooks', 'utils'];

async function main(): Promise<void> {
  const files: string[] = [];

  for (const category of CATEGORIES) {
    const categoryDir = path.join(STORIES_DIR, category);
    let entries: Dirent[];
    try {
      entries = await fs.readdir(categoryDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const storyPath = path.join(categoryDir, entry.name, 'index.stories.tsx');
      try {
        await fs.access(storyPath);
        files.push('./' + path.relative(ROOT, storyPath).split(path.sep).join('/'));
      } catch {
        // skip missing story file
      }
    }
  }

  await fs.writeFile(OUTPUT, JSON.stringify(files, null, 2) + '\n', 'utf-8');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
