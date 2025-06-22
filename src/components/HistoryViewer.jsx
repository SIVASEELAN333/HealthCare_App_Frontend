import React, { useEffect, useState } from 'react';
import axios from '../services/api';

const HistoryViewer = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await axios.get('/api/history/view');
      setHistory(response.data);
    };
    fetchHistory();
  }, []);

  return (
    <div>
      <h2>Medical History</h2>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>{entry.description} - {entry.date}</li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryViewer;