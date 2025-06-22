import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AppointmentBooking.css';
import axios from 'axios';
import Modal from 'react-modal';
import { useLocation } from 'react-router-dom';

Modal.setAppElement('#root');

const AppointmentBooking = () => {
  const [availability, setAvailability] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]); // now stores objects { time, status }
  const [selectedTime, setSelectedTime] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const doctorId = location.state?.doctorId;

  const getInitialBookingDate = () => {
  const now = new Date();
  const bookingCutoff = new Date();
  bookingCutoff.setHours(7, 0, 0, 0); // 7:00 AM today

  if (now >= bookingCutoff) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  return now;
};

const [selectedDate, setSelectedDate] = useState(getInitialBookingDate());

  useEffect(() => {
    if (doctorId) {
      fetchAvailability();
    }
  }, [doctorId]);

  const fetchAvailability = () => {
    axios
      .get(`http://localhost:8081/api/appointments/availability?doctorId=${doctorId}`)
      .then(res => setAvailability(res.data))
      .catch(err => console.error('Error:', err));
  };

  useEffect(() => {
    if (!availability) return;

    const day = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const isAvailableDay = availability.availableDays.includes(day);

    if (!isAvailableDay) {
      setAvailableTimes([]);
      setBookedSlots([]);
      return;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    const slots = availability.dailySlots;
    const booked = (availability.bookedSlots[dateStr] || [])
      .filter(s => s.status !== 'rejected');

    setAvailableTimes(slots);
    setBookedSlots(booked);
  }, [selectedDate, availability]);

  const handleBookClick = () => {
    if (!selectedTime) return alert('Please select a time slot');
    setEmailModalOpen(true);
  };

  const sendOtpToEmail = async () => {
    if (!userEmail) return alert('Please enter your email');
    try {
      setLoading(true);
      await axios.post(`http://localhost:8081/api/email/send-otp?email=${userEmail}`);
      setOtpSent(true);
      alert('OTP sent to your email');
    } catch (err) {
      console.error(err);
      alert('Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const confirmOtpAndBook = async () => {
    if (!otp) return alert('Please enter the OTP');
    try {
      setLoading(true);
      const otpRes = await axios.post(
        `http://localhost:8081/api/email/verify-otp?email=${userEmail}&otp=${otp}`
      );
      if (otpRes.data.message !== 'OTP verified successfully') {
        return alert('Invalid OTP');
      }

      const userRes = await axios.get(
        `http://localhost:8081/api/auth/user?email=${userEmail}`
      );
      const user = userRes.data;

      const appointment = {
        doctorId,
        patientId: user.id,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
      };
      await axios.post('http://localhost:8081/api/appointments/book', appointment);
      alert('Appointment requested! awaiting doctor approval.');

      setEmailModalOpen(false);
      setOtpSent(false);
      setOtp('');
      setUserEmail('');
      setSelectedTime('');

      // update local UI to show requesting
      setBookedSlots(prev => [...prev, { time: appointment.time, status: 'pending' }]);
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const isPastDate = (date) => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingCutoff = new Date();
  bookingCutoff.setHours(7, 0, 0, 0);

  // if it's before 7am, only allow today
  if (now < bookingCutoff) {
    return date.toDateString() !== today.toDateString();
  }

  // if it's after 7am, only allow tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return date.toDateString() !== tomorrow.toDateString();
};


  return (
    <div className="appointment-container">
      <h2>Book Appointment</h2>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileDisabled={({ date }) => isPastDate(date)}
      />
      <h4>Available Times on {selectedDate.toDateString()}:</h4>
      {availableTimes.length === 0 ? (
        <p>No slots available.</p>
      ) : (
        <div className="time-slots">
          {availableTimes.map(time => {
  const slot = bookedSlots.find(s => s.time === time);
  const status = slot?.status?.toLowerCase();

  let cls = 'time-slot-btn';
  let label = time;

  if (status === 'confirmed') {
    cls += ' booked';
    label += ' (Booked)';
  } else if (status === 'pending') {
    cls += ' requesting';
    label += ' (Requesting)';
  } else if (selectedTime === time) {
    cls += ' selected-slot';
  }

  return (
    <button
      key={time}
      className={cls}
      onClick={() => !slot && setSelectedTime(time)}
      disabled={!!slot}
    >
      {label}
    </button>
  );
})}

        </div>
      )}
      <button
        className="book-btn"
        onClick={handleBookClick}
        disabled={!selectedTime}
      >
        Confirm Booking
      </button>

      <Modal
        isOpen={emailModalOpen}
        onRequestClose={() => {
          setEmailModalOpen(false);
          setOtpSent(false);
          setOtp('');
          setUserEmail('');
        }}
        className="email-modal"
        overlayClassName="modal-overlay"
      >
        <h3>Verify Your Email</h3>
        <input
          type="email"
          placeholder="you@example.com"
          value={userEmail}
          onChange={e => setUserEmail(e.target.value)}
          disabled={otpSent}
        />
        {!otpSent ? (
          <button onClick={sendOtpToEmail} disabled={loading}>
            {loading ? 'Sending OTP…' : 'Send OTP'}
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              style={{ marginTop: '8px', marginBottom: '24px' }}
            />
            <div className="modal-buttons">
              <button onClick={confirmOtpAndBook} disabled={loading}>
                {loading ? 'Verifying…' : 'Confirm Booking'}
              </button>
              <button
                onClick={() => {
                  setEmailModalOpen(false);
                  setOtpSent(false);
                  setOtp('');
                  setUserEmail('');
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentBooking;
