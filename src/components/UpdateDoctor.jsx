import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpdateDoctor.css';

const UpdateDoctor = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    licenseNumber: '',
    secretNumber: '',
    name: '',
    dob: '',
    gender: '',
    speciality: '',
    qualification: '',
    experience: '',
    phone: '',
    hospitalName: '',
    hospitalLocation: '',
    consultationTimings: '',
    imageUrl: '',
  });

  const [loaded, setLoaded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // ✅ search loading

  const handleLicenseSecretCheck = async () => {
    if (formData.licenseNumber && formData.secretNumber) {
      setIsSearching(true); // ✅ start searching
      try {
        const res = await fetch('http://localhost:8081/api/doctors/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            licenseNumber: formData.licenseNumber,
            secretNumber: formData.secretNumber,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, ...data }));
          setLoaded(true);
        } else {
          alert('Invalid license number or secret number');
          setLoaded(false);
        }
      } catch (err) {
        console.error('Validation error:', err);
        alert('Server error while fetching doctor data');
      } finally {
        setIsSearching(false); // ✅ stop searching
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:8081/api/doctors/license/${formData.licenseNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Doctor updated successfully!');
        navigate('/doctors');
      } else {
        alert('Update failed.');
      }
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="update-doctor-container">
      <div className="top-bar">
        <button onClick={() => navigate(-1)} className="back-button">⬅ Back</button>
        <h2>Update Doctor Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="doctor-form">
        <label>License Number:</label>
        <input
          type="text"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleChange}
          required
        />

        <label>Secret Number:</label>
        <input
          type="text"
          name="secretNumber"
          value={formData.secretNumber}
          onChange={handleChange}
          required
        />

        <button
          type="button"
          className="search-button"
          onClick={handleLicenseSecretCheck}
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : '🔍 Search Doctor'}
        </button>

        {loaded && (
          <>
            <label>Full Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />

            <label>Update Secret Number:</label>
            <input
              type="text"
              name="secretNumber"
              value={formData.secretNumber}
              onChange={handleChange}
              required
            />

            <label>Date of Birth:</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />

            <label>Gender:</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>

            <label>Speciality:</label>
            <input type="text" name="speciality" value={formData.speciality} onChange={handleChange} required />

            <label>Qualification:</label>
            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} required />

            <label>Experience (in years):</label>
            <input type="number" name="experience" value={formData.experience} onChange={handleChange} required />

            <label>Phone Number:</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />

            <label>Hospital Name:</label>
            <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange} required />

            <label>Hospital Location:</label>
            <input type="text" name="hospitalLocation" value={formData.hospitalLocation} onChange={handleChange} required />

            <label>Consultation Timings (e.g., 9AM - 5PM):</label>
            <input type="text" name="consultationTimings" value={formData.consultationTimings} onChange={handleChange} required />

            <label>Image URL:</label>
            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />

            <button type="submit" className="submit-button" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Doctor'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default UpdateDoctor;
