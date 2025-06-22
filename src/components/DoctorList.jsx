import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './DoctorList.css';
import { FaTags } from 'react-icons/fa';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('hospitalName');
  const [messageDoctorId, setMessageDoctorId] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [secretNumber, setSecretNumber] = useState('');
  const [messages, setMessages] = useState({});
  const [showAddMessage, setShowAddMessage] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rankMap, setRankMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch leaderboard data
    axios.get('http://localhost:8081/api/reports/leaderboard')
      .then(res => {
        const map = {};
        res.data.slice(0, 10).forEach((doc, i) => {
          map[doc.licenseNumber] = i + 1;
        });
        setRankMap(map);
      })
      .catch(err => console.error('Leaderboard fetch error', err));
  }, []);

  useEffect(() => {
  // Fetch doctors and annotate trending based on rankMap
  axios.get('http://localhost:8081/api/doctors')
    .then(res => {
      const allDoctors = res.data.map(doc => {
        const rank = rankMap[doc.licenseNumber];
        return {
          ...doc,
          isTrending: typeof rank === 'number',
          rank: rank || null,
        };
      });

      // Sort: Top 10 ranked first (by rank ascending), then others alphabetically
      const topDoctors = allDoctors
        .filter(doc => doc.isTrending)
        .sort((a, b) => a.rank - b.rank);

      const otherDoctors = allDoctors
        .filter(doc => !doc.isTrending)
        .sort((a, b) => a.name.localeCompare(b.name));

      const orderedDoctors = [...topDoctors, ...otherDoctors];

      setDoctors(orderedDoctors);
      setFilteredDoctors(orderedDoctors);
    })
    .catch(err => console.error('Doctors fetch error', err));
}, [rankMap]);


  useEffect(() => {
  const stored = JSON.parse(localStorage.getItem('doctorMessages') || '{}');
  const now = new Date();

  const validMessages = {};

  for (const key in stored) {
    const { text, savedAt, expiresAt } = stored[key];
    if (new Date(expiresAt) > now) {
      validMessages[key] = { text, savedAt, expiresAt };
    }
  }

  setMessages(validMessages);
  localStorage.setItem('doctorMessages', JSON.stringify(validMessages)); // update localStorage
}, []);


  // ✅ Corrected setFilteredDoctors instead of setFiltered
  useEffect(() => {
    setFilteredDoctors(doctors.filter(doc =>
      doc[filterType]?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, filterType, doctors]);

  const handleTagClick = (licenseNumber) => {
    setMessageDoctorId(licenseNumber);
    setShowMessageModal(true);
    setShowAddMessage(false);
    setSecretNumber('');
    setMessage(messages[licenseNumber]?.text || '');
  };

  const verifySecretAndAllowAdd = () => {
    axios.post('http://localhost:8081/api/doctors/validate', {
      licenseNumber: messageDoctorId,
      secretNumber: secretNumber
    })
      .then(() => {
        setVerified(true);
        setErrorMsg('');
      })
      .catch(() => {
        setVerified(false);
        setErrorMsg('Incorrect secret number or license number');
      });
  };

  const saveMessage = () => {
  const now = new Date();
  const expiry = new Date();
  expiry.setDate(now.getDate() + 1);     // Set to tomorrow
  expiry.setHours(0, 1, 0, 0);           // 00:01 AM

  const updatedMessages = {
    ...messages,
    [messageDoctorId]: {
      text: message,
      savedAt: now.toISOString(),
      expiresAt: expiry.toISOString()    // ⏰ Save expiry time
    }
  };

  setMessages(updatedMessages);
  localStorage.setItem('doctorMessages', JSON.stringify(updatedMessages));
  setShowMessageModal(false);
  alert('Message saved successfully!');
};


  return (
    <div className="doctor-list-container">
      <div className="top-bar">
        <button onClick={() => navigate(-1)} className="back-button">⬅ Back</button>
        <h2 className="doctor-title">Registered Doctors</h2>
      </div>

      <div className="filter-section">
        <input
          type="text"
          placeholder={`Search by ${filterType}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-dropdown"
        >
          <option value="hospitalName">Hospital Name</option>
          <option value="hospitalLocation">Location</option>
          <option value="speciality">Speciality</option>
          <option value="qualification">Qualification</option>
        </select>
      </div>

      {filteredDoctors.length === 0 ? (
        <p>No doctors found.</p>
      ) : (
        <div className="doctor-cards">
          {filteredDoctors.map(doc => (
            <div key={doc.licenseNumber} className="doctor-card">
              <div className="tag-container">
                <FaTags
                  className="heart-icon"
                  color="orange"
                  title="View/Add Message"
                  onClick={() => handleTagClick(doc.licenseNumber)}
                />
              </div>

              {doc.isTrending && (
  <div className="trending-ribbon" data-rank={`👑 Top ${doc.rank}`}></div>
)}

              <img
                src={doc.imageUrl || 'https://via.placeholder.com/100'}
                alt={doc.name}
                className="doctor-image"
              />
              <h3>{doc.name}</h3>
              <p><strong>Gender:</strong> {doc.gender}</p>
              <p><strong>DOB:</strong> {doc.dob}</p>
              <p><strong>Speciality:</strong> {doc.speciality}</p>
              <p><strong>Qualification:</strong> {doc.qualification}</p>
              <p><strong>Experience:</strong> {doc.experience} years</p>
              <p><strong>Phone:</strong> {doc.phone}</p>
              <p><strong>Hospital Name:</strong> {doc.hospitalName}</p>
              <p><strong>Location:</strong> {doc.hospitalLocation}</p>
              <p><strong>Timing:</strong> {doc.consultationTimings}</p>
              <button
                className="view-btn"
                onClick={() => navigate('/doctor/login')}
              >
                View Appointments
              </button>
              <button
                className="book-btn"
                onClick={() => navigate('/book-appointment', {
                  state: { doctorId: doc.licenseNumber }
                })}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}

      {showMessageModal && (
        <div className="verification-modal">
          <div className="verification-content">
            {!showAddMessage ? (
              <>
                <h3>Today Message</h3>
                <p>{messages[messageDoctorId]?.text || 'No message available'}</p>
                <button onClick={() => setShowAddMessage(true)} className="view-btn">Add Message</button>
                <button className="reject-btn" onClick={() => setShowMessageModal(false)}>Close</button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  placeholder="Enter Secret Number"
                  value={secretNumber}
                  onChange={(e) => setSecretNumber(e.target.value)}
                />
                <button className="confirm-btn" onClick={verifySecretAndAllowAdd}>Verify</button>

                {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

                {verified && (
                  <>
                    <textarea
                      placeholder="Enter today's message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button className="confirm-btn" onClick={saveMessage}>Save Message</button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;
