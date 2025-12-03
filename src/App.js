import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import PatientQuestionnaire from './PatientQuestionnaire';
import PhysicianQuestionnaire from './PhysicianQuestionnaire';
import Login from './Login';
import LanguageSelection from './LanguageSelection';
import PatientTypeSelection from './PatientTypeSelection';
import { LanguageProvider } from './LanguageContext';
import './App.css';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const navigate = useNavigate();
  const [languageSelected, setLanguageSelected] = useState(false);
  const [patientTypeSelected, setPatientTypeSelected] = useState(false);
  const [generatedPatientId, setGeneratedPatientId] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleLanguageSelect = () => {
    setLanguageSelected(true);
  };

  const [existingPatientData, setExistingPatientData] = useState(null);

  const handlePatientTypeSelect = (type, data) => {
    setPatientTypeSelected(true);
    if (type === 'new') {
      setGeneratedPatientId(data);
      setExistingPatientData(null); // Reset existing data when creating a new patient
    } else if (type === 'existing') {
      setGeneratedPatientId(null); // Reset generated ID when using existing patient
      setExistingPatientData(data);
      console.log('Setting existing patient data:', data); // Log for debugging
    }
  };

  return (
    <div className="App">
      {(location.pathname === '/physician' || (isAuthenticated && location.pathname === '/patient')) && (
        <nav className="main-nav">
          {isAuthenticated && location.pathname === '/patient' && (
            <Link to="/physician" className="back-to-selection">← Back to Physician Details</Link>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="logout-button">Logout</button>
          )}
        </nav>
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/patient" />} />
        <Route
          path="/patient"
          element={
            !languageSelected ? (
              <LanguageSelection onLanguageSelect={handleLanguageSelect} />
            ) : !patientTypeSelected ? (
              <PatientTypeSelection onPatientTypeSelect={handlePatientTypeSelect} />
            ) : (
              <PatientQuestionnaire
                initialPatientId={generatedPatientId}
                existingData={existingPatientData}
              />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/physician"
          element={
            <PrivateRoute>
              <PhysicianQuestionnaire />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
