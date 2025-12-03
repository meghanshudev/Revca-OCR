import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { API_BASE_URL } from './config';
import './LanguageSelection.css'; // Reusing the same CSS for consistency

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

const handleIdSubmit = async (e) => {
    e.preventDefault();
    if (!patientIdInput.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patient_questionnaire/${patientIdInput}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched patient data:', data); // Log the data for debugging
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
    </div>
  );
};

export default PatientTypeSelection;
