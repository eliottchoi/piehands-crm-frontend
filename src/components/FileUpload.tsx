import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isUploading }) => {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  const handleUpload = () => {
    if (file) {
      onFileSelect(file);
      setFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-[var(--border-radius-base)] text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)]'}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <p>{file.name}</p>
        ) : isDragActive ? (
          <p>Drop the .csv file here ...</p>
        ) : (
          <p>Drag 'n' drop a .csv file here, or click to select a file</p>
        )}
      </div>
      {file && (
        <Button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? 'Importing...' : `Import ${file.name}`}
        </Button>
      )}
    </div>
  );
};
