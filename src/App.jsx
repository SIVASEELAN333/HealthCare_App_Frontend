import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import DoctorList from './components/DoctorList';
import AppointmentBooking from './components/AppointmentBooking.jsx';
import HistoryViewer from './components/HistoryViewer';
import { AuthProvider } from './context/AuthContext';
import AddDoctor from './components/AddDoctor.jsx';
import DoctorAppointments from "./components/DoctorAppointments.jsx"; // ✅ already correct
import Dashboard from './components/Dashboard.jsx';
import UpdateDoctor from './components/UpdateDoctor.jsx';
import DoctorLogin from './components/DoctorLogin.jsx';
import ReportAnalysis from './components/ReportAnalysis.jsx';
import UploadReport from './components/UploadReport'; 
import ViewReports from './components/ViewReports.jsx';
import ChatRoomCategories from './components/ChatRoomCategories';
import ChatRoom from './components/ChatRoom.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/doctors" element={<DoctorList />} />
          <Route path="/book-appointment" element={<AppointmentBooking />} />
          <Route path="/history" element={<HistoryViewer />} />
          <Route path="/add-doctor" element={<AddDoctor />} />
          <Route path="/report-analysis" element={<ReportAnalysis />} />
          <Route path="/upload" element={<UploadReport />} />
          <Route path="/view-reports" element={<ViewReports />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments  />} /> {/* ✅ moved here */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/update-doctor" element={<UpdateDoctor />} />
          <Route path="/chat-rooms" element={<ChatRoomCategories />} />
           <Route path="/chat/:roomName" element={<ChatRoom />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
