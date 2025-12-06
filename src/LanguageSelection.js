import React from 'react';
import { useLanguage } from './LanguageContext';
import './LanguageSelection.css';

const LanguageSelection = ({ onLanguageSelect }) => {
  const { setLanguage } = useLanguage();

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    onLanguageSelect();
  };

  return (
    <div className="language-selection-container">––
      <h1>Select Language / भाषा चुनें / भाषा निवडा </h1>
      <div className="language-buttons">
        <button onClick={() => handleLanguageSelect('en')} className="language-button">
          English
        </button>
        <button onClick={() => handleLanguageSelect('hi')} className="language-button">
          हिंदी (Hindi)
        </button>
        <button onClick={() => handleLanguageSelect('mr')} className="language-button">
          मराठी (Marathi)
        </button>
      </div>
    </div>
  );
};

export default LanguageSelection;