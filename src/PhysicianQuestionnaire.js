import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Questionnaire.css';
import { API_BASE_URL } from './config';
import PhysicianActions from './PhysicianActions';
import './PhysicianActions.css';
import Loader from './Loader';
import FileUploadPopup from './FileUploadPopup';

const comorbiditiesOptions = {
  "General / Metabolic": [
    { label: "Obesity", name: "obesity" },
    { label: "Malnutrition", name: "malnutrition" },
    { label: "Dyslipidemia", name: "dyslipidemia" },
    { label: "Diabetes mellitus – Type 1", name: "diabetes_mellitus_type_1" },
    { label: "Diabetes mellitus – Type 2", name: "diabetes_mellitus_type_2" },
    { label: "Hypothyroidism", name: "hypothyroidism" },
    { label: "Hyperthyroidism", name: "hyperthyroidism" },
    { label: "Other", name: "other_general_metabolic" }
  ],
  "Cardiovascular": [
    { label: "Hypertension", name: "hypertension" },
    { label: "Coronary artery disease", name: "coronary_artery_disease" },
    { label: "Congestive heart failure", name: "congestive_heart_failure" },
    { label: "Cardiac arrhythmia (e.g., atrial fibrillation)", name: "cardiac_arrhythmia" },
    { label: "Peripheral vascular disease", name: "peripheral_vascular_disease" },
    { label: "Other", name: "other_cardiovascular" }
  ],
  "Cerebrovascular / Neurologic": [
    { label: "Prior stroke / Transient ischemic attack (TIA)", name: "prior_stroke_transient_ischemic_attack_tia" },
    { label: "Dementia / Cognitive impairment", name: "dementia_cognitive_impairment" }
  ],
  "Respiratory": [
    { label: "Chronic obstructive pulmonary disease (COPD)", name: "chronic_obstructive_pulmonary_disease_copd" },
    { label: "Asthma", name: "asthma" },
    { label: "Other", name: "other_respiratory" }
  ],
  "Gastrointestinal / Hepatic / Renal": [
    { label: "Chronic liver disease / Cirrhosis", name: "chronic_liver_disease_cirrhosis" },
    { label: "Peptic ulcer disease", name: "peptic_ulcer_disease" },
    { label: "Gastroesophageal reflux disease (GERD)", name: "gastroesophageal_reflux_disease_gerd" },
    { label: "Chronic kidney disease", name: "chronic_kidney_disease" },
    { label: "Other", name: "other_gi_hepatic_renal" }
  ],
  "Immunologic / Autoimmune": [
    { label: "Immunosuppression (e.g., HIV, long-term steroids, transplant)", name: "immunosuppression" },
    { label: "Autoimmune disease (e.g., rheumatoid arthritis, lupus)", name: "autoimmune_disease" }
  ],
  "Hematologic": [
    { label: "Aneamia or chronic hematologic disorder", name: "aneamia_or_chronic_hematologic_disorder" }
  ],
  "Psychiatric": [
    { label: "Psychiatric illness (e.g., depression, anxiety, bipolar disorder)", name: "psychiatric_illness" }
  ],
  "Oncologic": [
    { label: "Prior cancer (other than oral cavity)", name: "prior_cancer_other_than_oral_cavity" }
  ]
};

const PhysicianQuestionnaire = () => {
  const [patients, setPatients] = useState([]);
  const [patientIdSearch, setPatientIdSearch] = useState('');
  const [showPatientList, setShowPatientList] = useState(true); // Set to true by default
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [prescriptionData, setPrescriptionData] = useState({
    patient_questionnaire_id: 0,
    // Comorbidities fields
    obesity: false,
    malnutrition: false,
    dyslipidemia: false,
    diabetes_mellitus_type_1: false,
    diabetes_mellitus_type_2: false,
    hypothyroidism: false,
    hyperthyroidism: false,
    other_general_metabolic: false,
    hypertension: false,
    coronary_artery_disease: false,
    congestive_heart_failure: false,
    cardiac_arrhythmia: false,
    peripheral_vascular_disease: false,
    other_cardiovascular: false,
    prior_stroke_transient_ischemic_attack_tia: false,
    dementia_cognitive_impairment: false,
    chronic_obstructive_pulmonary_disease_copd: false,
    asthma: false,
    other_respiratory: false,
    chronic_liver_disease_cirrhosis: false,
    peptic_ulcer_disease: false,
    gastroesophageal_reflux_disease_gerd: false,
    chronic_kidney_disease: false,
    other_gi_hepatic_renal: false,
    immunosuppression: false,
    autoimmune_disease: false,
    aneamia_or_chronic_hematologic_disorder: false,
    psychiatric_illness: false,
    prior_cancer_other_than_oral_cavity: false,
    
    oropharyngeal_lesion_information: '',
    laterality: '',
    size: '',
    clinical_examination_findings: '',
    staging: '',
    histological_type: '',
    grade: '',
    molecular_genetic_analysis: false,
    unique_identifier: '',
    images: [],
    primary_treatment_modality: '',
    disease_status_at_follow_up: '',
    time_period_months: ''
  });
  
  const [activePhotoPopup, setActivePhotoPopup] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState({});
  const [imageIds, setImageIds] = useState({});
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch patients when component mounts
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (preserveSelected = false) => {
    setIsLoading(true);
    // Don't reset showPatientList to false when loading initially
    if (!showPatientList && !preserveSelected) {
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
        const responseData = await response.json();
        // Extract the patients array from the data property
        const patientsArray = responseData.data || [];
        setPatients(patientsArray);
        setShowPatientList(true);
        
        if (preserveSelected && selectedPatient) {
          const updatedPatient = patientsArray.find(p => p.id === selectedPatient.id);
          if (updatedPatient) {
            setSelectedPatient(updatedPatient);
          }
        }
      } else {
        console.error('Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientClick = async (patient) => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patient_questionnaire/${patient.id}`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedPatient(data);
        setShowPrescriptionForm(false);
      } else {
        console.error('Failed to fetch patient details');
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientIdSearch = async (e) => {
    e.preventDefault();
    if (!patientIdSearch.trim()) {
      setSearchError('Please enter a patient ID');
      return;
    }

    setIsLoading(true);
    setSearchError('');
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patient_questionnaire/${patientIdSearch}`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedPatient(data);
        setShowPatientList(false);
        setShowPrescriptionForm(false);
      } else {
        if (response.status === 404) {
          setSearchError(`No patient found with ID: ${patientIdSearch}`);
        } else {
          setSearchError('Failed to fetch patient details. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  const handleMultiSelectChange = (e, fieldName, delimiter = ', ') => {
    const { value, checked } = e.target;
    setPrescriptionData(prevData => {
      const currentValues = prevData[fieldName] && prevData[fieldName] !== '' ? prevData[fieldName].split(delimiter) : [];
      let newValues;
      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter(item => item !== value);
      }
      return {
        ...prevData,
        [fieldName]: newValues.join(delimiter)
      };
    });
  };

  const openPhotoPopup = (site) => {
    setActivePhotoPopup(site);
  };

  const closePhotoPopup = () => {
    setActivePhotoPopup(null);
  };

  const handlePhotoSelect = (result, file, site) => {
    setImageIds(prevIds => ({
      ...prevIds,
      [site]: result.id
    }));
    setUploadedPhotos(prevPhotos => ({
      ...prevPhotos,
      [site]: true
    }));
  };

  const handleFollowUpClick = (followup) => {
    setSelectedFollowUp(followup);
  };

  const closeFollowUpPopup = () => {
    setSelectedFollowUp(null);
  };
  
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Convert size to number if it's a string
    const dataToSend = {
      ...prescriptionData,
      size: prescriptionData.size ? Number(prescriptionData.size) : 0,
      time_period_months: prescriptionData.time_period_months ? Number(prescriptionData.time_period_months) : null,
      images: Object.values(imageIds)
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
          obesity: false,
          malnutrition: false,
          dyslipidemia: false,
          diabetes_mellitus_type_1: false,
          diabetes_mellitus_type_2: false,
          hypothyroidism: false,
          hyperthyroidism: false,
          other_general_metabolic: false,
          hypertension: false,
          coronary_artery_disease: false,
          congestive_heart_failure: false,
          cardiac_arrhythmia: false,
          peripheral_vascular_disease: false,
          other_cardiovascular: false,
          prior_stroke_transient_ischemic_attack_tia: false,
          dementia_cognitive_impairment: false,
          chronic_obstructive_pulmonary_disease_copd: false,
          asthma: false,
          other_respiratory: false,
          chronic_liver_disease_cirrhosis: false,
          peptic_ulcer_disease: false,
          gastroesophageal_reflux_disease_gerd: false,
          chronic_kidney_disease: false,
          other_gi_hepatic_renal: false,
          immunosuppression: false,
          autoimmune_disease: false,
          aneamia_or_chronic_hematologic_disorder: false,
          psychiatric_illness: false,
          prior_cancer_other_than_oral_cavity: false,
          oropharyngeal_lesion_information: '',
          laterality: '',
          size: '',
          clinical_examination_findings: '',
          staging: '',
          histological_type: '',
          grade: '',
          molecular_genetic_analysis: false,
          unique_identifier: '',
          images: [],
          primary_treatment_modality: '',
          disease_status_at_follow_up: '',
          time_period_months: ''
        });
        setUploadedPhotos({});
        setImageIds({});
        
        // Refresh data to show the new follow-up
        await fetchPatients(true);
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

  const formatBoolean = (value) => {
    if (value === true || value === 'yes') return 'Yes';
    if (value === false || value === 'no') return 'No';
    return 'Not provided';
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
          
          <div className="search-bar-container">
            <form onSubmit={handlePatientIdSearch} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search by patient ID (e.g., PAT-20251202-FF7C)"
                value={patientIdSearch}
                onChange={(e) => setPatientIdSearch(e.target.value)}
                className="search-input"
                style={{ flex: 1 }}
              />
              <button 
                type="submit" 
                className="search-button"
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </form>
            {searchError && (
              <div className="error-message" style={{ color: 'red', marginTop: '5px', fontSize: '0.9em' }}>
                {searchError}
              </div>
            )}
          </div>

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
            
            {patients.length === 0 && (
              <div className="no-results">No patients found</div>
            )}
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
                  <span className="detail-value">{formatBoolean(selectedPatient.cancer_awareness)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Family History:</span>
                  <span className="detail-value">{formatBoolean(selectedPatient.family_history)}</span>
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
                      <span className="detail-value">{selectedPatient.smoking_years || 'Not provided'}</span>
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
                  <span className="detail-value">{formatBoolean(selectedPatient.symptoms_lumps)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Soreness/Pain:</span>
                  <span className="detail-value">{formatBoolean(selectedPatient.symptoms_soreness)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Pain Swallowing:</span>
                  <span className="detail-value">{formatBoolean(selectedPatient.symptoms_pain_swallowing)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Difficulty Swallowing:</span>
                  <span className="detail-value">{formatBoolean(selectedPatient.symptoms_difficulty_swallowing)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Difficulty Moving Tongue:</span>
                  <span className="detail-value">{formatBoolean(selectedPatient.symptoms_difficulty_tongue)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Difficulty Opening Jaw:</span>
                  <span className="detail-value">{formatBoolean(selectedPatient.symptoms_difficulty_jaw)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">White Patches:</span>
                  <span className="detail-value">{formatBoolean(selectedPatient.symptoms_white_patches)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration of Symptoms:</span>
                  <span className="detail-value">{selectedPatient.symptoms_duration || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="patient-details-section">
              <h3>Physician Follow-ups</h3>
              {selectedPatient.physician_questionnaires && selectedPatient.physician_questionnaires.length > 0 ? (
                <div className="follow-ups-container">
                  {selectedPatient.physician_questionnaires.map((followup, index) => (
                    <div
                      key={followup.id || index}
                      className="follow-up-card compact"
                      onClick={() => handleFollowUpClick(followup)}
                      style={{
                        backgroundColor: '#f9f9f9',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        border: '1px solid #e0e0e0',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Follow-up #{index + 1}</h4>
                        <span style={{ fontSize: '0.9em', color: '#666' }}>
                          {followup.created_at ? new Date(followup.created_at).toLocaleString() : 'Date not available'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data-message">No follow-up records found.</p>
              )}
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
              <label>Comorbidities:</label>
              {Object.entries(comorbiditiesOptions).map(([category, options]) => (
                <div key={category} className="comorbidity-category" style={{ marginBottom: '15px' }}>
                  <strong style={{ display: 'block', marginBottom: '5px', color: '#2c3e50' }}>{category}</strong>
                  <div className="checkbox-grid">
                    {options.map(option => (
                      <label key={option.name} className="checkbox-label">
                        <input
                          type="checkbox"
                          name={option.name}
                          checked={prescriptionData[option.name]}
                          onChange={handlePrescriptionChange}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Photographs (with size measuring function):</label>
              <div className="multi-input-group">
                {[1, 2, 3, 4, 5, 6].map(num => {
                  const site = `Photograph_Site_${num}`;
                  return (
                    <div key={site} className="file-input-container">
                      <label>Site {num}:</label>
                      <button
                        type="button"
                        className="file-upload-button"
                        onClick={() => openPhotoPopup(site)}
                      >
                        {uploadedPhotos[site] ? 'Change Photo' : 'Upload Photo'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="form-group">
              <label>Oropharyngeal Lesion Information:</label>
              <div className="checkbox-grid">
                {[
                  'Anterior floor of mouth', 'Anterior 2/3 of tongue', 'Posterior third tongue',
                  'Buccal mucosa', 'Hard palate', 'Soft Palate', 'Nasopharynx',
                  'Hypopharynx', 'Larynx', 'Sinuses', 'Tonsils', 'Other'
                ].map(site => (
                  <label key={site} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={site}
                      checked={prescriptionData.oropharyngeal_lesion_information ? prescriptionData.oropharyngeal_lesion_information.split(', ').includes(site) : false}
                      onChange={(e) => handleMultiSelectChange(e, 'oropharyngeal_lesion_information')}
                    />
                    {site}
                  </label>
                ))}
              </div>
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
              <label htmlFor="size">Size (greatest dimension in mm):</label>
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
              <label>Clinical Examination Findings:</label>
              <div className="checkbox-grid">
                {[
                  'Neck nodes', 'Trismus', 'Ulceration', 'Submucous fibrosis',
                  'Leukoplakia', 'Erythroplakia', 'Other'
                ].map(finding => (
                  <label key={finding} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={finding}
                      checked={prescriptionData.clinical_examination_findings ? prescriptionData.clinical_examination_findings.split(', ').includes(finding) : false}
                      onChange={(e) => handleMultiSelectChange(e, 'clinical_examination_findings')}
                    />
                    {finding}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="staging">Staging (TNM):</label>
              <input
                type="text"
                id="staging"
                name="staging"
                value={prescriptionData.staging}
                onChange={handlePrescriptionChange}
                placeholder="e.g., T1N0M0"
              />
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
                <option value="well_differentiated">Well differentiated</option>
                <option value="moderately_differentiated">Moderately differentiated</option>
                <option value="poorly_differentiated">Poorly differentiated</option>
              </select>
            </div>

            <div className="form-group">
              <label>Histopathalogical slides (uploaded from optrascan):</label>
              <div className="multi-input-group">
                {[1, 2, 3, 4, 5, 6].map(num => {
                  const site = `Histopathology_Site_${num}`;
                  return (
                    <div key={site} className="file-input-container">
                      <label>Site {num}:</label>
                      <button
                        type="button"
                        className="file-upload-button"
                        onClick={() => openPhotoPopup(site)}
                      >
                        {uploadedPhotos[site] ? 'Change Slide' : 'Upload Slide'}
                      </button>
                    </div>
                  );
                })}
              </div>
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
              <label htmlFor="unique_identifier">Photograph/biopsy site unique identifier:</label>
              <input
                type="text"
                id="unique_identifier"
                name="unique_identifier"
                value={prescriptionData.unique_identifier}
                onChange={handlePrescriptionChange}
                placeholder="Enter unique identifier"
              />
            </div>

            <h3>Follow up details</h3>
            
            <div className="form-group">
              <label htmlFor="primary_treatment_modality">Primary Treatment Modality:</label>
              <select
                id="primary_treatment_modality"
                name="primary_treatment_modality"
                value={prescriptionData.primary_treatment_modality}
                onChange={handlePrescriptionChange}
              >
                <option value="">-- Select Treatment --</option>
                <option value="surgery_alone">Surgery alone</option>
                <option value="surgery_adjuvant_radiation">Surgery + adjuvant radiation</option>
                <option value="surgery_adjuvant_chemoradiation">Surgery + adjuvant chemoradiation</option>
                <option value="definitive_radiation_alone">Definitive radiation alone</option>
                <option value="definitive_chemoradiation">Definitive chemoradiation</option>
                <option value="systemic_therapy_alone">Systemic therapy alone (palliative)</option>
                <option value="observation">Observation / no treatment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="disease_status_at_follow_up">Disease Status at follow up:</label>
              <select
                id="disease_status_at_follow_up"
                name="disease_status_at_follow_up"
                value={prescriptionData.disease_status_at_follow_up}
                onChange={handlePrescriptionChange}
              >
                <option value="">-- Select Status --</option>
                <option value="alive_ned">Alive with no evidence of disease (NED)</option>
                <option value="alive_awd">Alive with disease (AWD)</option>
                <option value="died_dod">Died of disease (DOD)</option>
                <option value="died_doc">Died of other cause (DOC)</option>
                <option value="lost_follow_up">Lost to follow-up</option>
                <option value="hospice">Hospice / palliative care</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="time_period_months">Time period (months):</label>
              <input
                type="number"
                id="time_period_months"
                name="time_period_months"
                value={prescriptionData.time_period_months}
                onChange={handlePrescriptionChange}
                placeholder="Enter months"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-button">Submit Prescription</button>
              <button type="button" className="cancel-button" onClick={handleBackToPatientDetails}>Cancel</button>
            </div>
          </form>
          
          {activePhotoPopup && (
            <FileUploadPopup
              isOpen={!!activePhotoPopup}
              onClose={closePhotoPopup}
              onFileSelect={handlePhotoSelect}
              site={activePhotoPopup}
            />
          )}
        </div>
      )}
      {selectedFollowUp && (
        <div className="popup-overlay">
          <div className="popup-container" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="popup-header">
              <h3>Follow-up Details</h3>
              <button className="close-button" onClick={closeFollowUpPopup}>×</button>
            </div>
            <div className="popup-content">
              <div className="details-grid">
                <div className="detail-item full-width">
                  <span className="detail-label">Comorbidities:</span>
                  <div className="detail-value">
                    {selectedFollowUp.comorbidities ? (
                      <span>{selectedFollowUp.comorbidities}</span>
                    ) : (
                      Object.values(comorbiditiesOptions).flat().map(option => {
                        if (selectedFollowUp[option.name]) {
                          return <span key={option.name} className="tag" style={{
                            display: 'inline-block',
                            backgroundColor: '#e1f5fe',
                            color: '#0277bd',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            marginRight: '5px',
                            marginBottom: '5px',
                            fontSize: '0.9em'
                          }}>{option.label}</span>;
                        }
                        return null;
                      }).filter(Boolean).length > 0 ? 
                        Object.values(comorbiditiesOptions).flat().map(option => {
                          if (selectedFollowUp[option.name]) {
                            return <span key={option.name} className="tag" style={{
                              display: 'inline-block',
                              backgroundColor: '#e1f5fe',
                              color: '#0277bd',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              marginRight: '5px',
                              marginBottom: '5px',
                              fontSize: '0.9em'
                            }}>{option.label}</span>;
                          }
                          return null;
                        }) : 'None'
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Lesion Info:</span>
                  <span className="detail-value">{selectedFollowUp.oropharyngeal_lesion_information || 'None'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Laterality:</span>
                  <span className="detail-value">{selectedFollowUp.laterality || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{selectedFollowUp.size ? `${selectedFollowUp.size} mm` : 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Clinical Findings:</span>
                  <span className="detail-value">{selectedFollowUp.clinical_examination_findings || 'None'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Staging:</span>
                  <span className="detail-value">{selectedFollowUp.staging ? selectedFollowUp.staging.replace('_', ' ').toUpperCase() : 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Histological Type:</span>
                  <span className="detail-value">{selectedFollowUp.histological_type || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Grade:</span>
                  <span className="detail-value">{selectedFollowUp.grade ? selectedFollowUp.grade.replace('_', ' ').toUpperCase() : 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Molecular Analysis:</span>
                  <span className="detail-value">{selectedFollowUp.molecular_genetic_analysis ? 'Yes' : 'No'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Unique ID:</span>
                  <span className="detail-value">{selectedFollowUp.unique_identifier || 'None'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Primary Treatment:</span>
                  <span className="detail-value">{selectedFollowUp.primary_treatment_modality ? selectedFollowUp.primary_treatment_modality.replace(/_/g, ' ') : 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Disease Status:</span>
                  <span className="detail-value">{selectedFollowUp.disease_status_at_follow_up ? selectedFollowUp.disease_status_at_follow_up.replace(/_/g, ' ') : 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time Period:</span>
                  <span className="detail-value">{selectedFollowUp.time_period_months ? `${selectedFollowUp.time_period_months} months` : 'Not specified'}</span>
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button className="confirm-button" onClick={closeFollowUpPopup}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysicianQuestionnaire;
