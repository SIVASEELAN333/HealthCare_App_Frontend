import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddDoctor.css';
import axios from 'axios';

const AddDoctor = () => {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState({
    name: '',
    licenseNumber: '',
    secretNumber: '', // ✅ Added
    dob: '',
    gender: '',
    speciality: '',
    qualification: '',
    experience: '',
    phone: '',
     hospitalName: '',
    hospitalLocation: '',
    consultationTimings: '',
    imageUrl: ''
  });

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8081/api/doctors', doctor);
      alert('Doctor registered successfully');
      setDoctor({
        name: '',
        licenseNumber: '',
        secretNumber: '', // ✅ Clear after submit
        dob: '',
        gender: '',
        speciality: '',
        qualification: '',
        experience: '',
        phone: '',
         hospitalName: '',
        hospitalLocation: '',
        consultationTimings: '',
        imageUrl: ''
      });
    } catch (error) {
      console.error(error);
      alert('Failed to register doctor');
    }
  };

  return (
    <div className="add-doctor-container">
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <h2>Register New Doctor</h2>
      <form onSubmit={handleSubmit} className="add-doctor-form">
        <input type="text" name="licenseNumber" placeholder="License Number" value={doctor.licenseNumber} onChange={handleChange} required />
        <input type="text" name="secretNumber" placeholder="Secret Number" value={doctor.secretNumber} onChange={handleChange} required /> {/* ✅ New Input */}
        <input type="text" name="name" placeholder="Full Name" value={doctor.name} onChange={handleChange} required />
        <input type="date" name="dob" value={doctor.dob} onChange={handleChange} required />
        <select name="gender" value={doctor.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
        <input type="text" name="speciality" placeholder="Speciality" value={doctor.speciality} onChange={handleChange} required />
        <input type="text" name="qualification" placeholder="Qualification" value={doctor.qualification} onChange={handleChange} required />
        <input type="number" name="experience" placeholder="Years of Experience" value={doctor.experience} onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="Phone Number" value={doctor.phone} onChange={handleChange} required />
<input
  type="text"
  name="hospitalName"
  placeholder="Hospital Name"
  value={doctor.hospitalName}
  onChange={handleChange}
  required
/>

        <input type="text" name="hospitalLocation" placeholder="Hospital Location" value={doctor.hospitalLocation} onChange={handleChange} required />
        <input type="text" name="consultationTimings" placeholder="Consultation Timings (e.g., 9AM - 5PM)" value={doctor.consultationTimings} onChange={handleChange} required />
        <input type="text" name="imageUrl" placeholder="Image URL" value={doctor.imageUrl} onChange={handleChange} />
        <button type="submit">Register Doctor</button>
      </form>
    </div>
  );
};

export default AddDoctor;
