import React, { useState, useEffect } from 'react';
import './DriverDetail.css';
import { usePDF } from 'react-to-pdf';
import axios from 'axios';

const DriverLicenceSummary = ({ geotabApi }) => {
  const { toPDF, targetRef } = usePDF({
    filename: 'Driver_Information.pdf',
    page: {
      margin: 20,
      orientation: 'portrait',
      format: 'a4'
    }
  });

  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        // Get driver data passed from navigation
        const options = await geotabApi.addin.getCurrentPageOptions();
        if (options && options.driverData) {
          setDriverData(options.driverData);
        } else {
          throw new Error("No driver data available");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (geotabApi && geotabApi.addin) {
      fetchDriverData();
    }
  }, [geotabApi]);

  if (loading) return <div className="loading">Loading driver details...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
      <div className='download'>
        <button className='downloadbtn' onClick={() => toPDF()}>
          Download Driver Information
        </button>
      </div>

      <div ref={targetRef}>
        <div className="parent-container">
          <div className="details-container">
            <h1>{driverData.firstNames?.toUpperCase()} {driverData.lastName?.toUpperCase()}</h1>
            <p><strong>Company Name:</strong> {driverData.companyName || 'N/A'}</p>
            <p><strong>Driver Licence No:</strong> {driverData.drivingLicenceNumber || 'N/A'}</p>
            <p><strong>Issue Number:</strong> {driverData.issueNumber || 'N/A'}</p>
            <p><strong>Licence Valid From:</strong> {driverData.validFrom || 'N/A'}</p>
            <p><strong>Licence Valid To:</strong> {driverData.validTo || 'N/A'}</p>
            <p><strong>Gender:</strong> {driverData.gender?.toUpperCase() || 'N/A'}</p>
            <p><strong>Date Of Birth:</strong> {driverData.dateOfBirth || 'N/A'}</p>
            <p><strong>Address:</strong> {driverData.address?.unstructuredAddress?.line1 || 'N/A'}, {driverData.address?.unstructuredAddress?.postcode || 'N/A'}</p>
          </div>

          <div className="status-box">
            <h2>Licence Status</h2>
            <p className="status-text">{driverData.licenceStatus || 'N/A'}</p>
            <p className="status-text">{driverData.licenceValid ? 'Valid' : 'Invalid'}</p>
          </div>

          <div className="endorsements-box">
            <h2>Endorsements</h2>
            <p className="endorsement-text">{driverData.endorsementPoints || 0} Points</p>
            <p className="endorsement-text">{driverData.offences?.length || 0} Offences</p>
          </div>
        </div>

        {/* Offences Table */}
        <div className="offences-container">
          <h2>Offences</h2>
          <table className="offences-table">
            <thead>
              <tr>
                <th>Offence Code</th>
                <th>Penalty Points</th>
                <th>Offence Legal Literal</th>
                <th>Offence Date</th>
                <th>Conviction Date</th>
              </tr>
            </thead>
            <tbody>
              {driverData.offences?.length > 0 ? (
                driverData.offences.map((offence, index) => (
                  <tr key={index}>
                    <td>{offence.code || 'N/A'}</td>
                    <td>{offence.points || 'N/A'}</td>
                    <td>{offence.description || 'N/A'}</td>
                    <td>{offence.offenceDate || 'N/A'}</td>
                    <td>{offence.convictionDate || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No offences recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tachograph and CPC Section */}
        <div className="parent-div">
          <div className="first-div">
            <table className="tachograph-table">
              <caption>Driver Tachograph</caption>
              <tbody>
                <tr>
                  <td><strong>Tacho Card Number:</strong></td>
                  <td>{driverData.tachographCardNumber || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Valid From:</strong></td>
                  <td>{driverData.tachographValidFrom || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Valid Until:</strong></td>
                  <td>{driverData.tachographValidTo || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="second-div">
            <table className="qualification-table">
              <caption>Driver Qualification Card (CPC)</caption>
              <tbody>
                <tr>
                  <td><strong>Type:</strong></td>
                  <td>{driverData.cpcType || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Valid From:</strong></td>
                  <td>{driverData.cpcValidFrom || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Valid Until:</strong></td>
                  <td>{driverData.cpcValidTo || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="additional-info">
            <p><strong>Driver Consent Valid Until:</strong> {driverData.consentValidUntil || 'N/A'}</p>
            <p><strong>Current Licence Check Interval:</strong> {driverData.licenceCheckInterval || 'N/A'}</p>
          </div>
        </div>

        {/* Vehicle Categories Table */}
        <h2 className='vehicle'>Vehicle You Can Drive</h2>
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>CATEGORY</th>
              <th>START DATE</th>
              <th>UNTIL DATE</th>
              <th>CATEGORY TYPE</th>
              <th>RESTRICTIONS CODE</th>
            </tr>
          </thead>
          <tbody>
            {driverData.vehicleCategories?.length > 0 ? (
              driverData.vehicleCategories.map((category, index) => (
                <tr key={index}>
                  <td>{category.category || 'N/A'}</td>
                  <td>{category.startDate || 'N/A'}</td>
                  <td>{category.endDate || 'N/A'}</td>
                  <td>{category.type || 'N/A'}</td>
                  <td>{category.restrictions || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No vehicle categories available</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Disclaimer Section */}
        <div className="disclaimer">
          <h2>Disclaimer</h2>
          <p>This disclaimer clarifies that PTC (Paramount Transport Consultants Ltd) is not accountable for the accuracy of the provided data since it originates from the DVLA (Driver and Vehicle Licensing Agency). By including this statement, PTC aims to inform users that any discrepancies or errors in the data are beyond their control and responsibility. If users encounter any issues or inaccuracies within the data, they are encouraged to reach out to PTC's technical team for assistance. The contact information for the technical team is provided, specifically an email address (it@ptctransport.co.uk), to ensure users have a direct line of communication to report problems or seek further information. This approach helps manage user expectations and directs them to the appropriate support channel for resolution, maintaining transparency and accountability in data handling.</p>
        </div>
      </div>
    </>
  );
};

export default DriverLicenceSummary;