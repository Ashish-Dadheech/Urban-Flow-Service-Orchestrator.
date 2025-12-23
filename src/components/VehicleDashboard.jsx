import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import './Dashboard.css';

function VehicleCard({ vehicle, incidents, onRefresh }) {
  const vehicleIncidents = incidents.filter(inc => 
    inc.vehicleId._id === vehicle._id && inc.status === 'Open'
  );

  const handleCloseIncident = async (incidentId) => {
    try {
      await axios.put(`http://localhost:5000/incidents/${incidentId}/close`);
      onRefresh();
    } catch (error) {
      console.error('Error closing incident:', error);
    }
  };

  return (
    <div className={`vehicle-card ${vehicle.status === 'Active' ? 'active' : 'inactive'}`}>
      <div className="vehicle-header">
        <h3>{vehicle.name}</h3>
        <span className={`status-badge ${vehicle.status.toLowerCase()}`}>
          {vehicle.status}
        </span>
      </div>
      <div className="vehicle-info">
        <p><strong>Type:</strong> {vehicle.type}</p>
        <p><strong>ID:</strong> {vehicle._id.substring(0, 8)}...</p>
      </div>
      {vehicleIncidents.length > 0 && (
        <div className="incidents-section">
          <h4>Active Incidents ({vehicleIncidents.length})</h4>
          <ul className="incidents-list">
            {vehicleIncidents.map(incident => (
              <li key={incident._id} className="incident-item">
                <span>{incident.type}: {incident.description}</span>
                <button 
                  onClick={() => handleCloseIncident(incident._id)}
                  className="close-btn"
                >
                  Resolve
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function VehicleDashboard({ onDataChange }) {
  const [vehicles, setVehicles] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createForm, setCreateForm] = useState({ name: '', type: 'Bus' });
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { updateAlertLevel } = useAlert();

  const fetchData = async () => {
    try {
      setLoading(true);
      const vehiclesRes = await axios.get('http://localhost:5000/vehicles');
      const incidentsRes = await axios.get('http://localhost:5000/incidents');
      
      setVehicles(vehiclesRes.data);
      setIncidents(incidentsRes.data);
      
      // Update alert level based on open incidents
      const openIncidents = incidentsRes.data.filter(inc => inc.status === 'Open');
      updateAlertLevel(openIncidents);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [updateAlertLevel]);

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      alert('Please enter a vehicle name');
      return;
    }

    setCreating(true);
    try {
      await axios.post('http://localhost:5000/vehicles', {
        name: createForm.name,
        type: createForm.type,
        status: 'Active'
      });
      setCreateForm({ name: '', type: 'Bus' });
      if (onDataChange) onDataChange();
      fetchData();
    } catch (err) {
      console.error('Error creating vehicle:', err);
      alert('Failed to create vehicle');
    } finally {
      setCreating(false);
    }
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading vehicles...</div>
      </div>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="vehicles-section">
      <div className="section-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>Vehicles & Incidents</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setShowCreateForm(s => !s)} className="refresh-btn" style={{ background: '#10b981' }}>
            {showCreateForm ? 'Close' : 'Add Vehicle'}
          </button>
          <button onClick={fetchData} className="refresh-btn">
            ↻ Refresh
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #e5e7eb' }}>
          <form onSubmit={handleCreateVehicle} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Vehicle name"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
            />
            <select
              value={createForm.type}
              onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
            >
              <option value="Bus">Bus</option>
              <option value="Scooter">Scooter</option>
              <option value="Train">Train</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      )}

      {vehicles.length === 0 && !loading && (
        <div className="empty-state">
          <p>No vehicles found. Create one below:</p>
          <form onSubmit={handleCreateVehicle} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Vehicle name"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
            />
            <select
              value={createForm.type}
              onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
            >
              <option value="Bus">Bus</option>
              <option value="Scooter">Scooter</option>
              <option value="Train">Train</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      )}
      
      {vehicles.length > 0 && (
        <div className="vehicles-grid">
          {vehicles.map(vehicle => (
            <VehicleCard 
              key={vehicle._id} 
              vehicle={vehicle} 
              incidents={incidents}
              onRefresh={fetchData}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default VehicleDashboard;
