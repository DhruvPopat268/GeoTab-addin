import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar.jsx';
import { BASE_URL } from '../../../env.js';
import './componentStyles/viewDriverDetailData.css';
import axios from 'axios';
import { toast } from 'react-toastify';

import { useNavigate } from 'react-router-dom';


const ViewDriverLicenceSummary = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const key = Object.keys(localStorage).find(k => k.startsWith("sTokens_"));

const sessionDataRaw = key ? localStorage.getItem(key) : null;

console.log("Key:", key);
console.log("Value:", sessionDataRaw);

    const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
    const userName = sessionData?.userName || "unknown@user.com";
    // const [drivingLicenceNumber, setDrivingLicenceNumber] = useState()
    const [driverData, setDriverData] = useState(null);

    // const [data, setData] = useState([])

    const targetRef = useRef();
    const navigate = useNavigate();


    // PDF Generation function using browser's print functionality
    const generatePDF = async () => {
        setIsGeneratingPDF(true);
        try {
            // Hide the download button during PDF generation
            const downloadBtn = document.querySelector('.downloadbtn');
            if (downloadBtn) downloadBtn.style.display = 'none';

            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            const element = targetRef.current;

            if (!element || !printWindow) {
                throw new Error('Unable to create print window');
            }

            // Get all styles from the current document
            const styles = Array.from(document.styleSheets)
                .map(styleSheet => {
                    try {
                        return Array.from(styleSheet.cssRules)
                            .map(rule => rule.cssText)
                            .join('\n');
                    } catch (e) {
                        return '';
                    }
                })
                .join('\n');

            // Create the HTML content for the print window
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Driver License Summary</title>
                    <style>
                        * {
                            box-sizing: border-box;
                        }
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            background: white;
                        }
                        @media print {
                            body {
                                margin: 0;
                                padding: 10px;
                            }
                            .no-print {
                                display: none !important;
                            }
                            table {
                                page-break-inside: avoid;
                            }
                            .parent-container {
                                page-break-inside: avoid;
                            }
                            .offences-container {
                                page-break-inside: avoid;
                            }
                            .parent-div {
                                page-break-inside: avoid;
                            }
                        }
                        ${styles}
                    </style>
                </head>
                <body>
                    ${element.innerHTML}
                </body>
                </html>
            `;

            // Write content to the new window
            printWindow.document.write(printContent);
            printWindow.document.close();

            // Wait for the content to load
            printWindow.onload = function () {
                setTimeout(() => {
                    // Print the window
                    printWindow.print();

                    // Close the window after printing
                    setTimeout(() => {
                        printWindow.close();
                    }, 100);
                }, 500);
            };

            toast.success('Print dialog opened. Please select "Save as PDF" in the print dialog to generate PDF.');

        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            // Show the download button again
            setTimeout(() => {
                const downloadBtn = document.querySelector('.downloadbtn');
                if (downloadBtn) downloadBtn.style.display = 'inline-block';
                setIsGeneratingPDF(false);
            }, 1000);
        }
    };

    // Extract driving licence number from URL
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

    const drivingLicenceNumber = getDrivingLicenceFromUrl();

    // Fetch driver data from API
    const fetchDriverData = async () => {
        try {
            setLoading(true);
            setError(null);

            const drivingLicenceNumber = getDrivingLicenceFromUrl();

            if (!drivingLicenceNumber) {
                throw new Error('Driving licence number not found in URL');
            }

            console.log("Fetching driver from backend using:", drivingLicenceNumber);

            const response = await axios.post(`${BASE_URL}/api/driverData/getRecentDriverByLicence`, {
                drivingLicenceNumber,
                userId: userName
            });

            if (response.data?.data) {
                // setDrivingLicenceNumber(drivingLicenceNumber);
                console.log(response.data?.data)
                setDriverData(response.data?.data);
                console.log("Driver fetched successfully");
            } else {
                // If data is empty or null, simulate 404
                navigate('/lc-check');
                toast.error("Driver not found for this licence number");
            }

        } catch (err) {
            if (err.response?.status === 404) {
                // This handles true 404 responses from the server
                navigate('/lc-check');
                toast.error("Driver not found for this licence number");
            } else {
                console.error("Error fetching driver data:", err);
                setError(`Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDriverData();
    }, []);

    if (loading) {
        return (
            <div className="spinner-container">
                <div className="spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                fontSize: '18px',
                color: 'red'
            }}>
                <p>{error}</p>
                <button
                    onClick={fetchDriverData}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    // if (!driverData) {
    //     toast.error("No driver data available")
    // }

    const formatDate = (dateString) => {
        if (!dateString || dateString === '----') return '----';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB');
        } catch {
            return dateString;
        }
    };

    const safeGet = (obj, path, defaultValue = '----') => {
        return path.split('.').reduce((current, key) => current?.[key], obj) || defaultValue;
    };

    return (
        <>
            <Navbar />

            {/* Download button positioned on the right */}
            <div className='download' style={{
                marginBottom: '20px',
                textAlign: 'right',
                paddingRight: '20px'
            }}>
                <button
                    className='downloadbtn'
                    onClick={generatePDF}
                    disabled={isGeneratingPDF}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: isGeneratingPDF ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        opacity: isGeneratingPDF ? 0.7 : 1
                    }}
                >
                    {isGeneratingPDF ? 'Generating PDF...' : 'Download Driver Information'}
                </button>
            </div>

            <div ref={targetRef} style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
                <div className="parent-container" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div className="details-container" style={{ flex: 2 }}>
                        <h1 style={{ color: '#333', marginBottom: '20px' }}>
                            {`${safeGet(driverData, 'driver.firstNames')} ${safeGet(driverData, 'driver.lastName')}`}
                        </h1>
                        {/* <p><strong>Company Name:</strong> prayosha</p> */}
                        <p><strong>Driver Licence No:</strong> {drivingLicenceNumber}</p>
                        <p><strong>Issue Number:</strong> {safeGet(driverData, 'token.issueNumber')}</p>
                        <p><strong>Licence Valid From:</strong> {formatDate(safeGet(driverData, 'token.validFromDate'))}</p>
                        <p><strong>Licence Valid To:</strong> {formatDate(safeGet(driverData, 'token.validToDate'))}</p>
                        <p><strong>Gender:</strong> {safeGet(driverData, 'driver.gender')}</p>
                        <p><strong>Date Of Birth:</strong> {formatDate(safeGet(driverData, 'driver.dateOfBirth'))}</p>
                        <p><strong>Address:</strong> {[
                            safeGet(driverData, 'driver.address.unstructuredAddress.line1'),
                            safeGet(driverData, 'driver.address.unstructuredAddress.line2'),
                            safeGet(driverData, 'driver.address.unstructuredAddress.line5'),
                            safeGet(driverData, 'driver.address.unstructuredAddress.postcode')
                        ].filter(item => item !== '----').join(', ')}</p>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="status-box" style={{
                            border: '2px solid #28a745',
                            padding: '15px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            backgroundColor: '#f8f9fa'
                        }}>
                            <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Licence Status</h2>
                            <p className="status-text" style={{ margin: '5px 0', fontWeight: 'bold', color: '#28a745' }}>
                                {safeGet(driverData, 'licence.type')}
                            </p>
                            <p className="status-text" style={{ margin: '5px 0', fontWeight: 'bold', color: '#28a745' }}>
                                {safeGet(driverData, 'licence.status')}
                            </p>
                        </div>

                        <div className="endorsements-box" style={{
                            border: '2px solid #007bff',
                            padding: '15px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            backgroundColor: '#f8f9fa'
                        }}>
                            <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Endorsements</h2>
                            <p className="endorsement-text" style={{ margin: '5px 0', fontWeight: 'bold', color: '#007bff' }}>
                                {driverData?.endorsements?.[0]?.penaltyPoints || 0} Points
                            </p>
                            <p className="endorsement-text" style={{ margin: '5px 0', fontWeight: 'bold', color: '#007bff' }}>
                                {driverData?.endorsements ? driverData.endorsements.length : 0} Offences
                            </p>
                        </div>
                    </div>
                </div>

                <div className="offences-container" style={{ marginBottom: '30px' }}>
                    <h2 style={{ color: '#333', marginBottom: '15px' }}>Offences</h2>
                    <table className="offences-table" style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: '1px solid #ddd'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Offence Code</th>
                                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Penalty Points</th>
                                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Offence Legal Literal</th>
                                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Offence Date</th>
                                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Conviction Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {driverData?.endorsements && driverData.endorsements.length > 0 ? (
                                driverData.endorsements.map((endorsement, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{endorsement.offenceCode || '----'}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{endorsement.points || '----'}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{endorsement.offenceLegalLiteral || '----'}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{formatDate(endorsement.offenceDate)}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{formatDate(endorsement.convictionDate)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{
                                        border: '1px solid #ddd',
                                        padding: '20px',
                                        textAlign: 'center',
                                        fontStyle: 'italic',
                                        color: '#666'
                                    }}>
                                        No offences found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="parent-div" style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <div className="first-div" style={{ flex: 1, minWidth: '300px' }}>
                        <table className="tachograph-table" style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid #ddd'
                        }}>
                            <caption className='tachograph-table-caption' style={{
                                fontWeight: 'bold',
                                marginBottom: '10px',
                                fontSize: '18px',
                                color: '#333'
                            }}>
                                Driver Tachograph
                            </caption>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Tacho Card Number:</th>
                                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Valid From:</th>
                                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Valid Until:</th>
                                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Card Status:</th>
                                </tr>
                            </thead>
                            <tbody>
                                {driverData?.holder?.tachoCards && driverData?.holder?.tachoCards.length > 0 ? (
                                    driverData?.holder?.tachoCards.map((tachoCards, index) => (
                                        <tr key={index}>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{tachoCards.cardNumber || '----'}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{formatDate(tachoCards.cardStartOfValidityDate)}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{formatDate(tachoCards.cardExpiryDate)}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{tachoCards.cardStatus || '----'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{
                                            border: '1px solid #ddd',
                                            padding: '20px',
                                            textAlign: 'center',
                                            fontStyle: 'italic',
                                            color: '#666'
                                        }}>
                                            No tachograph cards found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="second-div" style={{ flex: 1, minWidth: '300px' }}>
                        <table className="qualification-table" style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid #ddd'
                        }}>
                            <caption className='qualification-table-caption' style={{
                                fontWeight: 'bold',
                                marginBottom: '10px',
                                fontSize: '18px',
                                color: '#333'
                            }}>
                                Driver Qualification Card (CPC)
                            </caption>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid #ddd', padding: '10px', backgroundColor: '#f8f9fa' }}>
                                        <strong>Type:</strong>
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                        {safeGet(driverData, 'cpc.cpcs.0.type')}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ border: '1px solid #ddd', padding: '10px', backgroundColor: '#f8f9fa' }}>
                                        <strong>Valid From:</strong>
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                        {formatDate(safeGet(driverData, 'cpc.cpcs.0.lgvValidFrom'))}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ border: '1px solid #ddd', padding: '10px', backgroundColor: '#f8f9fa' }}>
                                        <strong>Valid Until:</strong>
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                        {formatDate(safeGet(driverData, 'cpc.cpcs.0.lgvValidTo'))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <h2 className='vehiclee' style={{ color: '#333', marginBottom: '15px' }}>Vehicle You Can Drive</h2>

                <table className="vehicle-table" style={{
                    width: '90%',
                    borderCollapse: 'collapse',
                    border: '1px solid #ddd',
                    marginBottom: '30px',
                    marginLeft: "60px"
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'center' }}>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>CATEGORY</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>START DATE</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>UNTIL DATE</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>CATEGORY TYPE</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>RESTRICTIONS CODE</th>
                        </tr>

                    </thead>
                    <tbody>
                        {driverData?.entitlement && driverData.entitlement.length > 0 ? (
                            driverData.entitlement.map((category, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold' }}>{category.categoryCode}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{formatDate(category.fromDate)}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{formatDate(category.expiryDate)}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{category.categoryType}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                        {category.restrictions && category.restrictions.length > 0
                                            ? category.restrictions.map(r => r.restrictionCode).join(', ')
                                            : '----'
                                        }
                                    </td>
                                </tr>
                            ))
                        ) : (
                            Array.from({ length: 7 }, (_, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: '10px', height: '40px' }}></td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}></td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}></td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}></td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="disclaimerr" style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    padding: '20px',
                    borderRadius: '8px'
                }}>
                    <h2 style={{ color: '#856404', marginTop: 0 }}>Disclaimer</h2>
                    <p style={{
                        lineHeight: '1.6',
                        color: '#856404',
                        margin: 0
                    }}>
                        This disclaimer clarifies that PTC (Paramount Transport Consultants Ltd) is not accountable for the accuracy of the provided data since it originates from the DVLA (Driver and Vehicle Licensing Agency). By including this statement, PTC aims to inform users that any discrepancies or errors in the data are beyond their control and responsibility. If users encounter any issues or inaccuracies within the data, they are encouraged to reach out to PTC's technical team for assistance. The contact information for the technical team is provided, specifically an email address (it@ptctransport.co.uk), to ensure users have a direct line of communication to report problems or seek further information. This approach helps manage user expectations and directs them to the appropriate support channel for resolution, maintaining transparency and accountability in data handling.
                    </p>
                </div>
            </div>
        </>
    );
};

export default ViewDriverLicenceSummary;