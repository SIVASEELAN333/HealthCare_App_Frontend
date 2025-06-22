import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatRoomCategories.css';
import { groups } from './groups'; // 👈 Import the shared data


const ChatRoomCategories = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chatroom-categories-container">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ Back</button>
      <h2>🎯 Health Support Chat Groups</h2>

      <input
        type="text"
        placeholder="🔍 Search groups by name..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="chatroom-grid">
        {filteredGroups.map((group, index) => (
  <div
    className="chatroom-card"
    key={index}
    onClick={() => navigate(`/chat/${group.slug}`)} // ✅ use slug instead of group.name
    style={{ cursor: 'pointer' }}
  >
    <div className="icon">{group.icon}</div>
    <div className="text">
      <h4>{group.name}</h4>
      <p>{group.desc}</p>
    </div>
  </div>
))}

      </div>
    </div>
  );
};

export default ChatRoomCategories;
