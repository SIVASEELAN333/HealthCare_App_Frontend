import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UploadReport.css';

const UploadReport = () => {
  const [patientName, setPatientName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // ✅ Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|mil|co|io|info|biz|me|us|uk|ca|au)$/i;

  const handleUpload = async (e) => {
    e.preventDefault();

    // ✅ Check required fields
    if (!patientName || !dob || !email || !question || !reportFile) {
      setErrorMsg('Please fill in all fields');
      setSuccessMsg('');
      return;
    }

    // ✅ Validate email
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address');
      setSuccessMsg('');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('patientName', patientName);
      formData.append('dob', dob);
      formData.append('email', email);
      formData.append('question', question);
      formData.append('file', reportFile);

      const res = await axios.post('http://localhost:8081/api/reports/upload1', formData);

      if (res.data.success) {
        setSuccessMsg('Report uploaded successfully!');
        setErrorMsg('');

        // Clear fields
        setPatientName('');
        setDob('');
        setEmail('');
        setQuestion('');
        setReportFile(null);

        // Redirect after 1.5s
        setTimeout(() => {
          navigate('/report-analysis');
        }, 1500);
      } else {
        setErrorMsg('Failed to upload report');
        setSuccessMsg('');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error uploading report. Please try again.');
      setSuccessMsg('');
    }
  };

  return (
    <div className="upload-report-container">
      <h2>Upload Patient Report</h2>

      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
        <input
          type="date"
          placeholder="Date of Birth"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          placeholder="What do you want from this report?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={(e) => setReportFile(e.target.files[0])}
        />

        <button type="submit">Upload</button>

        {successMsg && <p className="success">{successMsg}</p>}
        {errorMsg && <p className="error">{errorMsg}</p>}
      </form>
    </div>
  );
};

export default UploadReport;
