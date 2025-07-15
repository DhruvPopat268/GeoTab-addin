import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar.jsx';
import { BASE_URL } from '../../../env.js';
import './componentStyles/DriverDetail.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';



const DriverLicenceSummary = () => {
    const [driverData, setDriverData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);


    const sessionDataRaw = localStorage.getItem("sTokens_ptcdemo1");
    const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
    const userName = sessionData?.userName || "unknown@user.com";

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

    // Fetch driver data from API
    const fetchDriverData = async () => {
        try {
            console.log("data", window.geotab?.api);

            setLoading(true);
            setError(null);

            const drivingLicenceNumber = getDrivingLicenceFromUrl();

            if (!drivingLicenceNumber) {
                throw new Error('Driving licence number not found in URL');
            }

            console.log("Fetching data for licence:", drivingLicenceNumber);

            const authResponse = await fetch('https://api-monitoring-and-purchasing-platform-df9e.onrender.com/proxy/6864c4fbe3b94cbfacee2b3c');
            if (!authResponse.ok) {
                throw new Error('Failed to get authentication token');
            }

            const authData = await authResponse.json();
            const token = authData.token;

            setLoading(true);

            const driverResponse = await fetch(
                'https://api-monitoring-and-purchasing-platform-df9e.onrender.com/proxy/6864c95bcf7c6ae928c398c9',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'vHjOOKz70O3L8mmcVAQDc3EqqxfRRWOgamUSCnN1',
                        'Authorization': token
                    },
                    body: JSON.stringify({
                        drivingLicenceNumber: drivingLicenceNumber,
                        userId: userName
                    })
                }
            );

            if (driverResponse.status === 404) {
                navigate('/lc-check')
                toast.error("Driver not found for this licenceNumber");
                return null;
            }

            if (!driverResponse.ok) {
                toast.error(`API request failed: ${driverResponse.status}`);
            }

            const driverData = await driverResponse.json();

            if (driverData.status && driverData.data) {
                setDriverData(driverData.data);

                try {
                    const backendResponse = await fetch(`${BASE_URL}/api/driverData`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            data: driverData.data,
                            userId: userName
                        })
                    });

                    if (!backendResponse.ok) {
                        const backendError = await backendResponse.json();
                        console.error("Backend error:", backendError);
                        throw new Error(backendError.message || 'Failed to save driver data');
                    }

                    const result = await backendResponse.json();
                    console.log(result.message);

                    // ✅ After successful driverData post, call deductDeposit
                    const deductResponse = await fetch(`${BASE_URL}/api/UserWallet/deductDeposit`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userId: userName  // make sure userName is defined
                        })
                    });

                    const deductResult = await deductResponse.json();
                    if (deductResponse.ok) {
                        console.log("✅", deductResult.message); // "API call successful. 1 credit deducted."
                        console.log("Remaining Credits:", deductResult.remainingCredits);
                    } else {
                        console.warn("❌ Failed to deduct credit:", deductResult.message);
                    }

                } catch (backendErr) {
                    console.error("Error storing driver data in backend:", backendErr);
                }

            } else {
                throw new Error('Invalid API response format or no data found');
            }


        } catch (err) {
            console.error("Error fetching driver data:", err);
            setError(`Error fetching driver details: ${err.message}`);
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

    // if (!driverData) {
    //     return (
    //         <div style={{
    //             display: 'flex',
    //             justifyContent: 'center',
    //             alignItems: 'center',
    //             height: '50vh',
    //             fontSize: '18px'
    //         }}>
    //             No driver data available
    //         </div>
    //     );
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
                        <p><strong>Driver Licence No:</strong> {safeGet(driverData, 'driver.drivingLicenceNumber')}</p>
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
                            <caption style={{
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
                            <caption style={{
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

                <h2 className='vehicle' style={{ color: '#333', marginBottom: '15px' }}>Vehicle You Can Drive</h2>

                <table className="vehicle-table" style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #ddd',
                    marginBottom: '30px'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
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

                <div className="disclaimer" style={{
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

export default DriverLicenceSummary;