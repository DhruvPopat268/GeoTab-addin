import React from 'react';
import './DriverDetail.css'
import { usePDF } from 'react-to-pdf'

const DriverLicenceSummary = () => {
    const { toPDF, targetRef } = usePDF({
        filename: 'Driver_Information.pdf',
        page: {
            margin: 20,
            orientation: 'portrait',
            format: 'a4'
        }
    });
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
                        <h1>GURVINDER SINGH</h1>
                        <p><strong>Company Name:</strong> DEMO COMPANY</p>
                        <p><strong>Driver Licence No:</strong> SINGH908181G98PC</p>
                        <p><strong>Issue Number:</strong> 48</p>
                        <p><strong>Licence Valid From:</strong> 05/06/2024</p>
                        <p><strong>Licence Valid To:</strong> 01/06/2026</p>
                        <p><strong>Gender:</strong> MALE</p>
                        <p><strong>Date Of Birth:</strong> 18/08/1991</p>
                        <p><strong>Address:</strong> 18 SPEART LANE HOUNSLOW, TW5 9EF</p>
                    </div>

                    <div className="status-box">
                        <h2>Licence Status</h2>
                        <p className="status-text">Full</p>
                        <p className="status-text">Valid</p>
                    </div>
                    <div className="endorsements-box">
                        <h2>Endorsements</h2>
                        <p className="endorsement-text">0 Points</p>
                        <p className="endorsement-text">0 Offences</p>
                    </div>

                </div>

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
                            <tr>
                                <td>SP30</td>
                                <td>3</td>
                                <td>Exceeding statutory speed limit on a public road</td>
                                <td>15/03/2023</td>
                                <td>30/03/2023</td>
                            </tr>
                            <tr>
                                <td>CU80</td>
                                <td>6</td>
                                <td>Using a mobile phone while driving</td>
                                <td>20/07/2023</td>
                                <td>05/08/2023</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="parent-div">
                    <div className="first-div">
                        <table className="tachograph-table">
                            <caption>Driver Tachograph</caption>
                            <tr>
                                <td><strong>Tacho Card Number:</strong></td>
                                <td>DB21176517988800</td>
                            </tr>
                            <tr>
                                <td><strong>Valid From:</strong></td>
                                <td>26/06/2021</td>
                            </tr>
                            <tr>
                                <td><strong>Valid Until:</strong></td>
                                <td>25/06/2026</td>
                            </tr>
                        </table>
                    </div>

                    <div className="second-div">
                        <table className="qualification-table">
                            <caption>Driver Qualification Card (CPC)</caption>
                            <tr>
                                <td><strong>Type:</strong></td>
                                <td>International</td>
                            </tr>
                            <tr>
                                <td><strong>Valid From:</strong></td>
                                <td>----</td>
                            </tr>
                            <tr>
                                <td><strong>Valid Until:</strong></td>
                                <td>06/06/2026</td>
                            </tr>
                        </table>
                    </div>

                    <div className="additional-info">
                        <p><strong>Driver Consent Valid Until:</strong> 06/12/2027</p>
                        <p><strong>Current Licence Check Interval:</strong> 3 months</p>
                    </div>
                </div>

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
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>

                    </tbody>
                </table>

                <div className="disclaimer">
                    <h2>Disclaimer</h2>
                    <p>This disclaimer clarifies that PTC (Paramount Transport Consultants Ltd) is not accountable for the accuracy of the provided data since it originates from the DVLA (Driver and Vehicle Licensing Agency). By including this statement, PTC aims to inform users that any discrepancies or errors in the data are beyond their control and responsibility. If users encounter any issues or inaccuracies within the data, they are encouraged to reach out to PTC's technical team for assistance. The contact information for the technical team is provided, specifically an email address (it@ptctransport.co.uk), to ensure users have a direct line of communication to report problems or seek further information. This approach helps manage user expectations and directs them to the appropriate support channel for resolution, maintaining transparency and accountability in data handling.</p>
                </div>
            </div>
        </>
    );
};

export default DriverLicenceSummary;