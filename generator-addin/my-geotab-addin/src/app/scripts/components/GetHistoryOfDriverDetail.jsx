import React, { useState, useEffect } from 'react';
import { Eye, Download, ChevronDown } from 'lucide-react';
import './componentStyles/GetHistoryOfDriverDetail.css';
import Navbar from './Navbar.jsx';
import axios from 'axios';
import { BASE_URL } from '../../../env.js';



const DriverLicenseTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivingLicenceNumber, setDrivingLicenceNumber] = useState()

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  const handleView = (record) => {
    console.log('Viewing record:', record);
    // Add your view logic here
    alert(`Viewing details for ${record.driverLicenseNo}`);
  };

  const sessionDataRaw = localStorage.getItem("sTokens_ptcdemo1");
  const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
  const userName = sessionData?.userName || "unknown@user.com";

  const getDrivingLicenceFromUrl = () => {
    const hash = window.location.hash;
    console.log('Full hash:', hash);

    const [pathPart, queryString] = hash.split('?');
    console.log('Path part:', pathPart);
    console.log('Query string:', queryString);

    const pathSegments = pathPart.split('/');
    const licenceFromPath = pathSegments[pathSegments.length - 1];
    console.log('Licence from path:', licenceFromPath);

    let licenceFromQuery = '';
    if (queryString) {
      if (queryString.includes('=')) {
        const urlParams = new URLSearchParams(queryString);
        licenceFromQuery = urlParams.get('drivingLicenceNumber') || urlParams.get('licence') || '';
      } else {
        licenceFromQuery = queryString;
      }
    }
    console.log('Licence from query:', licenceFromQuery);

    const licenceNo = licenceFromQuery || licenceFromPath || '';
    console.log('Final Licence No:', licenceNo);

    return licenceNo;
  };
  
  const fetchDriverData = async () => {
    try {
      setLoading(true);
      setError(null);

      const drivingLicenceNumber = getDrivingLicenceFromUrl();

      if (!drivingLicenceNumber) {
        throw new Error('Driving licence number not found in URL');
      }

      console.log("Fetching driver from backend using:", drivingLicenceNumber);

      const response = await axios.post(`${BASE_URL}/api/driverData/getAllDriversByLicence`, {
        drivingLicenceNumber,
        userId:userName
      });

      if (response.data?.data) {
        setDrivingLicenceNumber(drivingLicenceNumber);
        setData(response.data.data?.details);
        console.log("Driver fetched successfully");
      } else {
        throw new Error("Driver not found");
      }

    } catch (err) {
      console.error("Error fetching driver data:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  const handleDownload = (record) => {
    console.log('Downloading record:', record);
    // Create a simple CSV download
    const csvContent = `Driver License No,Created,LC Check,Driver Status\n${record.driverLicenseNo},${record.created},${record.lcCheck},${record.driverStatus}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `driver-${record.driverLicenseNo}-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortableHeader = ({ children, sortKey }) => (
    <th
      className="sortable-header"
      onClick={() => handleSort(sortKey)}
    >
      <div className="header-content">
        {children}
        <ChevronDown
          className={`sort-icon ${sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'rotated' : ''
            }`}
        />
      </div>
    </th>
  );

  return (

    <div className="driver-license-container">
      <Navbar />
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="driver-table">
            <thead className="table-header">
              <tr>
                <SortableHeader sortKey="action">Action</SortableHeader>
                <SortableHeader sortKey="driverLicenseNo">Driver Licence No</SortableHeader>
                {/* <SortableHeader sortKey="created">Created</SortableHeader> */}
                <SortableHeader sortKey="lcCheck">LC Check</SortableHeader>
                {/* <SortableHeader sortKey="driverStatus">Driver Status</SortableHeader> */}
              </tr>
            </thead>
            <tbody className="table-body">
              {data.map((data) => (
                <tr key={data.id} className="table-row">
                  <td className="table-cell">
                    <div className="act-btns">
                      <button
                        onClick={() => handleView(record)}
                        className="act-btn view-btn"
                        title="View Details"
                      >
                        <Eye className="action-icon" />
                      </button>
                      <button
                        onClick={() => handleDownload(record)}
                        className="act-btn download-btn"
                        title="Download"
                      >
                        <Download className="action-icon" />
                      </button>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="license-no">{drivingLicenceNumber}</span>
                  </td>
                  {/* <td className="table-cell">
                    <span className="created-by">
                      {new Date(data.createdAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </td> */}
                  <td className="table-cell">
                     <span className="created-by">
                      {new Date(data.createdAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </td>
                  {/* <td className="table-cell">
                    <span className="status-badge">
                      {data.driverStatus}
                    </span>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverLicenseTable;