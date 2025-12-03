import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { API_BASE_URL } from './config';
import './LanguageSelection.css'; // Reusing the same CSS for consistency
import './FileUploadPopup.css'; // For image viewer styling

const PatientTypeSelection = ({ onPatientTypeSelect }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleNewPatient = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patient_questionnaire/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: [] }),
      });

      if (response.ok) {
        const data = await response.json();
        onPatientTypeSelect('new', data);
      } else {
        console.error('Failed to generate patient ID');
        // Handle error appropriately, maybe show an alert
        alert(t('submissionError'));
      }
    } catch (error) {
      console.error('Error generating patient ID:', error);
      alert(t('submissionError'));
    } finally {
      setIsLoading(false);
    }
  };

  const [showIdInput, setShowIdInput] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');

  const handleExistingPatient = () => {
    setShowIdInput(true);
  };

  const [imageViewerOpen, setImageViewerOpen] = useState(false);
const [currentImage, setCurrentImage] = useState(null);
const [patientImages, setPatientImages] = useState([]);

const handleIdSubmit = async (e) => {
    e.preventDefault();
    if (!patientIdInput.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patient_questionnaire/${patientIdInput}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched patient data:', data); // Log the data for debugging
        
        // Store images if they exist
        if (data.images && data.images.length > 0) {
          setPatientImages(data.images);
        } else {
          setPatientImages([]);
        }
        
        onPatientTypeSelect('existing', data);
      } else {
        alert(t('patientNotFound'));
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      alert(t('submissionError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get translated site name based on tag
  const getTranslatedSiteName = (tag) => {
    // Map the tag to the corresponding translation key
    const siteTranslationMap = {
      "Upper Lip": "upperLip",
      "Lower Lip": "lowerLip",
      "Left Cheeks (Inside)": "leftCheek",
      "Right Cheeks (Inside)": "rightCheek",
      "Tongue Top": "tongueTop",
      "Tongue Back": "tongueBack",
      "Left Side Tongue": "leftSideTongue",
      "Right Side Tongue": "rightSideTongue",
      "Roof of Mouth": "roofOfMouth",
      "Bottom of Mouth": "bottomOfMouth",
      "Gums": "gums",
      "Back of Throat": "backOfThroat"
    };
    
    const translationKey = siteTranslationMap[tag];
    return translationKey ? t(translationKey) : tag || 'Unknown';
  };
  
  // Function to get a color for a site tag
  const getSiteColor = (tag) => {
    // Map tags to consistent colors for visual identification
    const colorMap = {
      "Upper Lip": "#FF6B6B",
      "Lower Lip": "#FF9E7D",
      "Left Cheeks (Inside)": "#4ECDC4",
      "Right Cheeks (Inside)": "#1A535C",
      "Tongue Top": "#F7B801",
      "Tongue Back": "#F18701",
      "Left Side Tongue": "#7678ED",
      "Right Side Tongue": "#3D348B",
      "Roof of Mouth": "#E56399",
      "Bottom of Mouth": "#DE6E4B",
      "Gums": "#7AE582",
      "Back of Throat": "#6A0572"
    };
    
    return colorMap[tag] || "#3498db"; // Default color if tag not found
  };

  const fetchAndViewImage = async (imageId) => {
    setIsLoading(true);
    try {
      // Fetch the image from the API
      const response = await fetch(`${API_BASE_URL}/api/v1/image/${imageId}`);
      
      if (response.ok) {
        // Convert the response to a blob
        const imageBlob = await response.blob();
        // Create a URL for the blob
        const imageUrl = URL.createObjectURL(imageBlob);
        
        // Find the image metadata from patientImages
        const imageData = patientImages.find(img => img.id === imageId);
        
        // Set the current image with URL and metadata
        setCurrentImage({
          url: imageUrl,
          tag: imageData?.tag || 'Unknown',
          translatedTag: getTranslatedSiteName(imageData?.tag),
          note: imageData?.note || '',
          color: getSiteColor(imageData?.tag)
        });
        
        // Open the image viewer
        setImageViewerOpen(true);
      } else {
        console.error('Failed to fetch image');
        alert(t('imageLoadError'));
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      alert(t('submissionError'));
    } finally {
      setIsLoading(false);
    }
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    // Release the object URL to free memory
    if (currentImage && currentImage.url) {
      URL.revokeObjectURL(currentImage.url);
    }
    setCurrentImage(null);
  };

  // Image viewer component
  const ImageViewer = () => {
    if (!imageViewerOpen || !currentImage) return null;

    return (
      <div className="popup-overlay">
        <div className="popup-container image-viewer-container">
          <div className="popup-header" style={{ backgroundColor: currentImage.color, color: 'white' }}>
            <h3>{currentImage.translatedTag || currentImage.tag}</h3>
            <button className="close-button" onClick={closeImageViewer} style={{ color: 'white' }}>×</button>
          </div>
          <div className="popup-content">
            <div className="site-tag-banner" style={{ 
              backgroundColor: currentImage.color, 
              color: 'white',
              padding: '8px 15px',
              borderRadius: '4px',
              marginBottom: '15px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {t('oralSite')}: {currentImage.translatedTag || currentImage.tag}
            </div>
            <div className="preview-container">
              <img src={currentImage.url} alt={currentImage.translatedTag || currentImage.tag} className="image-preview" />
              {currentImage.note && (
                <div className="image-note-display">
                  <strong>{t('note')}:</strong> {currentImage.note}
                </div>
              )}
            </div>
          </div>
          <div className="popup-footer">
            <button type="button" className="cancel-button" onClick={closeImageViewer}>{t('close')}</button>
          </div>
        </div>
      </div>
    );
  };

  if (showIdInput) {
    return (
      <div className="language-selection-container">
        <h1>{isLoading ? t('fetchingDetails') : t('enterPatientId')}</h1>
        {!isLoading && (
          <form onSubmit={handleIdSubmit} className="language-buttons">
            <input
              type="text"
              value={patientIdInput}
              onChange={(e) => setPatientIdInput(e.target.value)}
              placeholder={t('patientId')}
              className="language-button"
              style={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc', cursor: 'text' }}
            />
            <button type="submit" className="language-button">
              {t('fetchDetails')}
            </button>
            <button
              type="button"
              onClick={() => setShowIdInput(false)}
              className="language-button"
              style={{ backgroundColor: '#95a5a6' }}
            >
              {t('back')}
            </button>
          </form>
        )}
        
        {/* Display patient images if available */}
        {patientImages.length > 0 && (
          <div className="patient-images-container" style={{ marginTop: '20px' }}>
            <h3>{t('patientImages')}</h3>
            <div className="image-list">
              {patientImages.map((image) => {
                const siteColor = getSiteColor(image.tag);
                const translatedSiteName = getTranslatedSiteName(image.tag);
                
                return (
                  <div 
                    key={image.id} 
                    className="image-item" 
                    onClick={() => fetchAndViewImage(image.id)}
                  >
                    <div className="image-item-header" style={{ 
                      backgroundColor: siteColor, 
                      color: 'white',
                      padding: '8px',
                      borderTopLeftRadius: '4px',
                      borderTopRightRadius: '4px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}>
                      {translatedSiteName}
                    </div>
                    <div className="image-item-content" style={{ padding: '10px' }}>
                      <div><strong>{t('oralSite')}:</strong> {translatedSiteName}</div>
                      {image.note && <div><strong>{t('note')}:</strong> {image.note}</div>}
                      <button 
                        className="language-button" 
                        style={{ marginTop: '10px', backgroundColor: siteColor, width: '100%' }}
                      >
                        {t('viewImage')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Image viewer popup */}
        <ImageViewer />
      </div>
    );
  }

  return (
    <div className="language-selection-container">
      <h1>{isLoading ? t('generatingId') : t('title')}</h1>
      {!isLoading && (
        <div className="language-buttons">
          <button onClick={handleNewPatient} className="language-button">
            {t('newPatient')}
          </button>
          <button onClick={handleExistingPatient} className="language-button">
            {t('existingPatient')}
          </button>
        </div>
      )}
      
      {/* Image viewer popup */}
      <ImageViewer />
    </div>
  );
};

export default PatientTypeSelection;
