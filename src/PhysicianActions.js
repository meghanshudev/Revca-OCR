import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PhysicianActions.css';

const PhysicianActions = () => {
  const navigate = useNavigate();

  const handleAddNewPatient = () => {
    navigate('/patient');
  };

  return (
    <div className="physician-actions-container">
      <h2>Physician Actions</h2>
      <div className="physician-actions-buttons">
        <button onClick={handleAddNewPatient} className="action-button">Add New Patient</button>
      </div>
    </div>
  );
};

export default PhysicianActions;
