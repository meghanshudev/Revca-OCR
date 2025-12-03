import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Questionnaire.css';
import { API_BASE_URL } from './config';
import PhysicianActions from './PhysicianActions';
import './PhysicianActions.css';
import Loader from './Loader';

const PhysicianQuestionnaire = () => {
  const [patients, setPatients] = useState([]);
  const [showPatientList, setShowPatientList] = useState(true); // Set to true by default
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    patient_questionnaire_id: 0,
    comorbidities: '',
    oropharyngeal_lesion_information: '',
    laterality: '',
    size: '',
    clinical_examination_findings: '',
    staging: '',
    histological_type: '',
    grade: '',
    molecular_genetic_analysis: false,
    unique_identifier: '',
    images: []
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch patients when component mounts
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    // Don't reset showPatientList to false when loading initially
    if (!showPatientList) {
      setSelectedPatient(null);
      setShowPrescriptionForm(false);
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patient_questionnaire/`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
        setShowPatientList(true);
      } else {
        console.error('Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowPrescriptionForm(false);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
    setShowPrescriptionForm(false);
  };
  
  const handleBackToPatientDetails = () => {
    setShowPrescriptionForm(false);
  };
  
  const handleAddPrescription = () => {
    setShowPrescriptionForm(true);
    setPrescriptionData({
      ...prescriptionData,
      patient_questionnaire_id: selectedPatient.id
    });
  };
  
  const handlePrescriptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrescriptionData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Convert size to number if it's a string
    const dataToSend = {
      ...prescriptionData,
      size: prescriptionData.size ? Number(prescriptionData.size) : 0
    };
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/physician_questionnaire/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (response.ok) {
        alert('Prescription added successfully!');
        setShowPrescriptionForm(false);
        // Reset form data
        setPrescriptionData({
          patient_questionnaire_id: 0,
          comorbidities: '',
          oropharyngeal_lesion_information: '',
          laterality: '',
          size: '',
          clinical_examination_findings: '',
          staging: '',
          histological_type: '',
          grade: '',
          molecular_genetic_analysis: false,
          unique_identifier: '',
          images: []
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to add prescription:', errorData);
        alert(`Failed to add prescription: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error adding prescription:', error);
      alert('An error occurred while adding the prescription');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitial = (email) => {
    return email && email.length > 0 ? email[0].toUpperCase() : '?';
  };

  const getRandomColor = (email) => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0',
      '#33FFF0', '#F0FF33', '#FF3333', '#33FF33', '#3333FF'
    ];
    
    // Simple hash function to get consistent color for the same email
    let hash = 0;
    if (email && email.length > 0) {
      for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  return (
    <div className="questionnaire-container">
      <PhysicianActions />
      {isLoading && <Loader />}
      
      {showPatientList && !isLoading && !selectedPatient && (
        <div className="patient-list-container">
          <h2>All Patients</h2>
          <div className="patient-profiles">
            {patients.map(patient => (
              <div 
                key={patient.id} 
                className="patient-profile"
                onClick={() => handlePatientClick(patient)}
              >
                <div 
                  className="patient-avatar"
                  style={{ backgroundColor: getRandomColor(patient.email) }}
                >
                  {getInitial(patient.email)}
                </div>
                <div className="patient-email">{patient.email}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedPatient && !showPrescriptionForm && (
        <div className="patient-details-container">
          <div className="patient-details-header">
            <button className="back-button" onClick={handleBackToList}>
              ← Back to Patient List
            </button>
            <h2>Patient Details</h2>
          </div>
          
          <div className="patient-details-content">
            <div className="patient-profile-large">
              <div 
                className="patient-avatar-large"
                style={{ backgroundColor: getRandomColor(selectedPatient.email) }}
              >
                {getInitial(selectedPatient.email)}
              </div>
              <div className="patient-email-large">{selectedPatient.email}</div>
              <button className="add-prescription-button" onClick={handleAddPrescription}>
                Add Today's Prescription
              </button>
            </div>
            
            <div className="patient-details-section">
              <h3>Personal Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{selectedPatient.patient_identification_number || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{selectedPatient.age || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Gender:</span>
                  <span className="detail-value">
                    {selectedPatient.gender ? 
                      selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1) : 
                      'Not provided'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Ethnicity:</span>
                  <span className="detail-value">{selectedPatient.ethnicity || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Education:</span>
                  <span className="detail-value">{selectedPatient.education_level || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Occupation:</span>
                  <span className="detail-value">{selectedPatient.occupation || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="patient-details-section">
              <h3>Health Awareness</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Cancer Awareness:</span>
                  <span className="detail-value">{selectedPatient.cancer_awareness === 'yes' ? 'Yes' : 
                    selectedPatient.cancer_awareness === 'no' ? 'No' : 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Family History:</span>
                  <span className="detail-value">{selectedPatient.family_history_oral_cancer === 'yes' ? 'Yes' : 
                    selectedPatient.family_history_oral_cancer === 'no' ? 'No' : 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="patient-details-section">
              <h3>Lifestyle Habits</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Smoking Status:</span>
                  <span className="detail-value">{selectedPatient.smoking_status || 'Not provided'}</span>
                </div>
                {selectedPatient.smoking_status && selectedPatient.smoking_status !== 'never' && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">Years of Smoking:</span>
                      <span className="detail-value">{selectedPatient.years_of_smoking || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Packs per Day:</span>
                      <span className="detail-value">{selectedPatient.packs_per_day || 'Not provided'}</span>
                    </div>
                    {selectedPatient.smoking_status === 'ex-smoker' && (
                      <div className="detail-item">
                        <span className="detail-label">Years Since Stopping:</span>
                        <span className="detail-value">{selectedPatient.years_since_stopping || 'Not provided'}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="detail-item">
                  <span className="detail-label">Alcohol Consumption:</span>
                  <span className="detail-value">{selectedPatient.alcohol_consumption || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="patient-details-section">
              <h3>Oral Habits</h3>
              <div className="details-grid">
                {selectedPatient.tobacco_chewing_frequency && (
                  <div className="detail-item">
                    <span className="detail-label">Tobacco Chewing:</span>
                    <span className="detail-value">
                      {`${selectedPatient.tobacco_chewing_frequency} (${selectedPatient.tobacco_chewing_duration || 'duration not specified'})`}
                    </span>
                  </div>
                )}
                {selectedPatient.betel_nut_chewing_frequency && (
                  <div className="detail-item">
                    <span className="detail-label">Betel Nut Chewing:</span>
                    <span className="detail-value">
                      {`${selectedPatient.betel_nut_chewing_frequency} (${selectedPatient.betel_nut_chewing_duration || 'duration not specified'})`}
                    </span>
                  </div>
                )}
                {selectedPatient.gutkha_chewing_frequency && (
                  <div className="detail-item">
                    <span className="detail-label">Gutkha Chewing:</span>
                    <span className="detail-value">
                      {`${selectedPatient.gutkha_chewing_frequency} (${selectedPatient.gutkha_chewing_duration || 'duration not specified'})`}
                    </span>
                  </div>
                )}
                {selectedPatient.betel_quid_chewing_frequency && (
                  <div className="detail-item">
                    <span className="detail-label">Betel Quid Chewing:</span>
                    <span className="detail-value">
                      {`${selectedPatient.betel_quid_chewing_frequency} (${selectedPatient.betel_quid_chewing_duration || 'duration not specified'})`}
                    </span>
                  </div>
                )}
                {selectedPatient.mishri_use_frequency && (
                  <div className="detail-item">
                    <span className="detail-label">Mishri Use:</span>
                    <span className="detail-value">
                      {`${selectedPatient.mishri_use_frequency} (${selectedPatient.mishri_use_duration || 'duration not specified'})`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="patient-details-section">
              <h3>Symptoms</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Lumps/Ulcers:</span>
                  <span className="detail-value">{selectedPatient.symptoms_lumps === 'yes' ? 'Yes' : 
                    selectedPatient.symptoms_lumps === 'no' ? 'No' : 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Soreness/Pain:</span>
                  <span className="detail-value">{selectedPatient.symptoms_soreness === 'yes' ? 'Yes' : 
                    selectedPatient.symptoms_soreness === 'no' ? 'No' : 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Pain Swallowing:</span>
                  <span className="detail-value">{selectedPatient.symptoms_pain_swallowing === 'yes' ? 'Yes' : 
                    selectedPatient.symptoms_pain_swallowing === 'no' ? 'No' : 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Difficulty Swallowing:</span>
                  <span className="detail-value">{selectedPatient.symptoms_difficulty_swallowing === 'yes' ? 'Yes' : 
                    selectedPatient.symptoms_difficulty_swallowing === 'no' ? 'No' : 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Difficulty Moving Tongue:</span>
                  <span className="detail-value">{selectedPatient.symptoms_difficulty_moving_tongue === 'yes' ? 'Yes' : 
                    selectedPatient.symptoms_difficulty_moving_tongue === 'no' ? 'No' : 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Difficulty Opening Jaw:</span>
                  <span className="detail-value">{selectedPatient.symptoms_difficulty_opening_jaw === 'yes' ? 'Yes' : 
                    selectedPatient.symptoms_difficulty_opening_jaw === 'no' ? 'No' : 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">White Patches:</span>
                  <span className="detail-value">{selectedPatient.symptoms_white_patches === 'yes' ? 'Yes' : 
                    selectedPatient.symptoms_white_patches === 'no' ? 'No' : 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration of Symptoms:</span>
                  <span className="detail-value">{selectedPatient.duration_of_symptoms || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedPatient && showPrescriptionForm && (
        <div className="prescription-form-container">
          <div className="patient-details-header">
            <button className="back-button" onClick={handleBackToPatientDetails}>
              ← Back to Patient Details
            </button>
            <h2>Add Prescription for {selectedPatient.email}</h2>
          </div>
          
          <form onSubmit={handlePrescriptionSubmit} className="prescription-form">
            <div className="form-group">
              <label htmlFor="comorbidities">Comorbidities:</label>
              <textarea 
                id="comorbidities" 
                name="comorbidities" 
                value={prescriptionData.comorbidities} 
                onChange={handlePrescriptionChange}
                placeholder="Enter any comorbidities"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="oropharyngeal_lesion_information">Oropharyngeal Lesion Information:</label>
              <textarea 
                id="oropharyngeal_lesion_information" 
                name="oropharyngeal_lesion_information" 
                value={prescriptionData.oropharyngeal_lesion_information} 
                onChange={handlePrescriptionChange}
                placeholder="Enter lesion information"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="laterality">Laterality:</label>
              <select 
                id="laterality" 
                name="laterality" 
                value={prescriptionData.laterality} 
                onChange={handlePrescriptionChange}
              >
                <option value="">-- Select Laterality --</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="bilateral">Bilateral</option>
                <option value="midline">Midline</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="size">Size (mm):</label>
              <input 
                type="number" 
                id="size" 
                name="size" 
                value={prescriptionData.size} 
                onChange={handlePrescriptionChange}
                placeholder="Enter size in mm"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="clinical_examination_findings">Clinical Examination Findings:</label>
              <textarea 
                id="clinical_examination_findings" 
                name="clinical_examination_findings" 
                value={prescriptionData.clinical_examination_findings} 
                onChange={handlePrescriptionChange}
                placeholder="Enter examination findings"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="staging">Staging:</label>
              <select 
                id="staging" 
                name="staging" 
                value={prescriptionData.staging} 
                onChange={handlePrescriptionChange}
              >
                <option value="">-- Select Staging --</option>
                <option value="stage_0">Stage 0</option>
                <option value="stage_1">Stage I</option>
                <option value="stage_2">Stage II</option>
                <option value="stage_3">Stage III</option>
                <option value="stage_4a">Stage IVA</option>
                <option value="stage_4b">Stage IVB</option>
                <option value="stage_4c">Stage IVC</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="histological_type">Histological Type:</label>
              <input 
                type="text" 
                id="histological_type" 
                name="histological_type" 
                value={prescriptionData.histological_type} 
                onChange={handlePrescriptionChange}
                placeholder="Enter histological type"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="grade">Grade:</label>
              <select 
                id="grade" 
                name="grade" 
                value={prescriptionData.grade} 
                onChange={handlePrescriptionChange}
              >
                <option value="">-- Select Grade --</option>
                <option value="grade_1">Grade 1 (Well differentiated)</option>
                <option value="grade_2">Grade 2 (Moderately differentiated)</option>
                <option value="grade_3">Grade 3 (Poorly differentiated)</option>
                <option value="grade_4">Grade 4 (Undifferentiated)</option>
              </select>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="molecular_genetic_analysis" 
                  checked={prescriptionData.molecular_genetic_analysis} 
                  onChange={handlePrescriptionChange}
                />
                Molecular Genetic Analysis
              </label>
            </div>
            
            <div className="form-group">
              <label htmlFor="unique_identifier">Unique Identifier:</label>
              <input 
                type="text" 
                id="unique_identifier" 
                name="unique_identifier" 
                value={prescriptionData.unique_identifier} 
                onChange={handlePrescriptionChange}
                placeholder="Enter unique identifier"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-button">Submit Prescription</button>
              <button type="button" className="cancel-button" onClick={handleBackToPatientDetails}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PhysicianQuestionnaire;
