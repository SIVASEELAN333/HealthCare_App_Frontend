import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ReportAnalysis.css';

const ReportAnalysis = () => {
  const navigate = useNavigate();
  const [showDoctorLogin, setShowDoctorLogin] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ new state

  const handleDoctorVerify = async () => {
    setIsSubmitting(true); // ✅ show loading
    try {
      const res = await axios.post('http://localhost:8081/api/doctors/verify', {
        licenseNumber,
        secretNumber: secretKey,
      });

      if (res.data.success) {
        navigate('/view-reports', { state: { doctorId: licenseNumber } });
      } else {
        setLoginError('Invalid license number or secret key');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false); // ✅ stop loading when done
    }
  };

  return (
    <div className="report-analysis-container">
      {/* 🏠 Dashboard Button at top-left of page */}
      <button className="dashboard-back-btn" onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>

      <h2>📝 Report Analysis</h2>

      <div className="report-buttons">
        <button onClick={() => navigate('/upload')}>📤 Upload Report</button>
        <button onClick={() => setShowDoctorLogin(true)}>📄 View Reports</button>
      </div>

      {showDoctorLogin && (
        <div className="doctor-login-form">
          {/* 🔙 Back inside the login form */}
          <button className="back-btn-form" onClick={() => setShowDoctorLogin(false)}>🔙 Back</button>

          <h3>🔐 Doctor Verification</h3>
          <input
            type="text"
            placeholder="License Number"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
          />
          <input
            type="password"
            placeholder="Secret Key"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
          />
          <button onClick={handleDoctorVerify} disabled={isSubmitting}>
            {isSubmitting ? '⏳ Submitting...' : '✅ Submit'}
          </button>
          {loginError && <p className="error-message">{loginError}</p>}
        </div>
      )}
    </div>
  );
};

export default ReportAnalysis;
