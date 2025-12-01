import React, { useState } from 'react';
import './Questionnaire.css';
import FileUploadPopup from './FileUploadPopup';

const PatientQuestionnaire = () => {
  const [photos, setPhotos] = useState({});
  const [activePhotoPopup, setActivePhotoPopup] = useState(null);

  const handleFileChange = (e, site) => {
    if (e.target.files && e.target.files[0]) {
      setPhotos(prevPhotos => ({
        ...prevPhotos,
        [site]: e.target.files[0]
      }));
    }
  };

  const handlePhotoSelect = (file, site) => {
    setPhotos(prevPhotos => ({
      ...prevPhotos,
      [site]: file
    }));
  };

  const openPhotoPopup = (site) => {
    setActivePhotoPopup(site);
  };

  const closePhotoPopup = () => {
    setActivePhotoPopup(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    alert('Form submitted successfully!');
  };

  return (
    <div className="questionnaire-container">
      <h1>Patient Questionnaire</h1>
      <form onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <div className="section-header">Personal Information</div>
        <div className="form-group">
          <label>Patient Identification Number:</label>
          <input type="text" />
        </div>
        <div className="form-group">
          <label>Age:</label>
          <input type="text" placeholder="Enter your age" />
        </div>
        <div className="form-group">
          <label>Gender:</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="male" name="gender" value="male" />
              <label htmlFor="male">Male</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="female" name="gender" value="female" />
              <label htmlFor="female">Female</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Ethnicity:</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="indian" name="ethnicity" value="indian" />
              <label htmlFor="indian">Indian</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="other_ethnicity" name="ethnicity" value="other" />
              <label htmlFor="other_ethnicity">Other:</label>
              <input type="text" placeholder="Please specify" />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Highest level of education completed:</label>
          <select>
            <option value="">-- Select Education Level --</option>
            <option value="primary">Primary school (5-12 years)</option>
            <option value="middle">Middle school (12-14 years)</option>
            <option value="secondary">Secondary school (14-16 years)</option>
            <option value="senior">Senior secondary school (16-18)</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="postgraduate">Postgraduate</option>
          </select>
        </div>
        <div className="form-group">
          <label>Current or previous occupation:</label>
          <input type="text" placeholder="Enter your occupation" />
        </div>
        <div className="form-group">
          <label>Do you own a smartphone?</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="smartphone_yes" name="smartphone" value="yes" />
              <label htmlFor="smartphone_yes">Yes</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="smartphone_no" name="smartphone" value="no" />
              <label htmlFor="smartphone_no">No</label>
            </div>
          </div>
        </div>

        {/* Health Awareness Section */}
        <div className="section-header">Health Awareness</div>
        <div className="form-group">
          <label>Can chewing betel nut / areca nut / supari cause cancer?</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="cancer_awareness_yes" name="cancer_awareness" value="yes" />
              <label htmlFor="cancer_awareness_yes">Yes</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="cancer_awareness_no" name="cancer_awareness" value="no" />
              <label htmlFor="cancer_awareness_no">No</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Family history of oral cavity cancer?</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="family_history_yes" name="family_history" value="yes" />
              <label htmlFor="family_history_yes">Yes</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="family_history_no" name="family_history" value="no" />
              <label htmlFor="family_history_no">No</label>
            </div>
          </div>
        </div>

        {/* Lifestyle Habits Section */}
        <div className="section-header">Lifestyle Habits</div>
        <div className="form-group">
          <label>Smoking Status:</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="smoker" name="smoking_status" value="smoker" />
              <label htmlFor="smoker">Smoker</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="ex_smoker" name="smoking_status" value="ex-smoker" />
              <label htmlFor="ex_smoker">Ex-smoker</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="never_smoked" name="smoking_status" value="never" />
              <label htmlFor="never_smoked">Never smoked</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>If smoker or ex-smoker:</label>
          <div className="multi-input-group">
            <div>
              <label>Years of smoking:</label>
              <input type="text" placeholder="Number of years" />
            </div>
            <div>
              <label>Packs per day:</label>
              <input type="text" placeholder="Number of packs" />
            </div>
            <div>
              <label>If ex-smoker, years since stopping:</label>
              <input type="text" placeholder="Number of years" />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Alcohol Consumption:</label>
          <input type="text" placeholder="Estimate units per week" />
        </div>

        {/* Oral Habits Section */}
        <div className="section-header">Oral Habits</div>
        <div className="form-group">
          <label>Tobacco chewing:</label>
          <div className="multi-input-group">
            <input type="text" placeholder="Frequency" />
            <input type="text" placeholder="Duration" />
          </div>
        </div>
        <div className="form-group">
          <label>Betel nut (supari) chewing:</label>
          <div className="multi-input-group">
            <input type="text" placeholder="Frequency" />
            <input type="text" placeholder="Duration" />
          </div>
        </div>
        <div className="form-group">
          <label>Gutkha chewing:</label>
          <div className="multi-input-group">
            <input type="text" placeholder="Frequency" />
            <input type="text" placeholder="Duration" />
          </div>
        </div>
        <div className="form-group">
          <label>Betel quid chewing:</label>
          <div className="multi-input-group">
            <input type="text" placeholder="Frequency" />
            <input type="text" placeholder="Duration" />
          </div>
        </div>
        <div className="form-group">
          <label>Mishri use:</label>
          <div className="multi-input-group">
            <input type="text" placeholder="Frequency" />
            <input type="text" placeholder="Duration" />
          </div>
        </div>

        {/* Symptoms Section */}
        <div className="section-header">Symptoms</div>
        <div className="form-group">
          <label>Do you have any lumps, lesions or ulcers in the mouth or throat which are not healing?</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms1_yes" name="symptoms1" value="yes" />
              <label htmlFor="symptoms1_yes">Yes</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms1_no" name="symptoms1" value="no" />
              <label htmlFor="symptoms1_no">No</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Do you have any soreness or pain in your mouth or throat?</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms2_yes" name="symptoms2" value="yes" />
              <label htmlFor="symptoms2_yes">Yes</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms2_no" name="symptoms2" value="no" />
              <label htmlFor="symptoms2_no">No</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Do you have any pain when you swallow?</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms3_yes" name="symptoms3" value="yes" />
              <label htmlFor="symptoms3_yes">Yes</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms3_no" name="symptoms3" value="no" />
              <label htmlFor="symptoms3_no">No</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Do you have any difficulty swallowing?</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms4_yes" name="symptoms4" value="yes" />
              <label htmlFor="symptoms4_yes">Yes</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms4_no" name="symptoms4" value="no" />
              <label htmlFor="symptoms4_no">No</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Do you have any difficulty moving your tongue?</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms5_yes" name="symptoms5" value="yes" />
              <label htmlFor="symptoms5_yes">Yes</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms5_no" name="symptoms5" value="no" />
              <label htmlFor="symptoms5_no">No</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Do you have any difficulty opening or moving your jaw?</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms6_yes" name="symptoms6" value="yes" />
              <label htmlFor="symptoms6_yes">Yes</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms6_no" name="symptoms6" value="no" />
              <label htmlFor="symptoms6_no">No</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Do you have any white patches inside your mouth?</label>
          <div className="radio-group">
            <div className="radio-option">
              <input type="radio" id="symptoms7_yes" name="symptoms7" value="yes" />
              <label htmlFor="symptoms7_yes">Yes</label>
            </div>
            <div className="radio-option">
              <input type="radio" id="symptoms7_no" name="symptoms7" value="no" />
              <label htmlFor="symptoms7_no">No</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Duration of symptoms:</label>
          <select>
            <option value="">-- Select Duration --</option>
            <option value="less_than_2_weeks">Less than 2 weeks</option>
            <option value="2_weeks_to_3_months">2 weeks – 3 months</option>
            <option value="3_to_6_months">3 – 6 months</option>
            <option value="6_to_12_months">6 - 12 months</option>
            <option value="1_to_3_years">1 – 3 years</option>
            <option value="more_than_3_years">More than 3 years</option>
          </select>
        </div>

        {/* Documentation Section */}
        <div className="section-header">Documentation</div>
        <div className="form-group">
          <label>Photographs:</label>
          <div className="multi-input-group">
            {[1, 2, 3, 4, 5, 6].map(site => (
              <div key={site} className="file-input-container">
                <label>Site {site}:</label>
                <button 
                  type="button" 
                  className="file-upload-button"
                  onClick={() => openPhotoPopup(`site${site}`)}
                >
                  {photos[`site${site}`] ? 'Change Photo' : 'Add Photo'}
                </button>
                {photos[`site${site}`] && (
                  <div className="file-item">
                    {photos[`site${site}`].name}
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
              site={activePhotoPopup.replace('site', '')}
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="form-group">
          <button type="submit" className="submit-button">Submit </button>
        </div>
      </form>
    </div>
  );
};

export default PatientQuestionnaire;
