import React from 'react'
import './HistorySidebar.css' // We'll create this CSS file

const HistorySidebar = ({ history, onSelect, selectedId }) => {
  if (history.length === 0) {
    return (
      <aside className="history-sidebar empty">
        <div className="sidebar-header">
          <h3>History</h3>
          <div className="sidebar-badge">{history.length}</div>
        </div>
        <div className="empty-history">
          <div className="empty-icon">🖼️</div>
          <p>Your inpainted images will appear here</p>
          <span className="empty-subtitle">Complete your first edit to get started</span>
        </div>
      </aside>
    )
  }

  return (
    <aside className="history-sidebar">
      <div className="sidebar-header">
        <h3>Recent Results</h3>
        <div className="sidebar-badge">{history.length}</div>
      </div>
      
      <div className="history-list">
        {history.map((item) => (
          <div 
            key={item.id} 
            className={`history-item ${selectedId === item.id ? 'selected' : ''}`}
            onClick={() => onSelect(item)}
          >
            <div className="thumbnail-container">
              <img 
                src={item.result} 
                alt="Previous result" 
                className="history-thumbnail"
                loading="lazy"
              />
              <div className="selection-indicator"></div>
            </div>
            <div className="history-info">
              <span className="history-time">
                {new Date(item.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              <span className="history-date">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="item-actions">
              <button 
                className="action-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  // Add download or other action here
                }}
                title="Download"
              >
                ⬇️
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <button 
          className="clear-history-btn"
          onClick={() => console.log('Clear history')}
        >
          Clear History
        </button>
      </div>
    </aside>
  )
}

export default HistorySidebar