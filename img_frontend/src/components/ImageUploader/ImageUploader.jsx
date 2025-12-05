import React, { useRef, useState } from 'react'
import './ImageUploader.css' // We'll create this CSS file

const ImageUploader = ({ onImageUpload, isLoading = false }) => {
  const fileInputRef = useRef(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    processFile(file)
  }

  const processFile = (file) => {
    if (!file) return

    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPEG, PNG, WebP, etc.)')
      return
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Please select an image smaller than 10MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target.result)
    }
    reader.readAsDataURL(file)
    
    onImageUpload(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragActive(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragActive(false)
  }

  const handleUploadClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click()
    }
  }

  const handleRemoveImage = (event) => {
    event.stopPropagation()
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReplaceImage = (event) => {
    event.stopPropagation()
    fileInputRef.current?.click()
  }

  return (
    <div className="image-uploader">
      <div 
        className={`upload-area ${isDragActive ? 'drag-active' : ''} ${previewUrl ? 'has-preview' : ''} ${isLoading ? 'loading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleUploadClick}
      >
        {isLoading && (
          <div className="upload-loading">
            <div className="loading-spinner"></div>
            <p>Processing image...</p>
          </div>
        )}

        {!isLoading && previewUrl ? (
          <div className="preview-container">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="image-preview"
            />
            <div className="preview-overlay">
              <div className="preview-actions">
                <button 
                  className="preview-btn replace-btn"
                  onClick={handleReplaceImage}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 2v6h-6"/>
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                    <path d="M3 22v-6h6"/>
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                  </svg>
                  Replace
                </button>
                <button 
                  className="preview-btn remove-btn"
                  onClick={handleRemoveImage}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <div className="upload-text">
              <h3>Upload Image</h3>
              <p>Click or drag an image here to upload</p>
              <small>Supports JPG, PNG, WebP • Max 10MB</small>
            </div>
            <button className="upload-button">
              Choose File
            </button>
          </div>
        )}

        {isDragActive && (
          <div className="drag-overlay">
            <div className="drag-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p>Drop image here</p>
            </div>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default ImageUploader