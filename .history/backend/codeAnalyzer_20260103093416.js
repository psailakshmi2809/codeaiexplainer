const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { glob } = require('glob');
const ignore = require('ignore');

class CodeAnalyzer {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.files = [];
    this.dependencies = new Map();
    this.techStack = new Set();
    this.entryPoints = [];
  }

  // Main analysis method
  async analyze() {
    try {
      await this.scanFiles();
      await this.detectTechStack();
      await this.findEntryPoints();
      await this.analyzeImports();
      
      return {
        summary: this.generateSummary(),
        fileTree: this.generateFileTree(),
        techStack: Array.from(this.techStack),
        entryPoints: this.entryPoints,
        fileCount: this.files.length,
        dependencies: Object.fromEntries(this.dependencies)
      };
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }

  // Scan all files in project
  async scanFiles() {
    const ignorePatterns = this.loadIgnorePatterns();
    const ig = ignore().add(ignorePatterns);

    // Get all files recursively
    const allFiles = await glob('**/*', {
      cwd: this.projectPath,
      nodir: true,
      dot: true
    });

    // Filter ignored files
    this.files = allFiles
      .filter(file => !ig.ignores(file))
      .map(file => ({
        path: file,
        fullPath: path.join(this.projectPath, file),
        extension: path.extname(file),
        name: path.basename(file),
        size: this.getFileSize(path.join(this.projectPath, file))
      }));
  }

  // Load .gitignore patterns + defaults
  loadIgnorePatterns() {
    const defaultIgnore = [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      '.next/**',
      'coverage/**',
      '*.log',
      '.env',
      '.DS_Store',
      'package-lock.json',
      'yarn.lock'
    ];

    try {
      const gitignorePath = path.join(this.projectPath, '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf8')
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('#'));
        return [...defaultIgnore, ...gitignore];
      }
    } catch (error) {
      console.error('Error reading .gitignore:', error);
    }

    return defaultIgnore;
  }

  // Detect technology stack
  async detectTechStack() {
    // Check package.json
    const packageJsonFile = this.files.find(f => f.name === 'package.json');
    if (packageJsonFile) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonFile.fullPath, 'utf8'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };

        // Detect frameworks
        if (allDeps['react']) this.techStack.add('React');
        if (allDeps['vue']) this.techStack.add('Vue');
        if (allDeps['@angular/core']) this.techStack.add('Angular');
        if (allDeps['express']) this.techStack.add('Express');
        if (allDeps['next']) this.techStack.add('Next.js');
        if (allDeps['vite']) this.techStack.add('Vite');
        if (allDeps['typescript']) this.techStack.add('TypeScript');
        if (allDeps['mongoose'] || allDeps['mongodb']) this.techStack.add('MongoDB');
        if (allDeps['pg'] || allDeps['postgres']) this.techStack.add('PostgreSQL');
      } catch (error) {
        console.error('Error parsing package.json:', error);
      }
    }

    // Detect by file extensions
    const hasTS = this.files.some(f => f.extension === '.ts' || f.extension === '.tsx');
    const hasJSX = this.files.some(f => f.extension === '.jsx');
    const hasPy = this.files.some(f => f.extension === '.py');
    const hasGo = this.files.some(f => f.extension === '.go');

    if (hasTS && !this.techStack.has('TypeScript')) this.techStack.add('TypeScript');
    if (hasJSX || hasTS) this.techStack.add('JavaScript');
    if (hasPy) this.techStack.add('Python');
    if (hasGo) this.techStack.add('Go');
  }

  // Find entry points
  async findEntryPoints() {
    const commonEntryPoints = [
      'index.js', 'index.ts', 'main.js', 'main.ts', 'app.js', 'app.ts',
      'server.js', 'server.ts', 'index.tsx', 'main.tsx', 'App.tsx',
      'index.html'
    ];

    this.entryPoints = this.files
      .filter(f => commonEntryPoints.includes(f.name))
      .map(f => f.path);
  }

  // Analyze imports and exports
  async analyzeImports() {
    const codeFiles = this.files.filter(f => 
      ['.js', '.jsx', '.ts', '.tsx', '.mjs'].includes(f.extension)
    );

    for (const file of codeFiles.slice(0, 50)) { // Limit to 50 files for performance
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        const imports = this.extractImports(content, file.extension);
        if (imports.length > 0) {
          this.dependencies.set(file.path, imports);
        }
      } catch (error) {
        // Skip files that can't be parsed
        console.error(`Error analyzing ${file.path}:`, error.message);
      }
    }
  }

  // Extract imports using Babel parser
  extractImports(code, extension) {
    const imports = [];
    
    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
          'classProperties',
          'decorators-legacy',
          'dynamicImport',
          'exportDefaultFrom',
          'exportNamespaceFrom'
        ]
      });

      traverse(ast, {
        ImportDeclaration(path) {
          imports.push(path.node.source.value);
        },
        CallExpression(path) {
          if (path.node.callee.name === 'require') {
            const arg = path.node.arguments[0];
            if (arg && arg.type === 'StringLiteral') {
              imports.push(arg.value);
            }
          }
        }
      });
    } catch (error) {
      // If parsing fails, use simple regex as fallback
      const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
      let match;
      while ((match = importRegex.exec(code)) !== null) {
        imports.push(match[1]);
      }
    }

    return imports;
  }

  // Generate file tree structure
  generateFileTree() {
    const tree = {};

    this.files.forEach(file => {
      const parts = file.path.split(path.sep);
      let current = tree;

      parts.forEach((part, index) => {
        if (!current[part]) {
          if (index === parts.length - 1) {
            // It's a file
            current[part] = {
              type: 'file',
              extension: file.extension,
              size: file.size
            };
          } else {
            // It's a directory
            current[part] = { type: 'directory', children: {} };
          }
        }
        if (current[part].children) {
          current = current[part].children;
        }
      });
    });

    return tree;
  }

  // Generate summary
  generateSummary() {
    const filesByType = {};
    this.files.forEach(f => {
      const ext = f.extension || 'no-extension';
      filesByType[ext] = (filesByType[ext] || 0) + 1;
    });

    return {
      totalFiles: this.files.length,
      filesByType,
      techStack: Array.from(this.techStack),
      entryPoints: this.entryPoints,
      hasTests: this.files.some(f => 
        f.path.includes('test') || f.path.includes('spec')
      ),
      hasDocumentation: this.files.some(f => 
        f.name.toLowerCase() === 'readme.md' || f.extension === '.md'
      )
    };
  }

  // Get file size
  getFileSize(filePath) {
    try {
      return fs.statSync(filePath).size;
    } catch (error) {
      return 0;
    }
  }

  // Get file content by path
  getFileContent(relativePath) {
    const fullPath = path.join(this.projectPath, relativePath);
    try {
      return fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      throw new Error(`Cannot read file: ${relativePath}`);
    }
  }

  // Search files by pattern
  searchFiles(pattern) {
    const regex = new RegExp(pattern, 'i');
    return this.files.filter(f => 
      regex.test(f.path) || regex.test(f.name)
    );
  }
}

module.exports = CodeAnalyzer;
