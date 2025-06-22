import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [topDoctor, setTopDoctor] = useState(null);
  const navigate = useNavigate();

const goToChatRooms = () => {
  navigate('/chat-rooms');
};


  useEffect(() => {
  axios.get('http://localhost:8081/api/reports/top-doctor-current-month')
    .then(res => setTopDoctor(res.data))
    .catch(err => console.error("Top doctor fetch failed"));
}, []);


  const toggleLeaderboard = async () => {
    if (!showLeaderboard) {
      try {
        const res = await axios.get('http://localhost:8081/api/reports/leaderboard');
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard');
      }
    }
    setShowLeaderboard(!showLeaderboard);
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Welcome to the Dashboard</h2>
      {topDoctor && (
  <div className="top-doctor-highlight">
    <h3>🏅 Top Doctor of {topDoctor.month}</h3>
    <div className="scrolling-name">
      <strong>{topDoctor.name}</strong>
    </div>
    <p>{topDoctor.hospitalName} - {topDoctor.hospitalLocation}</p>
    <p className="highlighted-points">{topDoctor.points} pts</p>
  </div>
)}



      <div className="leaderboard-toggle">
        <button onClick={toggleLeaderboard} className="toggle-leaderboard-btn">
          {showLeaderboard ? '⬆️ Hide Leaderboard' : '🏆 Show Leaderboard'}
        </button>

        {showLeaderboard && (
  <div className="leaderboard-card enhanced-leaderboard">
    <h3 className="leaderboard-heading">🏆 Top 10 Doctors Leaderboard</h3>
    <ul className="leaderboard-list">
      {leaderboard.map((doctor, index) => (
        <li key={index} className="leaderboard-item">
          <div className="rank-badge">
            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
          </div>
          <div className="doctor-details">
            <div className="doctor-name">{doctor.name}</div>
            <div className="doctor-hospital">
              {doctor.hospitalName} - {doctor.hospitalLocation}
            </div>
          </div>
          <div className="doctor-points">
            <span>{doctor.points}</span> pts
          </div>
        </li>
      ))}
    </ul>
  </div>
)}

      </div>

      {/* 👇 Only show these buttons when leaderboard is hidden */}
      {!showLeaderboard && (
        <div className="dashboard-buttons">
          <Link to="/doctors">
            <button>Available Doctors</button>
          </Link>
          <Link to="/add-doctor">
            <button>Register New Doctor</button>
          </Link>
          <Link to="/update-doctor">
            <button>Update Doctor Details</button>
          </Link>
          <Link to="/report-analysis">
            <button>Report Analyze</button>
          </Link>
          <div className="chatroom-section">
  <button onClick={goToChatRooms} className="toggle-chatroom-btn">
    💬 Open Chat Rooms
  </button>
</div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
