import React from 'react'
import './IterationControls.css'

const IterationControls = ({ iterations, onIterationChange, isLoading = false }) => {
  const handleIterationChange = (value) => {
    const newValue = Math.max(1, Math.min(5, value)) // Limit between 1-5
    onIterationChange(newValue)
  }

  const increment = () => {
    if (!isLoading) {
      handleIterationChange(iterations + 1)
    }
  }

  const decrement = () => {
    if (!isLoading) {
      handleIterationChange(iterations - 1)
    }
  }

  const getIterationLabel = (count) => {
    const labels = {
      1: "Quick",
      2: "Balanced", 
      3: "Detailed",
      4: "Enhanced",
      5: "Ultra"
    }
    return labels[count] || "Custom"
  }

  const getIterationDescription = (count) => {
    const descriptions = {
      1: "Fastest processing, basic refinement",
      2: "Good balance of speed and quality",
      3: "Recommended for most cases",
      4: "Higher quality, slower processing",
      5: "Maximum quality, slowest processing"
    }
    return descriptions[count]
  }

  return (
    <div className={`iteration-controls ${isLoading ? 'disabled' : ''}`}>
      <div className="controls-header">
        <div className="header-content">
          <h3 className="controls-title">
            Refinement Level
          </h3>
          <p>Adjust AI processing intensity</p>
        </div>
        <div className="iteration-badge">
          {iterations} {iterations === 1 ? 'Iteration' : 'Iterations'}
        </div>
      </div>

      <div className="slider-container">
        <button 
          className="control-btn decrement"
          onClick={decrement}
          disabled={iterations <= 1 || isLoading}
          aria-label="Decrease iterations"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        <div className="slider-wrapper">
          <input
            type="range"
            min="1"
            max="5"
            value={iterations}
            onChange={(e) => handleIterationChange(parseInt(e.target.value))}
            className="iteration-slider"
            disabled={isLoading}
            aria-label="Refinement iterations"
          />
          
          <div className="slider-labels">
            {[1, 2, 3, 4, 5].map((value) => (
              <div 
                key={value}
                className={`slider-label ${value <= iterations ? 'active' : ''}`}
                onClick={() => handleIterationChange(value)}
              >
                <span className="label-dot"></span>
                <span className="label-text">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          className="control-btn increment"
          onClick={increment}
          disabled={iterations >= 5 || isLoading}
          aria-label="Increase iterations"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <div className="iteration-info">
        <div className="quality-level">
          <span className="level-name">{getIterationLabel(iterations)}</span>
          <div className="quality-bars">
            {[1, 2, 3, 4, 5].map((level) => (
              <div 
                key={level}
                className={`quality-bar ${level <= iterations ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
        
        <p className="iteration-description">
          {getIterationDescription(iterations)}
        </p>

        <div className="performance-indicator">
          <div className="performance-metric">
            <span className="metric-label">Quality:</span>
            <div className="metric-bar">
              <div 
                className="metric-fill quality-fill"
                style={{ width: `${(iterations / 5) * 100}%` }}
              />
            </div>
            <span className="metric-value">{Math.round((iterations / 5) * 100)}%</span>
          </div>
          <div className="performance-metric">
            <span className="metric-label">Speed:</span>
            <div className="metric-bar">
              <div 
                className="metric-fill speed-fill"
                style={{ width: `${((6 - iterations) / 5) * 100}%` }}
              />
            </div>
            <span className="metric-value">{Math.round(((6 - iterations) / 5) * 100)}%</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="processing-notice">
          <div className="processing-spinner"></div>
          <span>Processing with {iterations} iteration{iterations > 1 ? 's' : ''}...</span>
        </div>
      )}
    </div>
  )
}

export default IterationControls