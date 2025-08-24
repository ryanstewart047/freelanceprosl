import React, { useState } from 'react';
import '../styles/components/FileUploader.css';

const FileUploader = ({ onUpload, label, acceptedFileTypes, maxSize = 5, id, type }) => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  
  const handleDragLeave = () => {
    setDragging(false);
  };
  
  const validateFile = (file) => {
    // Check file size (MB)
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }
    
    // Check file type
    const fileType = file.type;
    if (acceptedFileTypes && !acceptedFileTypes.includes(fileType)) {
      setError(`Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`);
      return false;
    }
    
    return true;
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setError('');
    
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };
  
  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setUploading(true);
    try {
      await onUpload(file, type);
      setFile(null);
      setError('');
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="file-uploader">
      <label className="uploader-label">{label}</label>
      
      {error && <div className="uploader-error">{error}</div>}
      
      <div 
        className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="drop-zone-content">
          <i className="fas fa-cloud-upload-alt"></i>
          <p>Drag & drop a file here or click to browse</p>
          <p className="file-limits">Max size: {maxSize}MB</p>
          {acceptedFileTypes && (
            <p className="file-types">Accepted types: {acceptedFileTypes.join(', ')}</p>
          )}
        </div>
        
        <input 
          type="file" 
          id={id} 
          onChange={handleFileChange}
          accept={acceptedFileTypes ? acceptedFileTypes.join(',') : ''}
          className="file-input"
        />
      </div>
      
      {file && (
        <div className="selected-file">
          <span className="file-name">{file.name}</span>
          <span className="file-size">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
        </div>
      )}
      
      <button 
        type="button" 
        className="upload-btn"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i> Uploading...
          </>
        ) : (
          <>
            <i className="fas fa-upload"></i> Upload {type}
          </>
        )}
      </button>
    </div>
  );
};

export default FileUploader;
