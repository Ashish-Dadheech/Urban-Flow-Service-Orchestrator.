import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReportIncident.css';

function ReportIncident({ onIncidentReported, refreshTrigger }) {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'Traffic',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [refreshTrigger]);

  const fetchVehicles = async () => {
    try {
      setVehiclesLoading(true);
      const res = await axios.get('http://localhost:5000/vehicles', {
        timeout: 5000
      });
      console.log('Vehicles loaded:', res.data);
      setVehicles(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicles:', err.message);
      setError('Failed to load vehicles. Make sure backend is running on http://localhost:5000');
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.vehicleId) {
      setError('Please select a vehicle');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post('http://localhost:5000/incidents', {
        vehicleId: formData.vehicleId,
        type: formData.type,
        description: formData.description,
      });

      setSuccess(true);
      setFormData({
        vehicleId: '',
        type: 'Traffic',
        description: '',
      });

      setTimeout(() => setSuccess(false), 3000);
      
      if (onIncidentReported) {
        onIncidentReported();
      }
    } catch (err) {
      console.error('Error reporting incident:', err);
      setError(err.response?.data?.message || 'Failed to report incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-incident-section">
      <h2>Report an Incident</h2>
      <form onSubmit={handleSubmit} className="incident-form">
        <div className="form-group">
          <label htmlFor="vehicleId">Select Vehicle *</label>
          <select
            id="vehicleId"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            disabled={vehiclesLoading}
            required
          >
            <option value="">
              {vehiclesLoading ? 'Loading vehicles...' : vehicles.length === 0 ? 'No vehicles available' : '-- Choose a vehicle --'}
            </option>
            {vehicles.map(vehicle => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.name} ({vehicle.type})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="type">Incident Type *</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="Traffic">Traffic</option>
            <option value="Breakdown">Breakdown</option>
            <option value="Weather">Weather</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the incident..."
            rows="4"
          />
        </div>

        {error && formData.vehicleId && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Incident reported successfully!</div>}

        <button type="submit" disabled={loading || vehiclesLoading} className="submit-btn">
          {loading ? 'Reporting...' : 'Report Incident'}
        </button>
      </form>
    </div>
  );
}

export default ReportIncident;
