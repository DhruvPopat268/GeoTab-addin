import React, { useState } from 'react';
import Navbar from './Navbar.jsx';
import './componentStyles/LCCheckUsage.css';



const LCCheckUsage = () => {
  const [statusFilter, setStatusFilter] = useState('all');

  const apiLogs = [
    { id: 1, apiName: 'LC Check', method: 'POST', endpoint: '/api/lc-check/validate', status: 200, responseTime: '245 ms', timestamp: '6/30/2025, 2:45:22 PM' },
    { id: 2, apiName: 'LC Check', method: 'POST', endpoint: '/api/lc-check/validate', status: 200, responseTime: '189 ms', timestamp: '6/30/2025, 2:30:15 PM' },
    { id: 3, apiName: 'LC Check', method: 'GET', endpoint: '/api/lc-check/history', status: 200, responseTime: '156 ms', timestamp: '6/30/2025, 2:15:08 PM' },
    { id: 4, apiName: 'LC Check', method: 'POST', endpoint: '/api/lc-check/validate', status: 400, responseTime: '98 ms', timestamp: '6/30/2025, 1:45:33 PM' }
  ];

  const usageStats = {
    totalCalls: 156,
    averageDailyCalls: 22,
    peakUsageDay: '2025-6-28',
    peakDayCalls: 45
  };

  const dailyUsageData = [
    { day: 'Jun 24', calls: 0 },
    { day: 'Jun 25', calls: 0 },
    { day: 'Jun 26', calls: 0 },
    { day: 'Jun 27', calls: 0 },
    { day: 'Jun 28', calls: 45 },
    { day: 'Jun 29', calls: 32 },
    { day: 'Jun 30', calls: 79 }
  ];

  const topEndpoints = [
    { endpoint: '/api/lc-check/validate', method: 'POST', calls: 134, percentage: 85.9 },
    { endpoint: '/api/lc-check/history', method: 'GET', calls: 15, percentage: 9.6 },
    { endpoint: '/api/lc-check/status', method: 'GET', calls: 7, percentage: 4.5 }
  ];

  const getStatusBadge = (status) => {
    if (status >= 200 && status < 300) {
      return <span className="badge green">200</span>;
    } else if (status >= 400 && status < 500) {
      return <span className="badge red">{status}</span>;
    } else {
      return <span className="badge yellow">{status}</span>;
    }
  };

  return (
    <div className="lc-usage-container">
      <Navbar />

      <div className="content">
        <section className="section">
          <h1 className="section-title">API Logs</h1>
          <p className="section-description">Monitor API activity and troubleshoot issues</p>

          <div className="card">
            <div className="card-header">
              <h2>Filter Status</h2>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Logs</option>
                <option value="success">Success (2xx)</option>
                <option value="error">Error (4xx, 5xx)</option>
              </select>
            </div>

            <div className="card-content">
              <table>
                <thead>
                  <tr>
                    <th>API Name</th>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Status</th>
                    <th>Response Time</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {apiLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.apiName}</td>
                      <td><span className="badge outline">{log.method}</span></td>
                      <td className="endpoint">{log.endpoint}</td>
                      <td>{getStatusBadge(log.status)}</td>
                      <td>{log.responseTime}</td>
                      <td className="timestamp">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-footer">Showing {apiLogs.length} of {apiLogs.length} logs</div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Usage Statistics</h2>
          <p className="section-description">Monitor your API usage metrics and patterns</p>

          <div className="stats-grid">
            <div className="stat-card">
              <p>Total API Calls (Last 7 Days)</p>
              <h3>{usageStats.totalCalls}</h3>
            </div>
            <div className="stat-card">
              <p>Average Daily Calls</p>
              <h3>{usageStats.averageDailyCalls}</h3>
            </div>
            <div className="stat-card">
              <p>Peak Usage Day</p>
              <h3>{usageStats.peakUsageDay}</h3>
            </div>
            <div className="stat-card">
              <p>Peak Day Calls</p>
              <h3>{usageStats.peakDayCalls}</h3>
            </div>
          </div>

          <div className="card chart-card">
            <h3>Daily API Usage (Last 7 Days)</h3>
            <div className="chart-placeholder">[Chart Placeholder]</div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Top Endpoints</h2>
          <div className="card">
            <div className="card-content">
              {topEndpoints.map((ep, index) => (
                <div key={index} className="endpoint-row">
                  <div className="endpoint-header">
                    <div className="endpoint-label">
                      <span className="badge outline">{ep.method}</span>
                      <span>{ep.endpoint}</span>
                    </div>
                    <span>{ep.calls} calls</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${ep.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LCCheckUsage;
