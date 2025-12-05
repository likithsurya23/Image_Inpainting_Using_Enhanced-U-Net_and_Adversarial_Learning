import React, { useRef, useEffect, useState } from 'react';
import './MaskCanvas.css';

const MaskCanvas = ({ 
  originalImage, 
  onMaskChange, 
  disabled = false, 
  isLoading = false 
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [tool, setTool] = useState('brush');
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Initialize canvas with image
  useEffect(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
      // Calculate dimensions to fit within 800x600 while maintaining aspect ratio
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ width, height });
      
      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);
    };
    
    img.onerror = () => {
      console.error('Failed to load image');
    };
    
    img.src = originalImage;
  }, [originalImage]);

  // Get mouse position relative to canvas
  const getMousePos = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  // Drawing functions
  const startDrawing = (event) => {
    if (disabled || isLoading) return;
    
    setIsDrawing(true);
    const pos = getMousePos(event);
    drawAtPosition(pos.x, pos.y);
  };

  const draw = (event) => {
    if (!isDrawing || disabled || isLoading) return;
    
    const pos = getMousePos(event);
    drawAtPosition(pos.x, pos.y);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      updateMaskData();
    }
  };

  const drawAtPosition = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    }
    
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    if (!hasDrawn) {
      setHasDrawn(true);
    }
  };

  const handleMouseMove = (event) => {
    const pos = getMousePos(event);
    setCursorPosition(pos);
    
    if (!showCursor) {
      setShowCursor(true);
    }
  };

  const handleMouseLeave = () => {
    setShowCursor(false);
    stopDrawing();
  };

  // Generate mask data from canvas
  const updateMaskData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const maskData = maskCtx.createImageData(canvas.width, canvas.height);
    
    let hasMask = false;
    
    // Convert red drawn areas to white in mask
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      
      if (r > 200 && g < 100 && b < 100) {
        // Mask area (red) -> white
        maskData.data[i] = 255;
        maskData.data[i + 1] = 255;
        maskData.data[i + 2] = 255;
        maskData.data[i + 3] = 255;
        hasMask = true;
      } else {
        // Non-mask area -> black
        maskData.data[i] = 0;
        maskData.data[i + 1] = 0;
        maskData.data[i + 2] = 0;
        maskData.data[i + 3] = 255;
      }
    }
    
    maskCtx.putImageData(maskData, 0, 0);
    const maskDataUrl = maskCanvas.toDataURL('image/png');
    onMaskChange(hasMask ? maskDataUrl : null);
  };

  // Clear the mask
  const clearMask = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (originalImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
        updateMaskData();
      };
      img.src = originalImage;
    }
  };

  // Keyboard shortcuts
  const handleKeyPress = (event) => {
    if (disabled || isLoading) return;
    
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault();
        setTool('brush');
        break;
      case 'e':
        event.preventDefault();
        setTool('eraser');
        break;
      case '[':
        event.preventDefault();
        setBrushSize(prev => Math.max(5, prev - 5));
        break;
      case ']':
        event.preventDefault();
        setBrushSize(prev => Math.min(100, prev + 5));
        break;
      default:
        break;
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [disabled, isLoading]);

  // Placeholder state when no image is uploaded
  if (!originalImage) {
    return (
      <div className="mask-canvas placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
          <h3>No Image Uploaded</h3>
          <p>Upload an image to start drawing masks</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mask-canvas ${disabled ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`}>
      {/* Header */}
      <div className="canvas-header">
        <div className="header-actions">
          <div className={`tool-indicator ${tool}`}>
            {tool === 'brush' ? '🖌️ Brush' : '🧽 Eraser'}
          </div>
          {canvasSize.width > 0 && (
            <div className="canvas-dimensions">
              {canvasSize.width} × {canvasSize.height}px
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="tool-section">
          <label className="section-label">Tools</label>
          <div className="tool-buttons">
            <button
              className={`tool-button ${tool === 'brush' ? 'active' : ''}`}
              onClick={() => setTool('brush')}
              disabled={disabled || isLoading}
              title="Brush Tool (B)"
            >
              <span className="tool-icon">🖌️</span>
              Brush
            </button>
            <button
              className={`tool-button ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
              disabled={disabled || isLoading}
              title="Eraser Tool (E)"
            >
              <span className="tool-icon">🧽</span>
              Eraser
            </button>
          </div>
        </div>

        <div className="tool-section">
          <label className="section-label">
            Brush Size: <span className="brush-size-value">{brushSize}px</span>
          </label>
          <div className="brush-controls">
            <input
              type="range"
              min="5"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              disabled={disabled || isLoading}
              className="brush-slider"
            />
            <div className="brush-preview">
              <div
                className="brush-size-display"
                style={{
                  width: `${brushSize}px`,
                  height: `${brushSize}px`,
                  backgroundColor: tool === 'brush' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                  border: tool === 'brush' ? '2px solid #ff4444' : '2px solid #666'
                }}
              />
            </div>
          </div>
        </div>

        <div className="tool-section">
          <label className="section-label">Actions</label>
          <div className="action-buttons">
            <button
              onClick={clearMask}
              disabled={disabled || isLoading || !hasDrawn}
              className="action-button clear-button"
              title="Clear entire mask"
            >
              <span className="action-icon">🗑️</span>
              Clear Mask
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="canvas-area">
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={(e) => {
              handleMouseMove(e);
              draw(e);
            }}
            onMouseUp={stopDrawing}
            onMouseLeave={handleMouseLeave}
            className="drawing-canvas"
          />
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="canvas-overlay">
              <div className="loading-spinner"></div>
              <p>Processing your mask...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaskCanvas;