import React, { useState, useEffect } from 'react';
import './Questionnaire.css';
import FileUploadPopup from './FileUploadPopup';
import { API_BASE_URL } from './config';
import Loader from './Loader';
import { useLanguage } from './LanguageContext';
import './FileUploadPopup.css'; // For image viewer styling

const PatientQuestionnaire = ({ initialPatientId, existingData }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState({ isOpen: false, message: '', isError: false });
  const [formData, setFormData] = useState({
    patient_identification_number: existingData?.patient_identification_number || initialPatientId || '',
    email: existingData?.email || '',
    age: existingData?.age || '',
    gender: existingData?.gender || '',
    ethnicity: existingData?.ethnicity || '',
    ethnicity_other: existingData?.other_ethnicity || '',
    education_level: existingData?.education_level || '',
    occupation: existingData?.occupation || '',
    smartphone_owner: existingData?.smartphone_owner === true ? 'yes' : (existingData?.smartphone_owner === false ? 'no' : ''),
    cancer_awareness: existingData?.cancer_awareness === true ? 'yes' : (existingData?.cancer_awareness === false ? 'no' : ''),
    family_history_oral_cancer: existingData?.family_history === true ? 'yes' : (existingData?.family_history === false ? 'no' : ''),
    smoking_status: existingData?.smoking_status || '',
    years_of_smoking: existingData?.smoking_years || '',
    packs_per_day: existingData?.packs_per_day || '',
    years_since_stopping: existingData?.years_since_stopping || '',
    alcohol_consumption: existingData?.alcohol_consumption || '',
    // Determine tobacco_chewing_status based on frequency and duration
    tobacco_chewing_status: existingData?.tobacco_chewing_frequency ? 'daily' : '',
    tobacco_chewing_times_per_day: existingData?.tobacco_chewing_frequency || '',
    tobacco_chewing_duration_years: existingData?.tobacco_chewing_duration || '',
    // Determine betel_nut_chewing_status based on frequency and duration
    betel_nut_chewing_status: existingData?.betel_nut_chewing_frequency ? 'daily' : '',
    betel_nut_chewing_times_per_day: existingData?.betel_nut_chewing_frequency || '',
    betel_nut_chewing_duration_years: existingData?.betel_nut_chewing_duration || '',
    // Determine gutkha_chewing_status based on frequency and duration
    gutkha_chewing_status: existingData?.gutkha_chewing_frequency ? 'daily' : '',
    gutkha_chewing_times_per_day: existingData?.gutkha_chewing_frequency || '',
    gutkha_chewing_duration_years: existingData?.gutkha_chewing_duration || '',
    // Determine betel_quid_chewing_status based on frequency and duration
    betel_quid_chewing_status: existingData?.betel_quid_chewing_frequency ? 'daily' : '',
    betel_quid_chewing_times_per_day: existingData?.betel_quid_chewing_frequency || '',
    betel_quid_chewing_duration_years: existingData?.betel_quid_chewing_duration || '',
    // Determine mishri_use_status based on frequency and duration
    mishri_use_status: existingData?.mishri_use_frequency ? 'daily' : '',
    mishri_use_times_per_day: existingData?.mishri_use_frequency || '',
    mishri_use_duration_years: existingData?.mishri_use_duration || '',
    symptoms_lumps: existingData?.symptoms_lumps === true ? 'yes' : (existingData?.symptoms_lumps === false ? 'no' : ''),
    symptoms_soreness: existingData?.symptoms_soreness === true ? 'yes' : (existingData?.symptoms_soreness === false ? 'no' : ''),
    symptoms_pain_swallowing: existingData?.symptoms_pain_swallowing === true ? 'yes' : (existingData?.symptoms_pain_swallowing === false ? 'no' : ''),
    symptoms_difficulty_swallowing: existingData?.symptoms_difficulty_swallowing === true ? 'yes' : (existingData?.symptoms_difficulty_swallowing === false ? 'no' : ''),
    symptoms_difficulty_moving_tongue: existingData?.symptoms_difficulty_tongue === true ? 'yes' : (existingData?.symptoms_difficulty_tongue === false ? 'no' : ''),
    symptoms_difficulty_opening_jaw: existingData?.symptoms_difficulty_jaw === true ? 'yes' : (existingData?.symptoms_difficulty_jaw === false ? 'no' : ''),
    symptoms_white_patches: existingData?.symptoms_white_patches === true ? 'yes' : (existingData?.symptoms_white_patches === false ? 'no' : ''),
    duration_of_symptoms: existingData?.symptoms_duration || '',
  });
  const [photos, setPhotos] = useState({});
  const [imageIds, setImageIds] = useState({});
  const [imageNotes, setImageNotes] = useState({});
  const [activePhotoPopup, setActivePhotoPopup] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [existingImages, setExistingImages] = useState({});
  const [loadingImageId, setLoadingImageId] = useState(null);
  
  // Process existing images when component mounts or existingData changes
  useEffect(() => {
    if (existingData && existingData.images && existingData.images.length > 0) {
      const imageMap = {};
      
      // Group images by their tag (site)
      existingData.images.forEach(image => {
        if (image.tag) {
          imageMap[image.tag] = image;
        }
      });
      
      setExistingImages(imageMap);
      
      // Pre-populate imageIds for existing images
      const ids = {};
      existingData.images.forEach(image => {
        if (image.tag) {
          ids[image.tag] = image.id;
        }
      });
      setImageIds(ids);
      
      // Pre-populate notes for existing images
      const notes = {};
      existingData.images.forEach(image => {
        if (image.tag && image.note) {
          notes[image.tag] = image.note;
        }
      });
      setImageNotes(notes);
      
      // Mark photos as existing
      const photoStatus = {};
      existingData.images.forEach(image => {
        if (image.tag) {
          photoStatus[image.tag] = true;
        }
      });
      setPhotos(photoStatus);
    }
  }, [existingData]);

  // Function to fetch and view an image
  const fetchAndViewImage = async (imageId, tag) => {
    // Set loading state for this specific image
    setLoadingImageId(imageId);
    
    try {
      // Fetch the image from the API
      const response = await fetch(`${API_BASE_URL}/api/v1/image/${imageId}`);
      
      if (response.ok) {
        // Convert the response to a blob
        const imageBlob = await response.blob();
        // Create a URL for the blob
        const imageUrl = URL.createObjectURL(imageBlob);
        
        // Set the current image with URL and metadata
        setCurrentImage({
          url: imageUrl,
          tag: tag,
          note: imageNotes[tag] || ''
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
      // Clear loading state
      setLoadingImageId(null);
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
          <div className="popup-header">
            <h3>{t(getSiteTranslationKey(currentImage.tag)) || currentImage.tag}</h3>
            <button className="close-button" onClick={closeImageViewer}>×</button>
          </div>
          <div className="popup-content">
            <div className="preview-container">
              <img src={currentImage.url} alt={currentImage.tag} className="image-preview" />
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
  
  // Helper function to get translation key for a site
  const getSiteTranslationKey = (tag) => {
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
    
    return siteTranslationMap[tag];
  };

  const handlePhotoSelect = (result, file, site, note) => {
    setImageIds(prevIds => ({
      ...prevIds,
      [site]: result.id
    }));
    setPhotos(prevPhotos => ({
      ...prevPhotos,
      [site]: true
    }));
    if (note) {
      setImageNotes(prevNotes => ({
        ...prevNotes,
        [site]: note
      }));
    }
  };

  const openPhotoPopup = (site) => {
    setActivePhotoPopup(site);
  };

  const closePhotoPopup = () => {
    setActivePhotoPopup(null);
  };

  const resetForm = () => {
    setFormData({
      patient_identification_number: existingData?.patient_identification_number || initialPatientId || '',
      email: existingData?.email || '',
      age: existingData?.age || '',
      gender: existingData?.gender || '',
      ethnicity: existingData?.ethnicity || '',
      ethnicity_other: existingData?.other_ethnicity || '',
      education_level: existingData?.education_level || '',
      occupation: existingData?.occupation || '',
      smartphone_owner: existingData?.smartphone_owner === true || existingData?.smartphone_owner === 'true' ? 'yes' : (existingData?.smartphone_owner === false || existingData?.smartphone_owner === 'false' ? 'no' : ''),
      cancer_awareness: existingData?.cancer_awareness === true || existingData?.cancer_awareness === 'true' ? 'yes' : (existingData?.cancer_awareness === false || existingData?.cancer_awareness === 'false' ? 'no' : ''),
      family_history_oral_cancer: existingData?.family_history === true || existingData?.family_history === 'true' ? 'yes' : (existingData?.family_history === false || existingData?.family_history === 'false' ? 'no' : ''),
      smoking_status: existingData?.smoking_status || '',
      years_of_smoking: existingData?.smoking_years || '',
      packs_per_day: existingData?.packs_per_day || '',
      years_since_stopping: existingData?.years_since_stopping || '',
      alcohol_consumption: existingData?.alcohol_consumption || '',
      // Determine tobacco_chewing_status based on frequency and duration
      tobacco_chewing_status: existingData?.tobacco_chewing_frequency ? 'daily' : '',
      tobacco_chewing_times_per_day: existingData?.tobacco_chewing_frequency || '',
      tobacco_chewing_duration_years: existingData?.tobacco_chewing_duration || '',
      // Determine betel_nut_chewing_status based on frequency and duration
      betel_nut_chewing_status: existingData?.betel_nut_chewing_frequency ? 'daily' : '',
      betel_nut_chewing_times_per_day: existingData?.betel_nut_chewing_frequency || '',
      betel_nut_chewing_duration_years: existingData?.betel_nut_chewing_duration || '',
      // Determine gutkha_chewing_status based on frequency and duration
      gutkha_chewing_status: existingData?.gutkha_chewing_frequency ? 'daily' : '',
      gutkha_chewing_times_per_day: existingData?.gutkha_chewing_frequency || '',
      gutkha_chewing_duration_years: existingData?.gutkha_chewing_duration || '',
      // Determine betel_quid_chewing_status based on frequency and duration
      betel_quid_chewing_status: existingData?.betel_quid_chewing_frequency ? 'daily' : '',
      betel_quid_chewing_times_per_day: existingData?.betel_quid_chewing_frequency || '',
      betel_quid_chewing_duration_years: existingData?.betel_quid_chewing_duration || '',
      // Determine mishri_use_status based on frequency and duration
      mishri_use_status: existingData?.mishri_use_frequency ? 'daily' : '',
      mishri_use_times_per_day: existingData?.mishri_use_frequency || '',
      mishri_use_duration_years: existingData?.mishri_use_duration || '',
      symptoms_lumps: existingData?.symptoms_lumps === true || existingData?.symptoms_lumps === 'true' ? 'yes' : (existingData?.symptoms_lumps === false || existingData?.symptoms_lumps === 'false' ? 'no' : ''),
      symptoms_soreness: existingData?.symptoms_soreness === true || existingData?.symptoms_soreness === 'true' ? 'yes' : (existingData?.symptoms_soreness === false || existingData?.symptoms_soreness === 'false' ? 'no' : ''),
      symptoms_pain_swallowing: existingData?.symptoms_pain_swallowing === true || existingData?.symptoms_pain_swallowing === 'true' ? 'yes' : (existingData?.symptoms_pain_swallowing === false || existingData?.symptoms_pain_swallowing === 'false' ? 'no' : ''),
      symptoms_difficulty_swallowing: existingData?.symptoms_difficulty_swallowing === true || existingData?.symptoms_difficulty_swallowing === 'true' ? 'yes' : (existingData?.symptoms_difficulty_swallowing === false || existingData?.symptoms_difficulty_swallowing === 'false' ? 'no' : ''),
      symptoms_difficulty_moving_tongue: existingData?.symptoms_difficulty_tongue === true || existingData?.symptoms_difficulty_tongue === 'true' ? 'yes' : (existingData?.symptoms_difficulty_tongue === false || existingData?.symptoms_difficulty_tongue === 'false' ? 'no' : ''),
      symptoms_difficulty_opening_jaw: existingData?.symptoms_difficulty_jaw === true || existingData?.symptoms_difficulty_jaw === 'true' ? 'yes' : (existingData?.symptoms_difficulty_jaw === false || existingData?.symptoms_difficulty_jaw === 'false' ? 'no' : ''),
      symptoms_white_patches: existingData?.symptoms_white_patches === true || existingData?.symptoms_white_patches === 'true' ? 'yes' : (existingData?.symptoms_white_patches === false || existingData?.symptoms_white_patches === 'false' ? 'no' : ''),
      duration_of_symptoms: existingData?.symptoms_duration || '',
    });
    setPhotos({});
    setImageIds({});
    setImageNotes({});
  };

  const handleNoteChange = (site, value) => {
    setImageNotes(prevNotes => ({
      ...prevNotes,
      [site]: value
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Function to fetch the latest patient data by ID
  const fetchLatestPatientData = async (patientId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patient_questionnaire/${patientId}`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch latest patient data');
        return null;
      }
    } catch (error) {
      console.error('Error fetching latest patient data:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Format images as just an array of IDs as expected by the API
    const images = Object.values(imageIds);
    
    const dataToSend = { ...formData, images };

    // Convert empty strings to null, as the backend might expect that for optional fields
    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] === '') {
        dataToSend[key] = null;
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patient_questionnaire/${existingData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        // Fetch the latest data after successful submission
        const latestData = await fetchLatestPatientData(existingData.id);
        
        if (latestData) {
          // Update the component with the latest data
          // This will trigger the useEffect that processes existing images
          setFormData({
            patient_identification_number: latestData?.patient_identification_number || initialPatientId || '',
            email: latestData?.email || '',
            age: latestData?.age || '',
            gender: latestData?.gender || '',
            ethnicity: latestData?.ethnicity || '',
            ethnicity_other: latestData?.other_ethnicity || '',
            education_level: latestData?.education_level || '',
            occupation: latestData?.occupation || '',
            smartphone_owner: latestData?.smartphone_owner === true ? 'yes' : (latestData?.smartphone_owner === false ? 'no' : ''),
            cancer_awareness: latestData?.cancer_awareness === true ? 'yes' : (latestData?.cancer_awareness === false ? 'no' : ''),
            family_history_oral_cancer: latestData?.family_history === true ? 'yes' : (latestData?.family_history === false ? 'no' : ''),
            smoking_status: latestData?.smoking_status || '',
            years_of_smoking: latestData?.smoking_years || '',
            packs_per_day: latestData?.packs_per_day || '',
            years_since_stopping: latestData?.years_since_stopping || '',
            alcohol_consumption: latestData?.alcohol_consumption || '',
            tobacco_chewing_status: latestData?.tobacco_chewing_frequency ? 'daily' : '',
            tobacco_chewing_times_per_day: latestData?.tobacco_chewing_frequency || '',
            tobacco_chewing_duration_years: latestData?.tobacco_chewing_duration || '',
            betel_nut_chewing_status: latestData?.betel_nut_chewing_frequency ? 'daily' : '',
            betel_nut_chewing_times_per_day: latestData?.betel_nut_chewing_frequency || '',
            betel_nut_chewing_duration_years: latestData?.betel_nut_chewing_duration || '',
            gutkha_chewing_status: latestData?.gutkha_chewing_frequency ? 'daily' : '',
            gutkha_chewing_times_per_day: latestData?.gutkha_chewing_frequency || '',
            gutkha_chewing_duration_years: latestData?.gutkha_chewing_duration || '',
            betel_quid_chewing_status: latestData?.betel_quid_chewing_frequency ? 'daily' : '',
            betel_quid_chewing_times_per_day: latestData?.betel_quid_chewing_frequency || '',
            betel_quid_chewing_duration_years: latestData?.betel_quid_chewing_duration || '',
            mishri_use_status: latestData?.mishri_use_frequency ? 'daily' : '',
            mishri_use_times_per_day: latestData?.mishri_use_frequency || '',
            mishri_use_duration_years: latestData?.mishri_use_duration || '',
            symptoms_lumps: latestData?.symptoms_lumps === true ? 'yes' : (latestData?.symptoms_lumps === false ? 'no' : ''),
            symptoms_soreness: latestData?.symptoms_soreness === true ? 'yes' : (latestData?.symptoms_soreness === false ? 'no' : ''),
            symptoms_pain_swallowing: latestData?.symptoms_pain_swallowing === true ? 'yes' : (latestData?.symptoms_pain_swallowing === false ? 'no' : ''),
            symptoms_difficulty_swallowing: latestData?.symptoms_difficulty_swallowing === true ? 'yes' : (latestData?.symptoms_difficulty_swallowing === false ? 'no' : ''),
            symptoms_difficulty_moving_tongue: latestData?.symptoms_difficulty_tongue === true ? 'yes' : (latestData?.symptoms_difficulty_tongue === false ? 'no' : ''),
            symptoms_difficulty_opening_jaw: latestData?.symptoms_difficulty_jaw === true ? 'yes' : (latestData?.symptoms_difficulty_jaw === false ? 'no' : ''),
            symptoms_white_patches: latestData?.symptoms_white_patches === true ? 'yes' : (latestData?.symptoms_white_patches === false ? 'no' : ''),
            duration_of_symptoms: latestData?.symptoms_duration || '',
          });
          
          // Process images from the latest data
          if (latestData.images && latestData.images.length > 0) {
            const imageMap = {};
            
            // Group images by their tag (site)
            latestData.images.forEach(image => {
              if (image.tag) {
                imageMap[image.tag] = image;
              }
            });
            
            setExistingImages(imageMap);
            
            // Pre-populate imageIds for existing images
            const ids = {};
            latestData.images.forEach(image => {
              if (image.tag) {
                ids[image.tag] = image.id;
              }
            });
            setImageIds(ids);
            
            // Pre-populate notes for existing images
            const notes = {};
            latestData.images.forEach(image => {
              if (image.tag && image.note) {
                notes[image.tag] = image.note;
              }
            });
            setImageNotes(notes);
            
            // Mark photos as existing
            const photoStatus = {};
            latestData.images.forEach(image => {
              if (image.tag) {
                photoStatus[image.tag] = true;
              }
            });
            setPhotos(photoStatus);
          }
        }
        
        setDialog({ isOpen: true, message: t('formSubmitted'), isError: false });
      } else {
        const errorData = await response.json();
        console.error('Form submission failed:', errorData);
        setDialog({ isOpen: true, message: `${t('formFailed')}: ${JSON.stringify(errorData)}`, isError: true });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setDialog({ isOpen: true, message: t('submissionError'), isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const renderOralHabit = (habitName, label) => {
    const status = formData[`${habitName}_status`];
    const timesPerDay = formData[`${habitName}_times_per_day`];
    const durationYears = formData[`${habitName}_duration_years`];

    return (
      <div className="form-group">
        <label>{label}</label>
        <div className="radio-group">
          {['daily', 'weekly', 'ex_user', 'never'].map(option => {
            let optionLabel = '';
            switch(option) {
              case 'daily': optionLabel = t('daily'); break;
              case 'weekly': optionLabel = t('weekly'); break;
              case 'ex_user': optionLabel = t('exUser'); break;
              case 'never': optionLabel = t('never'); break;
              default: optionLabel = option;
            }
            return (
              <div className="radio-option" key={option}>
                <input
                  type="radio"
                  id={`${habitName}_${option}`}
                  name={`${habitName}_status`}
                  value={option}
                  checked={status === option}
                  onChange={handleChange}
                />
                <label htmlFor={`${habitName}_${option}`}>{optionLabel}</label>
              </div>
            );
          })}
        </div>
        {(status === 'daily' || status === 'weekly' || status === 'ex_user') && (
          <div className="multi-input-group">
            {status === 'daily' && (
              <div>
                <label>{t('timesPerDay')}</label>
                <input
                  type="text"
                  name={`${habitName}_times_per_day`}
                  placeholder="e.g., 5"
                  value={timesPerDay}
                  onChange={handleChange}
                />
              </div>
            )}
            <div>
              <label>{t('durationYears')}</label>
              <input
                type="text"
                name={`${habitName}_duration_years`}
                placeholder="e.g., 10"
                value={durationYears}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDialog = () => {
    if (!dialog.isOpen) return null;

    const overlayStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    };

    const containerStyle = {
      background: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '90%',
      maxWidth: '500px'
    };

    const headerStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #eee',
      paddingBottom: '1rem',
      marginBottom: '1rem'
    };

    const headerTitleStyle = {
      margin: 0,
      fontSize: '1.5rem',
      color: dialog.isError ? '#e74c3c' : '#2ecc71'
    };

    const closeButtonStyle = {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#2c3e50'
    };

    const contentStyle = {
      marginBottom: '1.5rem'
    };

    const footerStyle = {
      display: 'flex',
      justifyContent: 'flex-end'
    };

    const confirmButtonStyle = {
      padding: '0.8rem 1.5rem',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 600
    };

    return (
      <div style={overlayStyle} className="dialog-overlay">
        <div 
          style={containerStyle} 
          className={`dialog-container ${dialog.isError ? 'error' : 'success'}`}
        >
          <div style={headerStyle} className="dialog-header">
            <h3 style={headerTitleStyle}>{dialog.isError ? t('error') : t('success')}</h3>
            <button 
              style={closeButtonStyle} 
              className="close-button" 
              onClick={() => setDialog({ isOpen: false, message: '', isError: false })}
            >
              ×
            </button>
          </div>
          <div style={contentStyle} className="dialog-content">
            <p>{dialog.message}</p>
          </div>
          <div style={footerStyle} className="dialog-footer">
            <button 
              style={confirmButtonStyle} 
              className="confirm-button" 
              onClick={() => setDialog({ isOpen: false, message: '', isError: false })}
            >
              {t('ok')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const photoSites = [
    { key: "Upper Lip", label: t('upperLip') },
    { key: "Lower Lip", label: t('lowerLip') },
    { key: "Left Cheeks (Inside)", label: t('leftCheek') },
    { key: "Right Cheeks (Inside)", label: t('rightCheek') },
    { key: "Tongue Top", label: t('tongueTop') },
    { key: "Tongue Back", label: t('tongueBack') },
    { key: "Left Side Tongue", label: t('leftSideTongue') },
    { key: "Right Side Tongue", label: t('rightSideTongue') },
    { key: "Roof of Mouth", label: t('roofOfMouth') },
    { key: "Bottom of Mouth", label: t('bottomOfMouth') },
    { key: "Gums", label: t('gums') },
    { key: "Back of Throat", label: t('backOfThroat') }
  ];

  return (
    <div className="questionnaire-container">
      {isLoading && <Loader />}
      {renderDialog()}
      <h1>{t('title')}</h1>
      <form onSubmit={handleSubmit} className="mobile-friendly-form" style={{ opacity: isLoading ? 0.7 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
        {/* Personal Information Section */}
        <div className="section-header">{t('personalInfo')}</div>
        <div className="form-group">
          <label>{t('patientId')}:</label>
          <input
            type="text"
            name="patient_identification_number"
            value={formData.patient_identification_number}
            onChange={handleChange}
            disabled={!!initialPatientId || !!existingData}
          />
        </div>
        <div className="form-group">
          <label>{t('email')}:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>{t('age')}:</label>
          <input type="text" name="age" placeholder={t('enterAge')} value={formData.age} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>{t('gender')}:</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="male" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} />
              <label htmlFor="male">{t('male')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="female" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} />
              <label htmlFor="female">{t('female')}</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>{t('ethnicity')}:</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="indian" name="ethnicity" value="indian" checked={formData.ethnicity === 'indian'} onChange={handleChange} />
              <label htmlFor="indian">{t('indian')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="other_ethnicity" name="ethnicity" value="other" checked={formData.ethnicity === 'other'} onChange={handleChange} />
              <label htmlFor="other_ethnicity">{t('other')}:</label>
              <input type="text" name="ethnicity_other" value={formData.ethnicity_other} placeholder={t('pleaseSpecify')} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>{t('educationLevel')}:</label>
          <select name="education_level" value={formData.education_level} onChange={handleChange}>
            <option value="">{t('selectEducation')}</option>
            <option value="primary">{t('primarySchool')}</option>
            <option value="middle">{t('middleSchool')}</option>
            <option value="secondary">{t('secondarySchool')}</option>
            <option value="senior">{t('seniorSecondary')}</option>
            <option value="undergraduate">{t('undergraduate')}</option>
            <option value="postgraduate">{t('postgraduate')}</option>
          </select>
        </div>
        <div className="form-group">
          <label>{t('occupation')}:</label>
          <input type="text" name="occupation" placeholder={t('enterOccupation')} value={formData.occupation} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>{t('smartphoneOwner')}</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="smartphone_yes" name="smartphone_owner" value="yes" checked={formData.smartphone_owner === 'yes'} onChange={handleChange} />
              <label htmlFor="smartphone_yes">{t('yes')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="smartphone_no" name="smartphone_owner" value="no" checked={formData.smartphone_owner === 'no'} onChange={handleChange} />
              <label htmlFor="smartphone_no">{t('no')}</label>
            </div>
          </div>
        </div>

        {/* Health Awareness Section */}
        <div className="section-header">{t('healthAwareness')}</div>
        <div className="form-group">
          <label>{t('betelNutCancer')}</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="cancer_awareness_yes" name="cancer_awareness" value="yes" checked={formData.cancer_awareness === 'yes'} onChange={handleChange} />
              <label htmlFor="cancer_awareness_yes">{t('yes')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="cancer_awareness_no" name="cancer_awareness" value="no" checked={formData.cancer_awareness === 'no'} onChange={handleChange} />
              <label htmlFor="cancer_awareness_no">{t('no')}</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>{t('familyHistory')}</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="family_history_yes" name="family_history_oral_cancer" value="yes" checked={formData.family_history_oral_cancer === 'yes'} onChange={handleChange} />
              <label htmlFor="family_history_yes">{t('yes')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="family_history_no" name="family_history_oral_cancer" value="no" checked={formData.family_history_oral_cancer === 'no'} onChange={handleChange} />
              <label htmlFor="family_history_no">{t('no')}</label>
            </div>
          </div>
        </div>

        {/* Lifestyle Habits Section */}
        <div className="section-header">{t('lifestyleHabits')}</div>
        <div className="form-group">
          <label>{t('smokingStatus')}:</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="smoker" name="smoking_status" value="smoker" checked={formData.smoking_status === 'smoker'} onChange={handleChange} />
              <label htmlFor="smoker">{t('smoker')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="ex_smoker" name="smoking_status" value="ex-smoker" checked={formData.smoking_status === 'ex-smoker'} onChange={handleChange} />
              <label htmlFor="ex_smoker">{t('exSmoker')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="never_smoked" name="smoking_status" value="never" checked={formData.smoking_status === 'never'} onChange={handleChange} />
              <label htmlFor="never_smoked">{t('neverSmoked')}</label>
            </div>
          </div>
        </div>
        {(formData.smoking_status === 'smoker' || formData.smoking_status === 'ex-smoker') && (
          <div className="form-group">
            <label>{t('ifSmoker')}</label>
            <div className="multi-input-group">
              <div>
                <label>{t('yearsSmoking')}:</label>
                <input type="text" name="years_of_smoking" placeholder="Number of years" value={formData.years_of_smoking} onChange={handleChange} />
              </div>
              <div>
                <label>{t('packsPerDay')}:</label>
                <input type="text" name="packs_per_day" placeholder="Number of packs" value={formData.packs_per_day} onChange={handleChange} />
              </div>
              <div>
                <label>{t('yearsSinceStopping')}:</label>
                <input type="text" name="years_since_stopping" placeholder="Number of years" value={formData.years_since_stopping} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}
        <div className="form-group">
          <label>{t('alcoholConsumption')}</label>
          <input type="text" name="alcohol_consumption" placeholder={t('alcoholPlaceholder')} value={formData.alcohol_consumption} onChange={handleChange} />
        </div>

        {/* Oral Habits Section */}
        <div className="section-header">{t('oralHabits')}</div>
        {renderOralHabit('tobacco_chewing', t('tobaccoChewing') + ':')}
        {renderOralHabit('betel_nut_chewing', t('betelNutChewing') + ':')}
        {renderOralHabit('gutkha_chewing', t('gutkhaChewing') + ':')}
        {renderOralHabit('betel_quid_chewing', t('betelQuidChewing') + ':')}
        {renderOralHabit('mishri_use', t('mishriUse') + ':')}

        {/* Symptoms Section */}
        <div className="section-header">{t('symptoms')}</div>
        <div className="form-group">
          <label>{t('lumps')}</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms1_yes" name="symptoms_lumps" value="yes" checked={formData.symptoms_lumps === 'yes'} onChange={handleChange} />
              <label htmlFor="symptoms1_yes">{t('yes')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms1_no" name="symptoms_lumps" value="no" checked={formData.symptoms_lumps === 'no'} onChange={handleChange} />
              <label htmlFor="symptoms1_no">{t('no')}</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>{t('soreness')}</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms2_yes" name="symptoms_soreness" value="yes" checked={formData.symptoms_soreness === 'yes'} onChange={handleChange} />
              <label htmlFor="symptoms2_yes">{t('yes')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms2_no" name="symptoms_soreness" value="no" checked={formData.symptoms_soreness === 'no'} onChange={handleChange} />
              <label htmlFor="symptoms2_no">{t('no')}</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>{t('painSwallowing')}</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms3_yes" name="symptoms_pain_swallowing" value="yes" checked={formData.symptoms_pain_swallowing === 'yes'} onChange={handleChange} />
              <label htmlFor="symptoms3_yes">{t('yes')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms3_no" name="symptoms_pain_swallowing" value="no" checked={formData.symptoms_pain_swallowing === 'no'} onChange={handleChange} />
              <label htmlFor="symptoms3_no">{t('no')}</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>{t('difficultySwallowing')}</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms4_yes" name="symptoms_difficulty_swallowing" value="yes" checked={formData.symptoms_difficulty_swallowing === 'yes'} onChange={handleChange} />
              <label htmlFor="symptoms4_yes">{t('yes')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms4_no" name="symptoms_difficulty_swallowing" value="no" checked={formData.symptoms_difficulty_swallowing === 'no'} onChange={handleChange} />
              <label htmlFor="symptoms4_no">{t('no')}</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>{t('difficultyMovingTongue')}</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms5_yes" name="symptoms_difficulty_moving_tongue" value="yes" checked={formData.symptoms_difficulty_moving_tongue === 'yes'} onChange={handleChange} />
              <label htmlFor="symptoms5_yes">{t('yes')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms5_no" name="symptoms_difficulty_moving_tongue" value="no" checked={formData.symptoms_difficulty_moving_tongue === 'no'} onChange={handleChange} />
              <label htmlFor="symptoms5_no">{t('no')}</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>{t('difficultyOpeningJaw')}</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms6_yes" name="symptoms_difficulty_opening_jaw" value="yes" checked={formData.symptoms_difficulty_opening_jaw === 'yes'} onChange={handleChange} />
              <label htmlFor="symptoms6_yes">{t('yes')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms6_no" name="symptoms_difficulty_opening_jaw" value="no" checked={formData.symptoms_difficulty_opening_jaw === 'no'} onChange={handleChange} />
              <label htmlFor="symptoms6_no">{t('no')}</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>{t('whitePatches')}</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms7_yes" name="symptoms_white_patches" value="yes" checked={formData.symptoms_white_patches === 'yes'} onChange={handleChange} />
              <label htmlFor="symptoms7_yes">{t('yes')}</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms7_no" name="symptoms_white_patches" value="no" checked={formData.symptoms_white_patches === 'no'} onChange={handleChange} />
              <label htmlFor="symptoms7_no">{t('no')}</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>{t('durationOfSymptoms')}:</label>
          <select name="duration_of_symptoms" value={formData.duration_of_symptoms} onChange={handleChange}>
            <option value="">{t('selectDuration')}</option>
            <option value="less_than_2_weeks">{t('lessThan2Weeks')}</option>
            <option value="2_weeks_to_3_months">{t('twoWeeksTo3Months')}</option>
            <option value="3_to_6_months">{t('threeTo6Months')}</option>
            <option value="6_to_12_months">{t('sixTo12Months')}</option>
            <option value="1_to_3_years">{t('oneTo3Years')}</option>
            <option value="more_than_3_years">{t('moreThan3Years')}</option>
          </select>
        </div>

        {/* Documentation Section */}
        <div className="section-header">{t('documentation')}</div>
        <div className="form-group">
          <label>{t('photographs')}:</label>
          <div className="multi-input-group">
            {photoSites.map(site => (
              <div key={site.key} className="file-input-container">
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ margin: 0, fontWeight: 'bold' }}>{site.label}:</label>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    {photos[site.key] && imageIds[site.key] && (
                      <button
                        type="button"
                        className="file-view-button"
                        onClick={() => fetchAndViewImage(imageIds[site.key], site.key)}
                        disabled={loadingImageId === imageIds[site.key]}
                        style={{ 
                          backgroundColor: '#3498db', 
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: loadingImageId === imageIds[site.key] ? 'wait' : 'pointer',
                          flex: '1',
                          minWidth: '120px',
                          maxWidth: '200px'
                        }}
                      >
                        {loadingImageId === imageIds[site.key] ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ 
                              border: '2px solid #f3f3f3',
                              borderTop: '2px solid #ffffff',
                              borderRadius: '50%',
                              width: '12px',
                              height: '12px',
                              animation: 'spin 1s linear infinite',
                              marginRight: '8px'
                            }}></div>
                            {t('loading')}
                          </div>
                        ) : t('viewImage')}
                      </button>
                    )}
                    <button
                      type="button"
                      className="file-upload-button"
                      onClick={() => openPhotoPopup(site.key)}
                      style={{
                        flex: '1',
                        minWidth: '120px',
                        maxWidth: '200px'
                      }}
                    >
                      {photos[site.key] ? t('changePhoto') : t('addPhoto')}
                    </button>
                  </div>
                </div>
                {imageNotes[site.key] && (
                  <div className="image-note-display">
                    <strong>{t('note')}:</strong> {imageNotes[site.key]}
                  </div>
                )}
              </div>
            ))}
          </div>
          {activePhotoPopup && (
            <FileUploadPopup
              isOpen={!!activePhotoPopup}
              onClose={closePhotoPopup}
              onFileSelect={handlePhotoSelect}
              site={activePhotoPopup}
              initialNote={imageNotes[activePhotoPopup] || ''}
            />
          )}
          
          {/* Image viewer popup */}
          <ImageViewer />
        </div>

        {/* Submit Button */}
        <div className="form-group">
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  animation: 'spin 1s linear infinite',
                  marginRight: '10px'
                }}></div>
                {t('submitting')}
              </div>
            ) : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientQuestionnaire;
