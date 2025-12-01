import React, { useState, useRef } from 'react';
import './FileUploadPopup.css';

const FileUploadPopup = ({ isOpen, onClose, onFileSelect, site }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a preview URL for the selected file
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current.click();
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelect(selectedFile, site);
      onClose();
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <h3>Upload Image for Site {site}</h3>
          <button className="close-button" onClick={handleCancel}>×</button>
        </div>
        
        <div className="popup-content">
          {!previewUrl ? (
            <div className="upload-options">
              <div className="upload-option" onClick={handleUploadClick}>
                <div className="option-icon">📁</div>
                <div className="option-label">Upload File</div>
              </div>
              <div className="upload-option" onClick={handleCameraClick}>
                <div className="option-icon">📷</div>
                <div className="option-label">Take Photo</div>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="preview-container">
              <img src={previewUrl} alt="Preview" className="image-preview" />
              <div className="file-info">
                <p>{selectedFile.name}</p>
                <p>{Math.round(selectedFile.size / 1024)} KB</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="popup-footer">
          {previewUrl && (
            <>
              <button className="cancel-button" onClick={handleCancel}>Cancel</button>
              <button className="confirm-button" onClick={handleConfirm}>Confirm</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadPopup;
