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
    "Obesity", "Malnutrition", "Dyslipidemia", "Diabetes mellitus – Type 1",
    "Diabetes mellitus – Type 2", "Hypothyroidism", "Hyperthyroidism", "Other General/Metabolic"
  ],
  "Cardiovascular": [
    "Hypertension", "Coronary artery disease", "Congestive heart failure",
    "Cardiac arrhythmia", "Peripheral vascular disease", "Other Cardiovascular"
  ],
  "Cerebrovascular / Neurologic": [
    "Prior stroke / Transient ischemic attack (TIA)", "Dementia / Cognitive impairment"
  ],
  "Respiratory": [
    "Chronic obstructive pulmonary disease (COPD)", "Asthma", "Other Respiratory"
  ],
  "Gastrointestinal / Hepatic / Renal": [
    "Chronic liver disease / Cirrhosis", "Peptic ulcer disease",
    "Gastroesophageal reflux disease (GERD)", "Chronic kidney disease", "Other GI/Hepatic/Renal"
  ],
  "Immunologic / Autoimmune": [
    "Immunosuppression", "Autoimmune disease"
  ],
  "Hematologic": [
    "Aneamia or chronic hematologic disorder"
  ],
  "Psychiatric": [
    "Psychiatric illness"
  ],
  "Oncologic": [
    "Prior cancer (other than oral cavity)"
  ],
  "None": ["None"]
};

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
    images: [],
    primary_treatment_modality: '',
    disease_status: '',
    follow_up_period: ''
  });
  
  const [activePhotoPopup, setActivePhotoPopup] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState({});
  const [imageIds, setImageIds] = useState({});

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
  
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Convert size to number if it's a string
    const dataToSend = {
      ...prescriptionData,
      size: prescriptionData.size ? Number(prescriptionData.size) : 0,
      follow_up_period: prescriptionData.follow_up_period ? Number(prescriptionData.follow_up_period) : null,
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
          images: [],
          primary_treatment_modality: '',
          disease_status: '',
          follow_up_period: ''
        });
        setUploadedPhotos({});
        setImageIds({});
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
                    <div key={followup.id || index} className="follow-up-card" style={{
                      backgroundColor: '#f9f9f9',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <h4 style={{ marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>
                        Follow-up #{index + 1}
                        <span style={{ fontSize: '0.8em', fontWeight: 'normal', float: 'right', color: '#666' }}>
                          {followup.created_at ? new Date(followup.created_at).toLocaleString() : 'Date not available'}
                        </span>
                      </h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Comorbidities:</span>
                          <span className="detail-value">{followup.comorbidities || 'None'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Lesion Info:</span>
                          <span className="detail-value">{followup.oropharyngeal_lesion_information || 'None'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Laterality:</span>
                          <span className="detail-value">{followup.laterality || 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Size:</span>
                          <span className="detail-value">{followup.size ? `${followup.size} mm` : 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Clinical Findings:</span>
                          <span className="detail-value">{followup.clinical_examination_findings || 'None'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Staging:</span>
                          <span className="detail-value">{followup.staging ? followup.staging.replace('_', ' ').toUpperCase() : 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Histological Type:</span>
                          <span className="detail-value">{followup.histological_type || 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Grade:</span>
                          <span className="detail-value">{followup.grade ? followup.grade.replace('_', ' ').toUpperCase() : 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Molecular Analysis:</span>
                          <span className="detail-value">{followup.molecular_genetic_analysis ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Unique ID:</span>
                          <span className="detail-value">{followup.unique_identifier || 'None'}</span>
                        </div>
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
                      <label key={option} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={option}
                          checked={prescriptionData.comorbidities ? prescriptionData.comorbidities.split('|').includes(option) : false}
                          onChange={(e) => handleMultiSelectChange(e, 'comorbidities', '|')}
                        />
                        {option}
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
              <label htmlFor="disease_status">Disease Status at follow up:</label>
              <select
                id="disease_status"
                name="disease_status"
                value={prescriptionData.disease_status}
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
              <label htmlFor="follow_up_period">Time period (months):</label>
              <input
                type="number"
                id="follow_up_period"
                name="follow_up_period"
                value={prescriptionData.follow_up_period}
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
    </div>
  );
};

export default PhysicianQuestionnaire;
