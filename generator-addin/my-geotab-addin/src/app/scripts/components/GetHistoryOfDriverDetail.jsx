import React, { useState, useEffect } from 'react';
import { Eye, Download, ChevronDown } from 'lucide-react';
import './componentStyles/GetHistoryOfDriverDetail.css';
import Navbar from './Navbar.jsx';
import axios from 'axios';
import { BASE_URL } from '../../../env.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DriverLicenseTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivingLicenceNumber, setDrivingLicenceNumber] = useState()

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const navigate = useNavigate();


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

  const handleView = (data) => {
    navigate (`/LCCheckView/?/${drivingLicenceNumber}/${data._id}`)
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

  const generatePDF = (recordData) => {
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const checkDate = new Date(recordData.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Driver License Check Report</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
          }
          
          .pdf-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #007bff;
          }
          
          .header h1 {
            color: #007bff;
            font-size: 28px;
            margin-bottom: 10px;
          }
          
          .header p {
            color: #666;
            font-size: 14px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          
          .info-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
          }
          
          .info-section h3 {
            color: #007bff;
            margin-bottom: 15px;
            font-size: 16px;
          }
          
          .info-row {
            display: flex;
            margin-bottom: 10px;
          }
          
          .info-label {
            font-weight: bold;
            width: 140px;
            color: #555;
          }
          
          .info-value {
            color: #333;
            flex: 1;
          }
          
          .status-section {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
            margin-bottom: 30px;
          }
          
          .status-section h3 {
            color: #28a745;
            margin-bottom: 15px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: #28a745;
            color: white;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
          }
          
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          
          .verification-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
          }
          
          .verification-note h4 {
            color: #856404;
            margin-bottom: 10px;
          }
          
          .verification-note p {
            color: #856404;
            font-size: 14px;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .pdf-container {
              box-shadow: none;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="pdf-container">
          <div class="header">
            <h1>Driver License Verification Report</h1>
            <p>Generated on ${currentDate}</p>
          </div>
          
          <div class="info-grid">
            <div class="info-section">
              <h3>License Information</h3>
              <div class="info-row">
                <span class="info-label">License Number:</span>
                <span class="info-value">${drivingLicenceNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Check Date:</span>
                <span class="info-value">${checkDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Report ID:</span>
                <span class="info-value">${recordData._id}</span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>System Information</h3>
              <div class="info-row">
                <span class="info-label">Checked By:</span>
                <span class="info-value">${userName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">System:</span>
                <span class="info-value">LC Check System</span>
              </div>
              <div class="info-row">
                <span class="info-label">Version:</span>
                <span class="info-value">1.0</span>
              </div>
            </div>
          </div>
          
          <div class="status-section">
            <h3>Verification Status</h3>
            <div class="status-badge">VERIFIED</div>
            <p style="margin-top: 10px; color: #155724;">
              The driving license has been successfully verified through our system.
            </p>
          </div>
          
          <div class="verification-note">
            <h4>Important Note</h4>
            <p>This report is generated automatically by the LC Check System. 
            Please verify the authenticity of this document through official channels if required.</p>
          </div>
          
          <div class="footer">
            <p>This document was generated automatically by the LC Check System.</p>
            <p>© 2024 LC Check System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  };

  // const handleDownload = (recordData) => {
  //   try {
  //     console.log('Downloading record:', recordData);
      
  //     // Generate PDF-like HTML content
  //     const pdfContent = generatePDF(recordData);
      
  //     // Create blob and download
  //     const blob = new Blob([pdfContent], { type: 'text/html;charset=utf-8' });
  //     const link = document.createElement('a');
  //     const url = URL.createObjectURL(blob);
      
  //     link.setAttribute('href', url);
  //     link.setAttribute('download', `driver-license-report-${drivingLicenceNumber}-${Date.now()}.html`);
  //     link.style.visibility = 'hidden';
      
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
      
  //     // Clean up
  //     URL.revokeObjectURL(url);
      
  //     toast.success('Report downloaded successfully!');
  //   } catch (error) {
  //     console.error('Download error:', error);
  //     toast.error('Failed to download report');
  //   }
  // };

  // const SortableHeader = ({ children, sortKey }) => (
  //   <th
  //     className="sortable-header"
  //     onClick={() => handleSort(sortKey)}
  //   >
  //     <div className="header-content">
  //       {children}
  //       <ChevronDown
  //         className={`sort-icon ${sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'rotated' : ''
  //           }`}
  //       />
  //     </div>
  //   </th>
  // );

  if (loading) {
    return (
      <div className="driver-license-container">
        <Navbar />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          color: '#6b7280'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <p>Loading driver data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="driver-license-container">
        <Navbar />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#dc2626',
            fontSize: '18px',
            marginBottom: '20px',
            padding: '20px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            maxWidth: '500px'
          }}>{error}</p>
          <button 
            onClick={fetchDriverData} 
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="driver-license-container">
      <Navbar />
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="driver-table">
            <thead className="table-header">
              <tr>
                {/* <SortableHeader sortKey="action">Action</SortableHeader>
                <SortableHeader sortKey="driverLicenseNo">Driver Licence No</SortableHeader>
                <SortableHeader sortKey="lcCheck">LC Check</SortableHeader> */}

                <th>Action</th>
                <th>Driver Licence No</th>
                <th>LC Check</th>

              </tr>
            </thead>
            <tbody className="table-body">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="3" className="table-cell" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontStyle: 'italic' }}>
                    No records found for this license number.
                  </td>
                </tr>
              ) : (
                data.map((record) => (
                  <tr key={record._id} className="table-row">
                    <td className="table-cell">
                      <div className="act-btns">
                        <button
                          onClick={() => handleView(record)}
                          className="act-btn view-btn"
                          title="View Details"
                        >
                          <Eye className="action-icon" />
                        </button>
                        {/* <button
                          onClick={() => handleDownload(record)}
                          className="act-btn download-btn"
                          title="Download Report"
                        >
                          <Download className="action-icon" />
                        </button> */}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="license-no">{drivingLicenceNumber}</span>
                    </td>
                    <td className="table-cell">
                      <span className="lc-check">
                        {new Date(record.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverLicenseTable;