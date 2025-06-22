import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './DoctorLogin.css'; // optional

const DoctorLogin = () => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [secretNumber, setSecretNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      const res = await axios.post('http://localhost:8081/api/doctors/verify', {
        licenseNumber,
        secretNumber,
      });

      if (res.data.success) {
        navigate('/doctor/appointments', { state: { doctorId: licenseNumber } });
      } else {
        setError('Invalid license or secret number');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };

  return (
    <div className="doctor-login">
      <h2>Doctor Verification</h2>
      <input
        type="text"
        placeholder="License Number"
        value={licenseNumber}
        onChange={(e) => setLicenseNumber(e.target.value)}
      />
      <input
        type="password"
        placeholder="Secret Number"
        value={secretNumber}
        onChange={(e) => setSecretNumber(e.target.value)}
      />
      <button onClick={handleVerify}>Verify</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default DoctorLogin;
