import './ProjectViewer.css';

interface ProjectViewerProps {
  projectName: string;
  analysis: any;
  onClose: () => void;
}

export function ProjectViewer({ projectName, analysis, onClose }: ProjectViewerProps) {
  const renderFileTree = (tree: any, level: number = 0): JSX.Element[] => {
    return Object.entries(tree).map(([name, node]: [string, any]) => {
      const isDirectory = node.type === 'directory';
      const indent = level * 20;

      return (
        <div key={name} style={{ marginLeft: `${indent}px` }} className="tree-item">
          <span className={isDirectory ? 'tree-folder' : 'tree-file'}>
            {isDirectory ? '📁' : '📄'} {name}
          </span>
          {isDirectory && node.children && renderFileTree(node.children, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="project-viewer">
      <div className="project-header">
        <div>
          <h2>📦 {projectName}</h2>
          <p className="project-subtitle">Project Analysis</p>
        </div>
        <button className="close-button" onClick={onClose} title="Close project">
          ✕
        </button>
      </div>

      <div className="project-content">
        {/* Summary Section */}
        <div className="project-section">
          <h3>📊 Summary</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-value">{analysis.fileCount}</div>
              <div className="summary-label">Total Files</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{analysis.techStack.length}</div>
              <div className="summary-label">Technologies</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{analysis.entryPoints.length}</div>
              <div className="summary-label">Entry Points</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                {analysis.summary.hasTests ? '✓' : '✗'}
              </div>
              <div className="summary-label">Tests</div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="project-section">
          <h3>🛠️ Tech Stack</h3>
          <div className="tech-stack">
            {analysis.techStack.map((tech: string) => (
              <span key={tech} className="tech-badge">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Entry Points */}
        {analysis.entryPoints.length > 0 && (
          <div className="project-section">
            <h3>🚀 Entry Points</h3>
            <ul className="entry-points-list">
              {analysis.entryPoints.map((entry: string) => (
                <li key={entry}>
                  <code>{entry}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* File Types */}
        <div className="project-section">
          <h3>📁 File Distribution</h3>
          <div className="file-types">
            {Object.entries(analysis.summary.filesByType).map(([ext, count]: [string, any]) => (
              <div key={ext} className="file-type-item">
                <span className="file-ext">{ext || 'no ext'}</span>
                <span className="file-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* File Tree (collapsed by default for performance) */}
        <details className="project-section">
          <summary>
            <h3 style={{ display: 'inline' }}>🗂️ File Structure</h3>
          </summary>
          <div className="file-tree">
            {renderFileTree(analysis.fileTree)}
          </div>
        </details>
      </div>
    </div>
  );
}
