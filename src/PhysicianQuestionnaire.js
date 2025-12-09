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

const isToday = (someDate) => {
  const today = new Date();
  const date = new Date(someDate);
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const initialPrescriptionState = {
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
  other_oropharyngeal_lesion_information_text: '',
  laterality: '',
  size: '',
  clinical_examination_findings: '',
  other_clinical_examination_findings_text: '',
  staging: '',
  cancerous_lesion: '',
  histological_type: '',
  grade: '',
  molecular_genetic_analysis: false,
  images: [],
  primary_treatment_modality: '',
  disease_status_at_follow_up: '',
  time_period_months: ''
};

const photoSites = [
    { key: "Upper Lip", label: 'Upper Lip' },
    { key: "Lower Lip", label: 'Lower Lip' },
    { key: "Left Cheeks (Inside)", label: 'Left Cheeks (Inside)' },
    { key: "Right Cheeks (Inside)", label: 'Right Cheeks (Inside)' },
    { key: "Tongue Top", label: 'Tongue Top' },
    { key: "Tongue Back", label: 'Tongue Back' },
    { key: "Left Side Tongue", label: 'Left Side Tongue' },
    { key: "Right Side Tongue", label: 'Right Side Tongue' },
    { key: "Roof of Mouth", label: 'Roof of Mouth' },
    { key: "Bottom of Mouth", label: 'Bottom of Mouth' },
    { key: "Gums", label: 'Gums' },
    { key: "Back of Throat", label: 'Back of Throat' }
  ];

const PhysicianQuestionnaire = () => {
  const [patients, setPatients] = useState([]);
  const [patientIdSearch, setPatientIdSearch] = useState('');
  const [showPatientList, setShowPatientList] = useState(true); // Set to true by default
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [totalPatients, setTotalPatients] = useState(0);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [prescriptionData, setPrescriptionData] = useState(initialPrescriptionState);
  const [editingQuestionnaireId, setEditingQuestionnaireId] = useState(null);
  
  const [activePhotoPopup, setActivePhotoPopup] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState({});
  const [imageIds, setImageIds] = useState({});
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [activeTab, setActiveTab] = useState('personalInfo');
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [loadingImageId, setLoadingImageId] = useState(null);
  const [followupMessages, setFollowupMessages] = useState([]);
  const [showFollowupPopup, setShowFollowupPopup] = useState(false);
  const [newFollowupMessage, setNewFollowupMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [newlyCreatedPatient, setNewlyCreatedPatient] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const handleAddNewPatient = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patient_questionnaire/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ images: [] }),
      });

      if (response.ok) {
        const newPatient = await response.json();
        setNewlyCreatedPatient(newPatient);
        setShowSuccessPopup(true);
      } else {
        console.error('Failed to create a new patient');
        alert('Failed to create a new patient. Please try again.');
      }
    } catch (error) {
      console.error('Error creating new patient:', error);
      alert('An error occurred while creating a new patient.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    if (newlyCreatedPatient) {
        handlePatientClick(newlyCreatedPatient);
        setShowPatientList(false);
        setNewlyCreatedPatient(null);
    }
  };
  // Fetch patients when component mounts
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchFollowupMessages = async (questionnaireId) => {
    if (!questionnaireId) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/physician_questionnaire/${questionnaireId}/followup-messages/`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFollowupMessages(data || []);
      } else {
        console.error('Failed to fetch followup messages');
        setFollowupMessages([]);
      }
    } catch (error) {
      console.error('Error fetching followup messages:', error);
      setFollowupMessages([]);
    }
  };

  const fetchPatients = async (page = 1, preserveSelected = false) => {
    setIsLoading(true);
    if (!showPatientList && !preserveSelected) {
      setSelectedPatient(null);
      setShowPrescriptionForm(false);
    }
    const token = localStorage.getItem('token');
    const skip = (page - 1) * patientsPerPage;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patient_questionnaire/?skip=${skip}&limit=${patientsPerPage}`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
      if (response.ok) {
        const responseData = await response.json();
        const patientsArray = responseData.data || [];
        setPatients(patientsArray);
        setTotalPatients(responseData.total || 0);
        setCurrentPage(page);
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

        const todaysQuestionnaire = data.physician_questionnaires?.find(q => isToday(q.created_at));
        
        const imageIds = {};
        const uploadedPhotos = {};

        // First, populate with the patient's own images
        data.images?.forEach(img => {
          if (img.tag) {
            imageIds[img.tag] = img.id;
            uploadedPhotos[img.tag] = true;
          }
        });

        if (todaysQuestionnaire) {
          // Then, merge images from today's questionnaire, overwriting if necessary
          todaysQuestionnaire.images?.forEach(img => {
            if (img.tag) {
              imageIds[img.tag] = img.id;
              uploadedPhotos[img.tag] = true;
            }
          });

          const processedQuestionnaire = processQuestionnaireData(todaysQuestionnaire);
          setPrescriptionData({
            ...initialPrescriptionState,
            ...processedQuestionnaire,
            patient_questionnaire_id: data.id
          });
          setEditingQuestionnaireId(todaysQuestionnaire.id);
        } else {
          setPrescriptionData({
            ...initialPrescriptionState,
            patient_questionnaire_id: data.id
          });
          setEditingQuestionnaireId(null);
          setFollowupMessages([]);
        }
        
        if (todaysQuestionnaire) {
          fetchFollowupMessages(todaysQuestionnaire.id);
        }

        setImageIds(imageIds);
        setUploadedPhotos(uploadedPhotos);

        setShowPrescriptionForm(true); // Show tabs immediately
        setActiveTab('personalInfo'); // Default to personal info
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

        const todaysQuestionnaire = data.physician_questionnaires?.find(q => isToday(q.created_at));

        const imageIds = {};
        const uploadedPhotos = {};

        // First, populate with the patient's own images
        data.images?.forEach(img => {
          if (img.tag) {
            imageIds[img.tag] = img.id;
            uploadedPhotos[img.tag] = true;
          }
        });

        if (todaysQuestionnaire) {
          // Then, merge images from today's questionnaire, overwriting if necessary
          todaysQuestionnaire.images?.forEach(img => {
            if (img.tag) {
              imageIds[img.tag] = img.id;
              uploadedPhotos[img.tag] = true;
            }
          });

          const processedQuestionnaire = processQuestionnaireData(todaysQuestionnaire);
          setPrescriptionData({
            ...initialPrescriptionState,
            ...processedQuestionnaire,
            patient_questionnaire_id: data.id
          });
          setEditingQuestionnaireId(todaysQuestionnaire.id);
        } else {
          setPrescriptionData({
            ...initialPrescriptionState,
            patient_questionnaire_id: data.id
          });
          setEditingQuestionnaireId(null);
          setFollowupMessages([]);
        }

        if (todaysQuestionnaire) {
          fetchFollowupMessages(todaysQuestionnaire.id);
        }
 
        setImageIds(imageIds);
        setUploadedPhotos(uploadedPhotos);

        setShowPatientList(false);
        setShowPrescriptionForm(true);
        setActiveTab('personalInfo');
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
    setShowPatientList(true);
    fetchPatients();
  };
  
  const handleBackToPatientDetails = () => {
    setShowPrescriptionForm(false);
    setSelectedPatient(null); // Go back to the list
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

    const token = localStorage.getItem('token');
    const patientPhotoKeys = photoSites.map(site => site.key);
    
    const patientImageIds = [];
    const physicianImageIds = [];

    for (const key in imageIds) {
      if (patientPhotoKeys.includes(key)) {
        patientImageIds.push(imageIds[key]);
      } else {
        physicianImageIds.push(imageIds[key]);
      }
    }

    try {
      // API Call 1: Update patient's images
      const patientUpdateResponse = await fetch(`${API_BASE_URL}/api/v1/patient_questionnaire/${selectedPatient.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ images: patientImageIds }),
      });

      if (!patientUpdateResponse.ok) {
        const errorData = await patientUpdateResponse.json();
        throw new Error(`Failed to update patient images: ${JSON.stringify(errorData)}`);
      }

      // API Call 2: Submit physician questionnaire
      const physicianDataToSend = {
        ...prescriptionData,
        size: prescriptionData.size ? Number(prescriptionData.size) : 0,
        time_period_months: prescriptionData.time_period_months ? Number(prescriptionData.time_period_months) : null,
        images: physicianImageIds,
      };

      // Append "Other" text to the main field if "Other" is selected
      if (physicianDataToSend.oropharyngeal_lesion_information?.includes('Other') && physicianDataToSend.other_oropharyngeal_lesion_information_text) {
        physicianDataToSend.oropharyngeal_lesion_information = physicianDataToSend.oropharyngeal_lesion_information.replace('Other', `Other: ${physicianDataToSend.other_oropharyngeal_lesion_information_text}`);
      }
      if (physicianDataToSend.clinical_examination_findings?.includes('Other') && physicianDataToSend.other_clinical_examination_findings_text) {
        physicianDataToSend.clinical_examination_findings = physicianDataToSend.clinical_examination_findings.replace('Other', `Other: ${physicianDataToSend.other_clinical_examination_findings_text}`);
      }

      const isUpdate = !!editingQuestionnaireId;
      const url = isUpdate
        ? `${API_BASE_URL}/api/v1/physician_questionnaire/${editingQuestionnaireId}/`
        : `${API_BASE_URL}/api/v1/physician_questionnaire/`;
      const method = isUpdate ? 'PUT' : 'POST';

      const physicianResponse = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(physicianDataToSend),
      });

      if (!physicianResponse.ok) {
        const errorData = await physicianResponse.json();
        throw new Error(`Failed to ${isUpdate ? 'update' : 'add'} prescription: ${JSON.stringify(errorData)}`);
      }

      alert(`Prescription ${isUpdate ? 'updated' : 'added'} successfully!`);
      setUploadedPhotos({});
      setImageIds({});
      await handlePatientClick(selectedPatient);

    } catch (error) {
      console.error('Error during submission:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndViewImage = async (imageId, tag) => {
    setLoadingImageId(imageId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/image/${imageId}`);
      if (response.ok) {
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setCurrentImage({ url: imageUrl, tag: tag });
        setImageViewerOpen(true);
      } else {
        console.error('Failed to fetch image');
        alert('Failed to load image.');
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      alert('An error occurred while fetching the image.');
    } finally {
      setLoadingImageId(null);
    }
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    if (currentImage && currentImage.url) {
      URL.revokeObjectURL(currentImage.url);
    }
    setCurrentImage(null);
  };

  const ImageViewer = () => {
    if (!imageViewerOpen || !currentImage) return null;
    return (
      <div className="popup-overlay">
        <div className="popup-container image-viewer-container">
          <div className="popup-header">
            <h3>{currentImage.tag}</h3>
            <button className="close-button" onClick={closeImageViewer}>×</button>
          </div>
          <div className="popup-content">
            <img src={currentImage.url} alt={currentImage.tag} className="image-preview" />
          </div>
        </div>
      </div>
    );
  };

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    if (!newFollowupMessage.trim()) {
      alert('Please enter a message.');
      return;
    }
    if (!editingQuestionnaireId) {
      alert('Cannot add followup without a questionnaire.');
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/physician_questionnaire/${editingQuestionnaireId}/followup-messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          message: newFollowupMessage,
          physician_questionnaire_id: editingQuestionnaireId
        }),
      });

      if (response.ok) {
        alert('Follow-up message added successfully!');
        setShowFollowupPopup(false);
        setNewFollowupMessage('');
        fetchFollowupMessages(editingQuestionnaireId);
      } else {
        const errorData = await response.json();
        throw new Error(`Failed to add follow-up message: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error submitting follow-up:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
 
  const formatBoolean = (value) => {
    if (value === true || value === 'yes') return 'Yes';
    if (value === false || value === 'no') return 'No';
    return 'Not provided';
  };

  const getInitial = (identifier) => {
    return identifier && identifier.length > 0 ? identifier[0].toUpperCase() : '?';
  };

  const getRandomColor = (identifier) => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0',
      '#33FFF0', '#F0FF33', '#FF3333', '#33FF33', '#3333FF'
    ];
    
    // Simple hash function to get consistent color for the same identifier
    let hash = 0;
    if (identifier && identifier.length > 0) {
      for (let i = 0; i < identifier.length; i++) {
        hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  const processQuestionnaireData = (questionnaire) => {
    if (!questionnaire) return questionnaire;

    const processedData = { ...questionnaire };

    const processField = (fieldName, textFieldName) => {
      if (typeof processedData[fieldName] === 'string') {
        const values = processedData[fieldName].split(', ');
        const otherIndex = values.findIndex(v => v.startsWith('Other:'));
        
        if (otherIndex > -1) {
          const otherValue = values[otherIndex];
          processedData[textFieldName] = otherValue.substring('Other: '.length);
          
          // Replace "Other: ..." with just "Other"
          values[otherIndex] = 'Other';
          processedData[fieldName] = values.join(', ');
        }
      }
    };

    processField('oropharyngeal_lesion_information', 'other_oropharyngeal_lesion_information_text');
    processField('clinical_examination_findings', 'other_clinical_examination_findings_text');
    
    return processedData;
  };

  const renderPatientInformation = () => (
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
  );

  const paginate = (pageNumber) => {
    fetchPatients(pageNumber);
  };

  return (
    <div className="questionnaire-container">
     <PhysicianActions onAddNewPatient={handleAddNewPatient} />
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
              />
              <button
                type="submit"
                className="search-button"
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
                  style={{ backgroundColor: getRandomColor(patient.patient_identification_number) }}
                >
                  {getInitial(patient.patient_identification_number)}
                </div>
                <div className="patient-id">{patient.patient_identification_number}</div>
              </div>
            ))}
            
            {patients.length === 0 && (
              <div className="no-results">No patients found</div>
            )}
          </div>
          <Pagination
            patientsPerPage={patientsPerPage}
            totalPatients={totalPatients}
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      )}
      
      {selectedPatient && showPrescriptionForm && (
        <div className="prescription-form-container">
          <div className="patient-details-header">
            <button className="back-button" onClick={handleBackToList}>
              ← Back to Patient List
            </button>
            <h2>Patient: {selectedPatient.patient_identification_number}</h2>
          </div>

          <div className="tab-switcher">
            <button
              className={`tab-button ${activeTab === 'personalInfo' ? 'active' : ''}`}
              onClick={() => setActiveTab('personalInfo')}
            >
              Personal Information
            </button>
            <button
              className={`tab-button ${activeTab === 'questionnaire' ? 'active' : ''}`}
              onClick={() => setActiveTab('questionnaire')}
            >
              Questionnaire
            </button>
            <button
              className={`tab-button ${activeTab === 'followups' ? 'active' : ''}`}
              onClick={() => setActiveTab('followups')}
            >
              Follow-ups
            </button>
          </div>
 
          {activeTab === 'personalInfo' && (
            <div className="patient-details-content">
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
                  {[
                    { key: 'tobacco_chewing', label: 'Tobacco Chewing' },
                    { key: 'betel_nut_chewing', label: 'Betel Nut Chewing' },
                    { key: 'gutkha_chewing', label: 'Gutkha Chewing' },
                    { key: 'betel_quid_chewing', label: 'Betel Quid Chewing' },
                    { key: 'mishri_use', label: 'Mishri Use' },
                  ].map(habit => {
                    const frequency = selectedPatient[`${habit.key}_frequency`];
                    const duration = selectedPatient[`${habit.key}_duration`];

                    if (!frequency && !duration) {
                      return null;
                    }

                    let displayText;
                    const durationText = duration ? `for ${duration} years` : '';

                    if (frequency) {
                      switch (frequency) {
                        case 'never':
                          displayText = 'Never';
                          break;
                        case 'weekly':
                          displayText = `Weekly ${durationText}`;
                          break;
                        case 'ex_user':
                          displayText = `Ex-user (used ${durationText})`;
                          break;
                        default:
                          if (!isNaN(frequency) && parseFloat(frequency) > 0) {
                            displayText = `Daily, ${frequency} times per day ${durationText}`;
                          } else if (isNaN(frequency) && frequency) {
                            displayText = `${frequency} ${durationText}`;
                          }
                      }
                    } else if (duration) {
                      displayText = `Used for ${duration} years`;
                    }

                    if (!displayText) {
                      return null;
                    }

                    return (
                      <div className="detail-item" key={habit.key}>
                        <span className="detail-label">{habit.label}:</span>
                        <span className="detail-value">{displayText.trim()}</span>
                      </div>
                    );
                  })}
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
            </div>
          )}

          {activeTab === 'questionnaire' && (
            <form onSubmit={handlePrescriptionSubmit} className="prescription-form" style={{ opacity: isLoading ? 0.7 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
              <div className="form-group">
                <label>Comorbidities:</label>
                {Object.entries(comorbiditiesOptions).map(([category, options]) => (
                  <div key={category} className="comorbidity-category" style={{ marginBottom: '15px' }}>
                    <strong style={{ display: 'block', marginBottom: '5px', color: '#2c3e50' }}>{category}</strong>
                    <div className="checkbox-grid">
                      {options.map(option => (
                        <React.Fragment key={option.name}>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              name={option.name}
                              checked={!!prescriptionData[option.name]}
                              onChange={handlePrescriptionChange}
                            />
                            {option.label}
                          </label>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Patient Photographs:</label>
                <div className="multi-input-group">
                  {photoSites.map(site => (
                    <div key={site.key} className="file-input-container">
                      <label>{site.label}:</label>
                      <div className="button-group">
                        {uploadedPhotos[site.key] && imageIds[site.key] && (
                          <button
                            type="button"
                            className="file-view-button"
                            onClick={() => fetchAndViewImage(imageIds[site.key], site.key)}
                            disabled={loadingImageId === imageIds[site.key]}
                          >
                            {loadingImageId === imageIds[site.key] ? 'Loading...' : 'View'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="file-upload-button"
                          onClick={() => openPhotoPopup(site.key)}
                        >
                          {uploadedPhotos[site.key] ? 'Change Photo' : 'Add Photo'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
              <label>Physician Photographs (with size measuring function):</label>
              <div className="multi-input-group">
                {[1, 2, 3, 4, 5, 6].map(num => {
                  const site = `Photograph_Site_${num}`;
                 return (
                   <div key={site} className="file-input-container">
                     <label>Site {num}:</label>
                     <div className="button-group">
                       {uploadedPhotos[site] && imageIds[site] && (
                         <button
                           type="button"
                           className="file-view-button"
                           onClick={() => fetchAndViewImage(imageIds[site], site)}
                           disabled={loadingImageId === imageIds[site]}
                         >
                           {loadingImageId === imageIds[site] ? 'Loading...' : 'View'}
                         </button>
                       )}
                       <button
                         type="button"
                         className="file-upload-button"
                         onClick={() => openPhotoPopup(site)}
                       >
                         {uploadedPhotos[site] ? 'Change Photo' : 'Upload Photo'}
                       </button>
                     </div>
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
              {prescriptionData.oropharyngeal_lesion_information && prescriptionData.oropharyngeal_lesion_information.split(', ').includes('Other') && (
                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label htmlFor="other_oropharyngeal_lesion_information_text">Please specify:</label>
                  <input
                    type="text"
                    id="other_oropharyngeal_lesion_information_text"
                    name="other_oropharyngeal_lesion_information_text"
                    value={prescriptionData.other_oropharyngeal_lesion_information_text || ''}
                    onChange={handlePrescriptionChange}
                    placeholder="Specify other lesion information"
                  />
                </div>
              )}
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
              {prescriptionData.clinical_examination_findings && prescriptionData.clinical_examination_findings.split(', ').includes('Other') && (
                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label htmlFor="other_clinical_examination_findings_text">Please specify:</label>
                  <input
                    type="text"
                    id="other_clinical_examination_findings_text"
                    name="other_clinical_examination_findings_text"
                    value={prescriptionData.other_clinical_examination_findings_text || ''}
                    onChange={handlePrescriptionChange}
                    placeholder="Specify other findings"
                  />
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="cancerous_lesion">Cancerous Lesion:</label>
              <select
                id="cancerous_lesion"
                name="cancerous_lesion"
                value={prescriptionData.cancerous_lesion}
                onChange={handlePrescriptionChange}
              >
                <option value="">-- Select Type --</option>
                <option value="benign">Benign</option>
                <option value="malignant_scc">Malignant (SCC)</option>
                <option value="malignant_other">Malignant (Other)</option>
              </select>
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
                     <div className="button-group">
                       {uploadedPhotos[site] && imageIds[site] && (
                         <button
                           type="button"
                           className="file-view-button"
                           onClick={() => fetchAndViewImage(imageIds[site], site)}
                           disabled={loadingImageId === imageIds[site]}
                         >
                           {loadingImageId === imageIds[site] ? 'Loading...' : 'View'}
                         </button>
                       )}
                       <button
                         type="button"
                         className="file-upload-button"
                         onClick={() => openPhotoPopup(site)}
                       >
                         {uploadedPhotos[site] ? 'Change Slide' : 'Upload Slide'}
                       </button>
                     </div>
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
                    Submitting...
                  </div>
                ) : (editingQuestionnaireId ? 'Update' : 'Submit')}
              </button>
              <button type="button" className="cancel-button" onClick={handleBackToPatientDetails} disabled={isLoading}>Cancel</button>
            </div>
            </form>
          )}

          {activeTab === 'followups' && (
            <div className="followups-content">
              <h3>Follow-up Messages</h3>
              <button onClick={() => setShowFollowupPopup(true)} className="add-followup-button">
                Add Follow-up
              </button>
              <div className="followup-list">
                {followupMessages.length > 0 ? (
                  followupMessages.map(msg => (
                    <div key={msg.id} className="followup-item">
                      <p className="followup-message">{msg.message}</p>
                      <p className="followup-meta">
                        On {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No follow-up messages for this questionnaire yet.</p>
                )}
              </div>
            </div>
          )}
          
          {activePhotoPopup && (
            <FileUploadPopup
              isOpen={!!activePhotoPopup}
              onClose={closePhotoPopup}
              onFileSelect={handlePhotoSelect}
              site={activePhotoPopup}
            />
          )}

          {showFollowupPopup && (
            <div className="popup-overlay">
              <div className="popup-container">
                <div className="popup-header">
                  <h3>Add Follow-up Message</h3>
                  <button className="close-button" onClick={() => setShowFollowupPopup(false)}>×</button>
                </div>
                <form onSubmit={handleFollowupSubmit} className="popup-content">
                  <textarea
                    value={newFollowupMessage}
                    onChange={(e) => setNewFollowupMessage(e.target.value)}
                    placeholder="Enter your follow-up note here..."
                    rows="5"
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                  />
                  <div className="popup-footer">
                    <button type="submit" className="confirm-button" disabled={isLoading}>
                      {isLoading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
                <div className="detail-item full-width">
                  <span className="detail-label">Images:</span>
                  <div className="detail-value image-gallery">
                    {selectedFollowUp.images && selectedFollowUp.images.length > 0 ? (
                      selectedFollowUp.images.map(image => (
                        <button
                          key={image.id}
                          type="button"
                          className="file-view-button"
                          onClick={() => fetchAndViewImage(image.id, image.tag || 'Image')}
                          disabled={loadingImageId === image.id}
                        >
                          {loadingImageId === image.id ? 'Loading...' : `View ${image.tag || 'Image'}`}
                        </button>
                      ))
                    ) : 'No images'}
                  </div>
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button className="confirm-button" onClick={closeFollowUpPopup}>Close</button>
            </div>
          </div>
        </div>
      )}
      <ImageViewer />
      {showSuccessPopup && newlyCreatedPatient && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-header">
              <h3>Patient Created Successfully</h3>
              <button className="close-button" onClick={handleCloseSuccessPopup}>×</button>
            </div>
            <div className="popup-content">
              <p>A new patient record has been created.</p>
              <p><strong>Patient ID:</strong> {newlyCreatedPatient.patient_identification_number}</p>
            </div>
            <div className="popup-footer">
              <button className="confirm-button" onClick={handleCloseSuccessPopup}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Pagination = ({ patientsPerPage, totalPatients, paginate, currentPage }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalPatients / patientsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination">
        {currentPage > 1 && (
          <li className="page-item">
            <a onClick={() => paginate(currentPage - 1)} href="#!" className="page-link">
              Previous
            </a>
          </li>
        )}
        {pageNumbers.map(number => (
          <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <a onClick={() => paginate(number)} href="#!" className="page-link">
              {number}
            </a>
          </li>
        ))}
        {currentPage < totalPages && (
          <li className="page-item">
            <a onClick={() => paginate(currentPage + 1)} href="#!" className="page-link">
              Next
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default PhysicianQuestionnaire;

