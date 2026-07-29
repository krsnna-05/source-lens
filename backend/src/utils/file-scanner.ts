import { promises as fs } from "fs";
import path from "path";

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "coverage",
  "vendor",
  "target",
  "bin",
  "obj",
  ".venv",
  "venv",
  "__pycache__",
  ".pytest_cache",
  ".tox",
  ".eggs",
  "*.egg-info",
  ".gradle",
  ".maven",
  ".cargo",
  ".idea",
  ".vscode",
]);

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".md",
  ".json",
  ".yml",
  ".yaml",
  ".toml",
]);

const IGNORED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".pdf",
  ".zip",
  ".gz",
  ".mp4",
  ".mp3",
  ".exe",
  ".dll",
  ".so",
  ".bin",
  ".o",
  ".a",
  ".lib",
  ".pyc",
  ".pyo",
  ".class",
  ".jar",
  ".war",
  ".tar",
  ".rar",
  ".7z",
]);

function shouldIgnoreDir(dirName: string): boolean {
  return IGNORED_DIRS.has(dirName) || dirName.startsWith(".");
}

function shouldIncludeFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();

  if (IGNORED_EXTENSIONS.has(ext)) {
    return false;
  }

  if (SOURCE_EXTENSIONS.has(ext)) {
    return true;
  }

  // Check if it's a special file we want to keep
  const fileName = path.basename(filePath).toLowerCase();
  const specialFiles = [
    "readme",
    "dockerfile",
    "makefile",
    "gitignore",
    "editorconfig",
    "prettierrc",
    "eslintrc",
    "tsconfig",
    "webpack",
    "vite",
    "rollup",
  ];

  return specialFiles.some((special) => fileName.startsWith(special));
}

export async function scanDirectory(
  dirPath: string,
  maxDepth: number = 10,
): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentPath: string, depth: number) {
    if (depth > maxDepth) {
      return;
    }

    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        if (shouldIgnoreDir(entry.name)) {
          continue;
        }

        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          await walk(fullPath, depth + 1);
        } else if (entry.isFile() && shouldIncludeFile(fullPath)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Failed to read directory ${currentPath}:`, error);
    }
  }

  await walk(dirPath, 0);
  return files;
}

export function getFileStats(filePath: string): {
  ext: string;
  isSourceCode: boolean;
} {
  const ext = path.extname(filePath).toLowerCase();
  const isSourceCode = SOURCE_EXTENSIONS.has(ext);

  return { ext, isSourceCode };
}
