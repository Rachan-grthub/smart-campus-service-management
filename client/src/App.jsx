import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const defaultForm = {
  studentName: '',
  serviceId: 'certificate',
  title: '',
  description: '',
};

function App() {
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, approved: 0, rejected: 0 });
  const [form, setForm] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedService = useMemo(
    () => services.find((item) => item.id === form.serviceId) || services[0],
    [services, form.serviceId]
  );

  async function fetchData() {
    try {
      const [serviceRes, requestRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/services`),
        fetch(`${API_BASE}/requests`),
        fetch(`${API_BASE}/stats`),
      ]);

      const servicesData = await serviceRes.json();
      const requestsData = await requestRes.json();
      const statsData = await statsRes.json();

      setServices(servicesData);
      setRequests(requestsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load campus service data', err);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to submit request');
      }

      setForm(defaultForm);
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      await fetch(`${API_BASE}/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      await fetchData();
    } catch (err) {
      console.error('Failed to update request status', err);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Campus services</p>
          <h1>Smart Campus Service Management</h1>
        </div>
        <div className="topbar-badge">Student Portal</div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Requests</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card warning">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="stat-card info">
          <span>In Progress</span>
          <strong>{stats.inProgress}</strong>
        </div>
        <div className="stat-card success">
          <span>Approved</span>
          <strong>{stats.approved}</strong>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel service-panel">
          <div className="panel-header">
            <h2>Available services</h2>
          </div>

          <div className="service-list">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                className={`service-card ${form.serviceId === service.id ? 'selected' : ''}`}
                onClick={() => setForm((prev) => ({ ...prev, serviceId: service.id }))}
              >
                <div className="service-icon">{service.icon}</div>
                <div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <span>{service.duration}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="panel form-panel">
          <div className="panel-header">
            <h2>Request a service</h2>
          </div>

          <form onSubmit={handleSubmit} className="request-form">
            <label>
              Student name
              <input
                value={form.studentName}
                onChange={(event) => setForm({ ...form, studentName: event.target.value })}
                placeholder="Enter your full name"
                required
              />
            </label>

            <label>
              Service type
              <select
                value={form.serviceId}
                onChange={(event) => setForm({ ...form, serviceId: event.target.value })}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Subject
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Brief title or request"
                required
              />
            </label>

            <label>
              Details
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Describe your request in detail"
                rows="5"
                required
              />
            </label>

            {selectedService && (
              <div className="helper-box">
                <strong>{selectedService.name}</strong>
                <p>{selectedService.description}</p>
              </div>
            )}

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit request'}
            </button>
          </form>
        </div>
      </section>

      <section className="panel requests-panel">
        <div className="panel-header">
          <h2>Recent requests</h2>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Service</th>
                <th>Title</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.studentName}</td>
                  <td>{request.serviceName}</td>
                  <td>{request.title}</td>
                  <td>
                    <span className={`status status-${request.status.replace(/\s+/g, '-')}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    <select
                      value={request.status}
                      onChange={(event) => updateStatus(request.id, event.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
