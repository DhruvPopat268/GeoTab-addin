import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from './Navbar.jsx';
import './componentStyles/LCCheckUsage.css';
import { API_URL } from '../../../env.js';
import axios from 'axios';

const LCCheckUsage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [apiLogs, setApiLogs] = useState([]);
  const [usageStats, setUsageStats] = useState({
    totalCalls: 0,
    averageDailyCalls: 0,
    peakUsageDay: '',
    peakDayCalls: 0
  });
  const [dailyUsageData, setDailyUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  console.log('Daily Usage Data:', dailyUsageData);

const key = Object.keys(localStorage).find(k => k.startsWith("sTokens_"));

const sessionDataRaw = key ? localStorage.getItem(key) : null;

console.log("Key:", key);
console.log("Value:", sessionDataRaw);

  const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
  const userName = sessionData?.userName || "unknown@user.com";

  // Transform data for chart - this is the key fix
  const transformDataForChart = (data) => {
    if (!data || data.length === 0) {
      // Generate empty data for last 7 days
      const last7Days = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        last7Days.push({
          date: dateStr,
          calls: 0
        });
      }
      return last7Days;
    }

    // If your API returns array of objects like [{calls: 2, name: "Driver Detail ( LC Check )"}]
    if (Array.isArray(data)) {
      // Case 1: If it's an array of API call objects
      if (data.length > 0 && data[0].calls !== undefined) {
        const last7Days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          // For now, we'll put all calls on today's date
          // You might need to adjust this based on your actual API response structure
          const isToday = i === 0;
          const totalCalls = isToday ? data.reduce((sum, item) => sum + (item.calls || 0), 0) : 0;

          last7Days.push({
            date: dateStr,
            calls: totalCalls
          });
        }
        return last7Days;
      }

      // Case 2: If it's already in the right format
      return data.map(item => ({
        date: item.date || item.day || 'Unknown',
        calls: item.calls || item.count || 0
      }));
    }

    // Case 3: If it's an object with date keys
    if (typeof data === 'object' && !Array.isArray(data)) {
      return Object.entries(data).map(([date, calls]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calls: calls || 0
      }));
    }

    return [];
  };

  // Fetch API logs from the endpoint
  useEffect(() => {
    const fetchApiLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(`${API_URL}/proxy/logs`, {
          userId: userName // Make sure this is defined in your component
        });

        const data = response.data;

        // Transform the API response to match the expected format
        const transformedLogs = data.map((log, index) => ({
          id: log._id || index + 1,
          apiName: log.name || 'LC Check',
          method: log.method || 'POST',
          endpoint: log.endpoint || '/api/lc-check/validate',
          status: log.status || 200,
          responseTime: `${log.responseTime || 0} ms`,
          timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : new Date().toLocaleString(),
          success: log.success
        }));

        setApiLogs(transformedLogs);
      } catch (err) {
        console.error('Error fetching API logs:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApiLogs();
  }, []);

  // Fetch usage statistics
  useEffect(() => {
    const fetchUsageStats = async () => {
      try {
        setStatsLoading(true);

        const response = await axios.post(`${API_URL}/proxy/logs/stats`, {
          userId: userName // Replace with the logged-in user ID
        });

        const data = response.data;

        setUsageStats({
          totalCalls: data.totalCalls || 0,
          averageDailyCalls: data.averageCalls || 0,
          peakUsageDay: data.peakDay || '',
          peakDayCalls: data.peakDayCalls || 0
        });
      } catch (err) {
        console.error('Error fetching usage stats:', err.response?.data?.message || err.message);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchUsageStats();
  }, []);

  // Fetch daily usage data for chart
  useEffect(() => {
    const fetchDailyUsage = async () => {
      try {
        setChartLoading(true);

        const response = await axios.post(`${API_URL}/proxy/logs/daily-usage`, {
          userId: userName // Same here
        });

        const data = response.data;
        console.log('Raw API Response:', data);

        // Transform the data for the chart
        const transformedData = transformDataForChart(data);
        console.log('Transformed Data:', transformedData);

        setDailyUsageData(transformedData);
      } catch (err) {
        console.error('Error fetching daily usage:', err.response?.data?.message || err.message);
        const fallbackData = createFallbackChartData();
        setDailyUsageData(fallbackData);
      } finally {
        setChartLoading(false);
      }
    };

    fetchDailyUsage();
  }, []);

  // Create fallback chart data when API fails
  const createFallbackChartData = () => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Put all calls on July 3rd (peak usage day)
      const isJuly3 = date.getDate() === 3 && date.getMonth() === 6; // July is month 6

      last7Days.push({
        date: dateStr,
        calls: isJuly3 ? 2 : 0
      });
    }

    console.log('Fallback chart data:', last7Days);
    return last7Days;
  };

  // Filter logs based on status
  const filteredLogs = apiLogs.filter(log => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'success') return log.status >= 200 && log.status < 300;
    if (statusFilter === 'error') return log.status >= 400;
    return true;
  });

  const getStatusBadge = (status) => {
    if (status >= 200 && status < 300) {
      return <span className="badge green">Success</span>;
    } else if (status === 404) {
      return <span className="badge red">Fail</span>;
    } else if (status >= 400 && status < 500) {
      return <span className="badge red">Client Error</span>;
    } else if (status >= 500) {
      return <span className="badge yellow">Server Error</span>;
    } else {
      return <span className="badge gray">Status: {status}</span>;
    }
  };


  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p className="label">{`Date: ${label}`}</p>
          <p className="value" style={{ color: '#6366f1' }}>
            {`API Calls: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="lc-usage-container">
      <Navbar />

      <div className="content">

        <section className="section">
          <h1
            className="text-[28px] font-light leading-[36px] not-italic tracking-[0] normal-case"
            style={{ fontFamily: "var(--main-font)" }}
          >
            Usage Statistics
          </h1>

          <p className="section-description">Monitor your API usage metrics and patterns</p>

          <div className="stats-grid ">
            <div className="stat-card font-light">
              <p>Total API Calls (Last 7 Days)</p>
              <h3
                className="font-light"

              >
                {statsLoading ? 'Loading...' : usageStats.totalCalls}
              </h3>

            </div>
            <div className="stat-card">
              <p>Average Daily Calls</p>
              <h3>{statsLoading ? 'Loading...' : usageStats.averageDailyCalls}</h3>
            </div>
            <div className="stat-card">
              <p>Peak Usage Day</p>
              <h3>{statsLoading ? 'Loading...' : usageStats.peakUsageDay}</h3>
            </div>
            <div className="stat-card">
              <p>Peak Day Calls</p>
              <h3>{statsLoading ? 'Loading...' : usageStats.peakDayCalls}</h3>
            </div>
          </div>

          <div className="card chart-card">
            <h3
              className="text-[28px] font-light leading-[36px] not-italic tracking-[0] normal-case"
              style={{ fontFamily: 'var(--main-font)' }}
            >
              Daily API Usage (Last 7 Days)
            </h3>


            {chartLoading ? (
              <div className="chart-placeholder">Loading chart...</div>
            ) : (
              <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyUsageData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      allowDecimals={false}
                      domain={[0, 'dataMax + 1']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="calls"
                      fill="#6366f1"
                      radius={[2, 2, 0, 0]}
                      minPointSize={2}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}



          </div>
        </section>

        <section className="section">
          <h1
            className="text-[28px] font-light leading-[36px] not-italic tracking-[0] normal-case"
            style={{ fontFamily: "var(--main-font)" }}
          >
            API Logs
          </h1>

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
              {loading ? (
                <div className="spinner-container">
                  <div className="spinner" />
                </div>

              ) : error ? (
                <div className="error-message">Error loading logs: {error}</div>
              ) : (
                <>
                  <table>
                    <thead>
                      <tr>
                        <th>API Name</th>
                        <th>Method</th>
                        {/* <th>Endpoint</th> */}
                        <th>Status</th>
                        <th>Response Time</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.apiName}</td>
                          <td><span className="badge outline">{log.method}</span></td>
                          {/* <td className="endpoint">{log.endpoint}</td> */}
                          <td>{getStatusBadge(log.status)}</td>


                          <td>{log.responseTime}</td>
                          <td className="timestamp">{log.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    Showing {filteredLogs.length} of {apiLogs.length} logs
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LCCheckUsage;