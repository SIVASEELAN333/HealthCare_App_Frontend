import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DoctorAppointments.css';

const DoctorAppointments = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [showVerification, setShowVerification] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [secretNumber, setSecretNumber] = useState('');
  const [validationNumber, setValidationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [rejectingAppointmentId, setRejectingAppointmentId] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const location = useLocation();
  const doctorId = location.state?.doctorId;

  useEffect(() => {
    if (doctorId) {
      axios
        .get(`http://localhost:8081/api/appointments/doctor/${doctorId}`)
        .then((res) => setAppointments(res.data))
        .catch((err) => console.error('Error fetching appointments:', err));
    }
  }, [doctorId]);

  const formatDate = (date) => {
  const localDate = new Date(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


  const handleDateChange = (date) => {
    const now = new Date();
    const selected = new Date(date);
    const formatted = formatDate(date);
    const isToday = now.toDateString() === selected.toDateString();

    if (isToday && now.getHours() >= 9) {
      setSelectedDate(date);
      setFilteredAppointments([]);
      return;
    }

    setSelectedDate(date);
    setFilteredAppointments(appointments.filter((app) => app.date === formatted));
  };

  const openVerification = (appointmentId) => {
    const app = filteredAppointments.find((a) => a.id === appointmentId);
    setSelectedAppointmentId(appointmentId);
    setShowVerification(true);
    setValidationNumber('');
    setSecretNumber('');
    setEmail(app?.patient?.email || '');
    setError('');
  };

  const handleVerifyAndConfirm = async () => {
    setIsVerifying(true);
    try {
      const res = await axios.post('http://localhost:8081/api/doctors/verify', {
        licenseNumber: doctorId,
        secretNumber,
      });

      if (res.data.success) {
        await axios.put(
          `http://localhost:8081/api/appointments/status/${selectedAppointmentId}?status=CONFIRMED`,
          { validationNumber }
        );

        alert('Appointment confirmed successfully');

        setAppointments((prev) =>
          prev.map((app) =>
            app.id === selectedAppointmentId
              ? { ...app, status: 'CONFIRMED', validationNumber }
              : app
          )
        );

        setFilteredAppointments((prev) =>
          prev.map((app) =>
            app.id === selectedAppointmentId
              ? { ...app, status: 'CONFIRMED', validationNumber }
              : app
          )
        );

        setShowVerification(false);
      } else {
        setError('Doctor verification failed.');
      }
    } catch (err) {
      console.error('Error verifying or confirming:', err);
      setError('Something went wrong.');
    } finally {
      setIsVerifying(false);
    }
  };

  const openRejectModal = (id) => {
    setRejectingAppointmentId(id);
    setRejectionComment('');
  };

  const submitRejectionComment = async () => {
    setIsRejecting(true);
    try {
      await axios.put(
        `http://localhost:8081/api/appointments/status/${rejectingAppointmentId}?status=REJECTED`,
        { comment: rejectionComment }
      );

      alert('Appointment rejected successfully');

      setAppointments((prev) =>
        prev.map((app) =>
          app.id === rejectingAppointmentId ? { ...app, status: 'REJECTED' } : app
        )
      );
      setFilteredAppointments((prev) =>
        prev.map((app) =>
          app.id === rejectingAppointmentId ? { ...app, status: 'REJECTED' } : app
        )
      );
      setRejectingAppointmentId(null);
    } catch (err) {
      console.error('Error rejecting appointment:', err);
      alert('Failed to reject.');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="appointment-calendar-container">
      <div className="calendar-overlay-wrapper">
        <div className={`calendar-wrapper ${selectedDate ? 'blurred' : ''}`}>
          <h2>Select a Date to View Appointments</h2>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            className="calendar-small"
            tileDisabled={({ date }) => {
              const now = new Date();
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              const isBefore9am = now.getHours() < 9;

              if (isBefore9am) {
                return date.toDateString() !== today.toDateString();
              } else {
                return date.toDateString() !== tomorrow.toDateString();
              }
            }}
          />
        </div>

        {selectedDate && (
          <div className="appointment-overlay">
            <div className="appointment-list">
              <div className="appointment-header">
                <h3>Appointments on {formatDate(selectedDate)}</h3>
                <button className="clear-btn" onClick={() => setSelectedDate(null)}>
                  Back to Calendar
                </button>
              </div>

              {filteredAppointments.length === 0 ? (
                <p>No appointments on this date.</p>
              ) : (
                filteredAppointments.map((app) => (
                  <div key={app.id} className="appointment-card">
                    <p><strong>Time:</strong> {app.time}</p>
                    <p><strong>Status:</strong> {app.status}</p>
                    <p><strong>Patient Email:</strong> {app.patient?.email || 'N/A'}</p>
                    <p><strong>Validation Number:</strong> {app.validationNumber || 'N/A'}</p>
                    {app.status === 'PENDING' && (
                      <div>
                        <button
                          onClick={() => openVerification(app.id)}
                          className="accept-btn"
                          disabled={isVerifying || isRejecting}
                        >
                          {isVerifying && selectedAppointmentId === app.id ? 'Verifying...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => openRejectModal(app.id)}
                          className="reject-btn"
                          disabled={isVerifying || isRejecting}
                        >
                          {isRejecting && rejectingAppointmentId === app.id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showVerification && (
        <div className="verification-modal">
          <div className="verification-content">
            <h3>Verify & Confirm Appointment</h3>
            <input
              type="text"
              placeholder="Enter Secret Number"
              value={secretNumber}
              onChange={(e) => setSecretNumber(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Validation Number"
              value={validationNumber}
              onChange={(e) => setValidationNumber(e.target.value)}
            />
            {error && <p className="error-msg">{error}</p>}
            <button
              className="confirm-btn"
              onClick={handleVerifyAndConfirm}
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Confirm'}
            </button>
            <button
              className="reject-btn"
              onClick={() => setShowVerification(false)}
              disabled={isVerifying}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {rejectingAppointmentId && (
        <div className="verification-modal">
          <div className="verification-content">
            <h3>Enter Rejection Comment</h3>
            <textarea
              placeholder="Why are you rejecting?"
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
            />
            <button
              className="confirm-btn"
              onClick={submitRejectionComment}
              disabled={isRejecting}
            >
              {isRejecting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              className="reject-btn"
              onClick={() => setRejectingAppointmentId(null)}
              disabled={isRejecting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
