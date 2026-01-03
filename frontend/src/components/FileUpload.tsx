import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onUploadSuccess: (projectId: string, analysis: any) => void;
  onUploadError: (error: string) => void;
  apiBaseUrl: string;
}

export function FileUpload({ onUploadSuccess, onUploadError, apiBaseUrl }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.zip')) {
      onUploadError('Please upload a .zip file');
      return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      onUploadError('File size must be less than 100MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('project', file);

      const response = await fetch(`${apiBaseUrl}/api/project/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      onUploadSuccess(data.projectId, data.analysis);
    } catch (error: any) {
      console.error('Upload error:', error);
      onUploadError(error.message || 'Failed to upload project');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div className="upload-status">
            <div className="spinner"></div>
            <p>Analyzing project...</p>
            <p className="upload-hint">This may take a moment</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📦</div>
            <h3>Upload Your Project</h3>
            <p>Drag and drop a .zip file here, or click to browse</p>
            <p className="upload-hint">Max file size: 100MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
