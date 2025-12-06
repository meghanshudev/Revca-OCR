import React, { useState, useRef } from 'react';
import './FileUploadPopup.css';
import { API_BASE_URL } from './config';

const FileUploadPopup = ({ isOpen, onClose, onFileSelect, site, initialNote = '' }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [note, setNote] = useState(initialNote);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const siteToImageMap = {
    "Upper Lip": "upper_lip.png",
    "Lower Lip": "lower_lip.png",
    "Left Cheeks (Inside)": "check_inside.png",
    "Right Cheeks (Inside)": "check_inside.png",
    "Tongue Top": "tongue.png",
    "Tongue Back": "back_of_throat.png",
    "Left Side Tongue": "tongue.png",
    "Right Side Tongue": "tongue.png",
    "Roof of Mouth": "roof_of_mouth.png",
    "Bottom of Mouth": "bottom_of_mouth.png",
    "Gums": "gums.png",
    "Back of Throat": "back_of_throat.png"
  };

  const sampleImage = siteToImageMap[site];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
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

  const handleUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('tag', site);
      if (note) {
        formData.append('note', note);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/image/upload/`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          onFileSelect(result, selectedFile, site, note); // Pass back the result, local file, and note
          onClose();
        } else {
          console.error('Upload failed');
          // Optionally, show an error message to the user
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsUploading(false);
      }
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
              {sampleImage && (
                <div className="sample-image-container">
                  <img src={`/images/${sampleImage}`} alt={`Sample for ${site}`} className="sample-image" />
                  <p className="sample-image-label">Sample Image</p>
                </div>
              )}
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
              <div className="note-input-container">
                <label htmlFor="image-note">Note (optional):</label>
                <textarea
                  id="image-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this image..."
                  className="image-note-textarea"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="popup-footer">
          {previewUrl && (
            <>
              <button type="button" className="cancel-button" onClick={handleCancel} disabled={isUploading}>Cancel</button>
              <button type="button" className="confirm-button" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadPopup;
