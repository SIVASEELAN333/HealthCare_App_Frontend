import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ViewReports.css';

const ViewReports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get('http://localhost:8081/api/reports')
      .then(res => setReports(res.data))
      .catch(err => console.error('Error fetching reports:', err));
  };

  const handleOpinionSubmit = async () => {
  if (!doctorName || !hospitalName || !licenseNumber || !suggestion) {
    setError('Please fill all fields before submitting.');
    return;
  }

  try {
    setIsSending(true);
    const res = await axios.post(
      `http://localhost:8081/api/reports/${selectedReport.id}/opinion`,
      { doctorName, hospitalName, licenseNumber, suggestion }
    );

    if (res.data.success) {
      setSuccess('✅ Opinion sent successfully to the patient.');
      setError('');

      // 🟢 Refetch and hide the form after short delay
      setTimeout(async () => {
        setSelectedReport(null); // hide form
        setDoctorName('');
        setHospitalName('');
        setLicenseNumber('');
        setSuggestion('');
        setSuccess('');
        await fetchData(); // refetch reports
      }, 1000);
    } else {
      setError(res.data.message || 'Verification failed. Doctor details incorrect.');
      setSuccess('');
    }
  } catch (err) {
    console.error(err);
    setError('Error submitting opinion.');
  } finally {
    setIsSending(false);
  }
};


  const handleCancelOpinion = () => {
    setSelectedReport(null);
    setDoctorName('');
    setHospitalName('');
    setLicenseNumber('');
    setSuggestion('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="view-reports-container">
      <h2>📑 Uploaded Patient Reports</h2>

      {selectedReport ? (
        <div className="opinion-form">
          <h3>🩺 Doctor Opinion Form</h3>
          <input type="text" placeholder="Doctor Name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
          <input type="text" placeholder="Hospital Name" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
          <input type="text" placeholder="License Number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
          <textarea placeholder="Your Suggestion" value={suggestion} onChange={(e) => setSuggestion(e.target.value)} rows={4} />

          <div className="form-buttons">
            <button className="send-button" onClick={handleOpinionSubmit} disabled={isSending}>
              📩 {isSending ? 'Sending...' : 'Send Opinion'}
            </button>
            <button className="cancel-button" onClick={handleCancelOpinion} disabled={isSending}>❌ Cancel</button>
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </div>
      ) : (
        reports
          .filter(report => !report.licenseNumber) // only show unopined reports
          .map(report => (
            <div className="report-card" key={report.id}>
              <p><strong>Patient:</strong> {report.patientName}</p>
              <p><strong>Email:</strong> {report.email}</p>
              <p><strong>DOB:</strong> {report.dob}</p>
              <p><strong>Question:</strong> {report.question}</p>
              <a href={`http://localhost:8081/api/reports/file/${report.fileName}`} target="_blank" rel="noreferrer">📥 Download File</a>
              <button
                className="give-opinion-button"
                disabled={selectedReport && selectedReport.id !== report.id} // disable only the selected report
                onClick={() => setSelectedReport(report)}
              >
                🩺 Give Opinion
              </button>
            </div>
          ))
      )}
    </div>
  );
};

export default ViewReports;
