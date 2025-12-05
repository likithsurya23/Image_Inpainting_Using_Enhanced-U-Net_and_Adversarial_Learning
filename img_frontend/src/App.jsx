import React, { useState } from 'react'
import ImageUploader from './components/ImageUploader/ImageUploader'
import MaskCanvas from './components/MaskCanvas/MaskCanvas'
import ResultViewer from './components/ResultViewer/ResultViewer'
import IterationControls from './components/IterationControls/IterationControls'
import HistorySidebar from './components/HistorySidebar/HistorySidebar'
import { inpaintImage } from './api/inpaintApi'
import './styles/App.css'

function App() {
  const [originalImage, setOriginalImage] = useState(null)
  const [maskData, setMaskData] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [history, setHistory] = useState([])
  const [iterations, setIterations] = useState(2)
  const [currentStep, setCurrentStep] = useState(1) // 1: Upload, 2: Mask, 3: Process, 4: Result

  const handleImageUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target.result)
      setResultImage(null)
      setMaskData(null)
      setCurrentStep(2) // Move to mask step
    }
    reader.readAsDataURL(file)
  }

  const handleMaskChange = (mask) => {
    setMaskData(mask)
    if (mask && !resultImage) {
      setCurrentStep(3) // Ready to process
    }
  }

  const handleInpaint = async () => {
    if (!originalImage || !maskData) {
      alert('Please upload an image and draw a mask first')
      return
    }

    setIsProcessing(true)
    setCurrentStep(4) // Move to processing/result step
    try {
      const response = await inpaintImage(originalImage, maskData, iterations)
      setResultImage(response.result_image)
      setJobId(response.job_id)
      
      // Add to history
      const historyItem = {
        id: response.job_id || Date.now(),
        original: originalImage,
        result: response.result_image,
        mask: maskData,
        timestamp: new Date().toISOString(),
        iterations: iterations
      }
      
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]) // Keep last 10 items
    } catch (error) {
      console.error('Inpainting failed:', error)
      alert('Inpainting failed. Please try again.')
      setCurrentStep(3) // Go back to ready state
    } finally {
      setIsProcessing(false)
    }
  }

  const handleIterationChange = (newIterations) => {
    setIterations(newIterations)
  }

  const handleHistorySelect = (historyItem) => {
    setOriginalImage(historyItem.original)
    setResultImage(historyItem.result)
    setMaskData(historyItem.mask)
    setIterations(historyItem.iterations || 2)
    setCurrentStep(4) // Show result view
  }

  const handleNewImage = () => {
    setOriginalImage(null)
    setMaskData(null)
    setResultImage(null)
    setCurrentStep(1)
  }

  const handleEditMask = () => {
    setCurrentStep(2)
  }

  const getStepStatus = (step) => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) return 'active'
    return 'pending'
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>AI IMAGE INPAINTING</h1>
          <p>Remove unwanted objects from your images with AI magic</p>
        </div>
        
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${getStepStatus(1)}`}>
            <div className="step-number">1</div>
            <span className="step-label">Upload Image</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${getStepStatus(2)}`}>
            <div className="step-number">2</div>
            <span className="step-label">Draw Mask</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${getStepStatus(3)}`}>
            <div className="step-number">3</div>
            <span className="step-label">Configure</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${getStepStatus(4)}`}>
            <div className="step-number">4</div>
            <span className="step-label">View Result</span>
          </div>
        </div>
      </header>

      <div className="app-content">
        <HistorySidebar 
          history={history}
          onSelect={handleHistorySelect}
          selectedId={jobId}
        />
        
        <main className="main-workspace">
          {/* Step 1: Image Upload */}
          {currentStep === 1 && (
            <div className="step-content upload-step">
              <div className="step-header">
                <h2>Upload Your Image</h2>
                <p>Start by uploading the image you want to edit</p>
              </div>
              <ImageUploader 
                onImageUpload={handleImageUpload}
                isLoading={isProcessing}
              />
              <div className="step-guidance">
                <h4>📝 How it works:</h4>
                <ol>
                  <li>Upload a JPG or PNG image (max 10MB)</li>
                  <li>Draw over objects you want to remove</li>
                  <li>AI will intelligently fill in the missing areas</li>
                  <li>Download your perfected image</li>
                </ol>
              </div>
            </div>
          )}

          {/* Step 2: Mask Drawing */}
          {currentStep === 2 && originalImage && (
            <div className="step-content mask-step">
              <div className="step-header">
                <h2>Mark Areas to Remove</h2>
                <p>Draw over the objects you want to remove from the image</p>
              </div>
  
              <div className="canvas-container">
                <MaskCanvas
                  originalImage={originalImage}
                  onMaskChange={handleMaskChange}
                  disabled={isProcessing}
                  isLoading={isProcessing}
                />
              </div>

              <div className="step-actions">
                <button 
                  onClick={handleNewImage}
                  className="action-button secondary"
                >
                  ← Upload New Image
                </button>
                <button 
                  onClick={() => setCurrentStep(3)}
                  disabled={!maskData}
                  className="action-button primary"
                >
                  Continue to Settings →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Configuration */}
          {currentStep === 3 && originalImage && maskData && (
            <div className="step-content config-step">
              <div className="step-header">
                <h2>Configure Processing</h2>
                <p>Adjust settings for optimal results</p>
              </div>

              <div className="config-section">
                <IterationControls 
                  iterations={iterations}
                  onIterationChange={handleIterationChange}
                  isLoading={isProcessing}
                />

                <div className="preview-section">
                  <h4>Preview</h4>
                  <div className="preview-images">
                    <div className="preview-item">
                      <img src={originalImage} alt="Original" />
                      <span>Original Image</span>
                    </div>
                    <div className="preview-arrow">→</div>
                    <div className="preview-item">
                      <div className="mask-preview">
                        <img src={originalImage} alt="With mask" />
                        <div 
                          className="mask-overlay"
                          style={{ 
                            backgroundImage: `url(${maskData})`,
                            mixBlendMode: 'multiply'
                          }}
                        />
                      </div>
                      <span>Areas to Remove</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="step-actions">
                <button 
                  onClick={() => setCurrentStep(2)}
                  className="action-button secondary"
                >
                  ← Edit Mask
                </button>
                <button 
                  onClick={handleInpaint}
                  disabled={isProcessing}
                  className="action-button primary large"
                >
                  🎨 Start Inpainting
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 4 && (
            <div className="step-content result-step">
              <div className="step-header">
                <h2>Inpainting Result</h2>
                <p>
                  {isProcessing 
                    ? 'AI is processing your image...' 
                    : 'Your image has been processed successfully!'
                  }
                </p>
              </div>

              <div className="result-section">
                <ResultViewer 
                  resultImage={resultImage}
                  isLoading={isProcessing}
                  originalImage={originalImage}
                  processingTime={isProcessing ? null : 5.2} // You can get this from your API response
                />
              </div>

              {!isProcessing && resultImage && (
                <div className="result-actions">
                  <button 
                    onClick={handleEditMask}
                    className="action-button secondary"
                  >
                    ✏️ Edit Mask
                  </button>
                  <button 
                    onClick={handleNewImage}
                    className="action-button primary"
                  >
                    🆕 New Image
                  </button>
                  <button 
                    onClick={() => setCurrentStep(3)}
                    className="action-button tertiary"
                  >
                    ⚙️ Change Settings
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App