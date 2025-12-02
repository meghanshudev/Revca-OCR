import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Questionnaire.css';
import { API_BASE_URL } from './config';
import PhysicianActions from './PhysicianActions';
import './PhysicianActions.css';
import Loader from './Loader';

const PhysicianQuestionnaire = () => {
  const [patients, setPatients] = useState([]);
  const [showPatientList, setShowPatientList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPatients = async () => {
    setIsLoading(true);
    setShowPatientList(false);
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

  return (
    <div className="questionnaire-container">
      <PhysicianActions onViewPatients={fetchPatients} />
      {isLoading && <Loader />}
      {showPatientList && !isLoading && (
        <div className="patient-list-container">
          <h2>All Patients</h2>
          <ul>
            {patients.map(patient => (
              <li key={patient.id}>{patient.email}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PhysicianQuestionnaire;
