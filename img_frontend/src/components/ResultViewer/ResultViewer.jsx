import React, { useState } from 'react'
import './ResultViewer.css' // We'll create this CSS file

const ResultViewer = ({ resultImage, isLoading, processingTime, originalImage }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleDownload = () => {
    if (!resultImage) return
    
    const link = document.createElement('a')
    link.href = resultImage
    link.download = `inpainted-result-${new Date().getTime()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyToClipboard = async () => {
    try {
      // Convert data URL to blob
      const response = await fetch(resultImage)
      const blob = await response.blob()
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])
      
      // Show success feedback (you could add a toast here)
      alert('Image copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy image: ', err)
      alert('Failed to copy image to clipboard')
    }
  }

  const formatProcessingTime = (seconds) => {
    if (!seconds) return null
    return `${seconds.toFixed(1)} seconds`
  }

  if (isLoading) {
    return (
      <div className="result-viewer loading">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-core"></div>
          </div>
          <div className="loading-text">
            <h3>AI is Working Its Magic</h3>
            <p>Removing objects and reconstructing your image...</p>
            <div className="loading-details">
              <div className="loading-step active">
                <span className="step-indicator"></span>
                <span>Processing image</span>
              </div>
              <div className="loading-step">
                <span className="step-indicator"></span>
                <span>Analyzing content</span>
              </div>
              <div className="loading-step">
                <span className="step-indicator"></span>
                <span>Generating result</span>
              </div>
            </div>
          </div>
        </div>
        <div className="loading-footer">
          <small>This usually takes 10-30 seconds depending on image size</small>
        </div>
      </div>
    )
  }

  if (!resultImage) {
    return (
      <div className="result-viewer placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
          <div className="placeholder-text">
            <h3>Inpainted Result</h3>
            <p>Upload an image and mark areas to remove. The AI-powered result will appear here.</p>
          </div>
          <div className="placeholder-features">
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <span>Mark objects to remove</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span>AI-powered removal</span>
            </div>
            <div className="feature">
              <span className="feature-icon">💾</span>
              <span>Download high-quality results</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="result-viewer">
      <div className="result-header">
        <h3>Inpainted Result</h3>
        <div className="result-meta">
          {processingTime && (
            <span className="processing-time">
              ⏱️ Processed in {formatProcessingTime(processingTime)}
            </span>
          )}
          {originalImage && (
            <button 
              className={`comparison-toggle ${showComparison ? 'active' : ''}`}
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? 'Hide Comparison' : 'Show Comparison'}
            </button>
          )}
        </div>
      </div>

      <div className={`image-container ${showComparison ? 'comparison-mode' : ''}`}>
        {showComparison && originalImage ? (
          <div className="comparison-view">
            <div className="comparison-item">
              <img 
                src={originalImage} 
                alt="Original" 
                className="comparison-image"
              />
              <span className="comparison-label">Original</span>
            </div>
            <div className="comparison-arrow">→</div>
            <div className="comparison-item">
              <img 
                src={resultImage} 
                alt="Result" 
                className="comparison-image"
                onLoad={handleImageLoad}
              />
              <span className="comparison-label">Result</span>
            </div>
          </div>
        ) : (
          <div className="result-image-wrapper">
            {!imageLoaded && (
              <div className="image-loading">
                <div className="loading-spinner small"></div>
              </div>
            )}
            <img 
              src={resultImage} 
              alt="Inpainted result" 
              className="result-image"
              onLoad={handleImageLoad}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          </div>
        )}
      </div>

      <div className="result-actions">
        <button 
          onClick={handleDownload}
          className="action-button primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Image
        </button>
        
        <button 
          onClick={handleCopyToClipboard}
          className="action-button secondary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy to Clipboard
        </button>

        {originalImage && (
          <button 
            onClick={() => setShowComparison(!showComparison)}
            className="action-button tertiary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            {showComparison ? 'Single View' : 'Compare'}
          </button>
        )}
      </div>

      <div className="result-quality">
        <div className="quality-indicator">
          <span className="quality-label">Result Quality:</span>
          <div className="quality-bars">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div 
                key={bar}
                className={`quality-bar ${bar <= 4 ? 'active' : ''}`}
              />
            ))}
          </div>
          <span className="quality-text">Excellent</span>
        </div>
      </div>
    </div>
  )
}

export default ResultViewer