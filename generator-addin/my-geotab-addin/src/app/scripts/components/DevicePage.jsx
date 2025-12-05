import React, { useState, useContext, useEffect } from 'react';
import Geotab from '../contexts/Geotab';
import { useForm } from 'react-hook-form';
import './componentStyles/DevicePage.css';
import axios from 'axios'
import { BASE_URL } from '../../../env.js';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { toast } from 'react-toastify';

const DevicePage = ({ }) => {
  const [context, setContext] = useContext(Geotab);
  const { geotabApi, geotabState, logger } = context;
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm();

  // Define all options
  const statusOptions = ['Active', 'InActive', 'Archive'];
  const yesNoOptions = ['Yes', 'No'];
  const companyOptions = ['Company A', 'Company B'];
  const driverGroupsOptions = ['Group 1', 'Group 2'];
  const depotOptions = ['Main Depot', 'North Depot'];

  const [originalDrivers, setOriginalDrivers] = useState([]);
  const [displayedDrivers, setDisplayedDrivers] = useState([]);
  const [editingDriver, setEditingDriver] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All Statuses');

  // New state for DVLA view functionality
  const [viewLoading, setViewLoading] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);
  const [showDriverDetails, setShowDriverDetails] = useState(false);
  const [error, setError] = useState('');


  // New state for sync confirmation
  const [showSyncConfirm, setShowSyncConfirm] = useState(null);

  // Watch company selection for dependent fields
  const selectedCompany = watch('companyName');

  const key = Object.keys(localStorage).find(k => k.startsWith("sTokens_"));

  const sessionDataRaw = key ? localStorage.getItem(key) : null;

  console.log("Key:", key);
  console.log("Value:", sessionDataRaw);

  const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
  const userName = sessionData?.userName || "unknown@user.com";
  console.log("userName is", userName)
  const database = sessionData?.database
  const [loading, setLoading] = useState(false);

  // Add interval update handler
  const [intervalPopup, setIntervalPopup] = useState({ open: false, driver: null });
  const [intervalValue, setIntervalValue] = useState(1);

  const [drivers, setDrivers] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalDrivers, setTotalDrivers] = useState(0);

  // Fetch drivers when page or recordsPerPage changes
  useEffect(() => {
    fetchDriversPage(currentPage, recordsPerPage);
  }, [currentPage, recordsPerPage]);

  const fetchTotalDriverCount = async () => {
    let totalCount = 0;
    let fromVersion = 0;
    let hasMore = true;

    while (hasMore) {
      await new Promise((resolve, reject) => {
        geotabApi.call("Get", {
          typeName: "User",
          resultsLimit: 5000,
          fromVersion: fromVersion,
          search: { isDriver: true }
        }, function (users) {
          totalCount += users.length;
          if (users.length < 5000) {
            hasMore = false;
          } else {
            fromVersion = Math.max(...users.map(u => u.version || 0)) + 1;
          }
          resolve();
        }, reject);
      });
    }

    setTotalDrivers(totalCount);
    return totalCount;
  };

  const fetchDriversPage = async (page = 1, limit = recordsPerPage) => {
    try {
      setLoading(true);

      if (!geotabApi) {
        console.error("Geotab API not available");
        toast.error("Geotab API not available");
        return;
      }

      // Get total count on first load
      if (totalDrivers === 0) {
        await fetchTotalDriverCount();
      }

      const fromVersion = (page - 1) * limit;
      
      await new Promise((resolve, reject) => {
        geotabApi.call("Get", {
          typeName: "User",
          resultsLimit: limit,
          fromVersion: fromVersion,
          search: {
            isDriver: true,
            orderBy: [{
              property: "lastAccessDate",
              direction: "desc"
            }]
          }
        }, function (users) {
          console.log(`Fetched ${users.length} drivers for page ${page}`);
          
          const transformedDrivers = users.map(driver => ({
            id: driver.id,
            Email: driver.name || `${driver.firstName} ${driver.lastName}`,
            firstName: driver.firstName || "",
            lastName: driver.lastName || "",
            employeeNo: driver.employeeNo || "",
            phoneNumber: driver.phoneNumber || "",
            licenseNumber: driver.licenseNumber || "",
            licenseProvince: driver.licenseProvince || "",
            driverStatus: driver.isActive ? "Active" : "InActive",
            lcCheckInterval: driver.lcCheckInterval || 1,
            lastAccessDate: driver.lastAccessDate
          }));

          setOriginalDrivers(transformedDrivers);
          setDisplayedDrivers(transformedDrivers);
          setLoading(false);
          resolve();
        }, function (error) {
          console.error("Error fetching drivers from Geotab:", error);
          toast.error(`Error fetching drivers: ${error.message}`);
          setLoading(false);
          reject(error);
        });
      });

    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error(`Error fetching drivers: ${error.message}`);
      setLoading(false);
    }
  };

  const fetchAllDrivers = () => fetchDriversPage(currentPage, recordsPerPage);

  // Add this function after fetchAllDrivers
  const syncDriversToMongo = async (drivers) => {
    if (!drivers || drivers.length === 0) return;

    setLoading(true);
    // Map licenseNumber to licenseNo for backend compatibility and include geotabId
    const mappedDrivers = drivers.map(driver => ({
      ...driver,
      licenseNo: driver.licenseNumber,
      geotabId: driver.id, // Include the Geotab ID
    }));

    try {
      const res = await axios.post(`${BASE_URL}/api/driver/sync`, {
        drivers: mappedDrivers,
        userName,
        database
      });
      if (res.status === 200) {
        toast.success(res.data?.message || 'Drivers synced');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to sync drivers';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    setLoading(true);
    let success = false;
    let retryCount = 0;
    const maxRetries = 5;

    while (!success && retryCount < maxRetries) {
      try {
        const res = await axios.post(`${BASE_URL}/api/driver/getAllDrivers`, {
          userName,
          database
        });
        if (res.status === 200) {
          setDrivers(res.data.data || []);
          setError('');
          success = true;
        }
      } catch (err) {
        console.error('Error fetching drivers:', err);
        setError(err.response?.data?.message || 'Failed to fetch drivers');
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    if (!success) {
      toast.error('Failed to fetch drivers after multiple attempts');
    }
    setLoading(false);
  };

  // to store in mongo and fetch from mongo when originalDrivers change
  useEffect(() => {
  (async () => {
    if (originalDrivers.length > 0) {
      await syncDriversToMongo(originalDrivers); // wait until sync is done
      await fetchDrivers(); // then fetch from Mongo
    }
  })();
}, [originalDrivers]);

  // Update sendConsentEmails to handle a single driver
  const sendConsentEmails = async (driver) => {
    const licenseNumber = driver.licenseNumber || driver.licenseNo;
    const email = driver.Email || driver.email;
    const firstName = driver.firstName;
    const lastName = driver.lastName;

    // Validation check
    if (!firstName || !lastName || !licenseNumber || !email) {
      toast.error("First Name, Last Name, License Number, and Email are required");
      return { success: false };
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/DriverConsent/sendEmail`, {
        firstName,
        lastName,
        licenceNo: licenseNumber,
        email
      });
      toast.success(res.data?.message || 'Consent email sent');
      return res.data;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to send consent email';
      toast.error(msg);
      return err.response?.data || { success: false };
    }
  };

  const onsubmit = async (data) => {
    const isEditing = Boolean(editingDriver);

    try {
      if (!geotabApi) {
        toast.error("Geotab API not available");
        return;
      }

      if (isEditing) {
        // Update existing driver in Geotab
        const updatedDriver = {
          id: editingDriver.id,
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          employeeNo: data.employeeNo,
          phoneNumber: data.phoneNumber,
          licenseNumber: data.licenseNumber,
          licenseProvince: data.licenseProvince,
          isDriver: true,
          isActive: true
        };

        geotabApi.call("Set", {
          typeName: "User",
          entity: updatedDriver
        }, function (result) {
          console.log("Driver updated:", result);
          toast.success("Driver updated successfully");
          fetchAllDrivers();
          reset();
          setEditingDriver(null);
          setShowCreateForm(false);
        }, function (error) {
          console.error("Error updating driver:", error);
          toast.error(`Error updating driver: ${error.message}`);
        });

      } else {
        // Create new driver in Geotab
        const newDriver = {
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          employeeNo: data.employeeNo,
          phoneNumber: data.phoneNumber,
          licenseNumber: data.licenseNumber,
          licenseProvince: data.licenseProvince,
          isDriver: true,
          isActive: true,
          // Required fields for Geotab
          driverGroups: [{ id: "GroupCompanyId" }],
          companyGroups: [{ id: "GroupCompanyId" }],
          securityGroups: [{ id: "GroupUserSecurityId" }],
          activeFrom: new Date().toISOString(),
          activeTo: "2050-01-01T00:00:00.000Z"
        };

        geotabApi.call("Add", {
          typeName: "User",
          entity: newDriver
        }, function (result) {
          console.log("Driver created:", result);
          toast.success("Driver created successfully");
          fetchAllDrivers();
          reset();
          setShowCreateForm(false);
        }, function (error) {
          console.error("Error creating driver:", error);
          toast.error(`Error creating driver: ${error.message}`);
        });
      }

    } catch (error) {
      console.error("Error submitting driver:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleEdit = (driver) => {
    window.location.href = `https://my.geotab.com/${database}/#user,currentTab:user,id:${driver.geotabId}`
  };

  const handleDelete = (driver) => {
    setShowDeleteConfirm(driver);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const confirmDelete = async () => {
    try {
      if (!showDeleteConfirm) return;

      const res = await axios.delete(`${BASE_URL}/api/driver/delete`, {
        data: { email: showDeleteConfirm.email, userName }
      });

      if (res.status !== 200) {
        throw new Error(res.data.message || "Delete failed");
      }

      // Refresh the data from server
      await fetchAllDrivers();

      // Close modal and show success
      setShowDeleteConfirm(null);
      toast.success("Driver deleted successfully");

    } catch (error) {
      console.error("Delete error:", error);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      setShowDeleteConfirm(null);
    }
  };

  const applyFilter = () => {
    if (filterStatus === 'All Statuses') {
      setDisplayedDrivers(originalDrivers);
    } else {
      const filtered = originalDrivers.filter(
        driver => driver.driverStatus === filterStatus
      );
      setDisplayedDrivers(filtered);
    }
  };

  const resetFilter = () => {
    setFilterStatus('All Statuses');
    setDisplayedDrivers(originalDrivers);
  };

  // Handle sync button click - show confirmation popup
  const handleSync = async (driver) => {
    const emailRes = await sendConsentEmails(driver);
    if (!emailRes.success) return;
    setShowSyncConfirm(driver);
  };

  // Cancel sync confirmation
  const cancelSync = () => {
    setShowSyncConfirm(null);
  };

  // Confirm sync - check eligibility and proceed
  const confirmSync = async () => {
    try {
      if (!showSyncConfirm) return;
      setViewLoading(showSyncConfirm.id);
      // Check wallet eligibility
      const eligibilityResponse = await axios.post(`${BASE_URL}/api/UserWallet/checksEligibility`, {
        userId: userName,
        database
      });
      if (eligibilityResponse.status === 200) {
        const { zeroCredit, planExpired } = eligibilityResponse.data;
        if (zeroCredit || planExpired) {
          toast.error("You don't have enough credits");
          setViewLoading(null);
          setShowSyncConfirm(null);
          return;
        }
        if(!eligibilityResponse.data.success){
          toast.error(eligibilityResponse.data.message || "You don't have enough credits");
          setViewLoading(null);
          setShowSyncConfirm(null);
          return
        }
        // Use fallback for license number
        const licenseNumber = showSyncConfirm.licenseNumber || showSyncConfirm.licenseNo;
        navigate(`/driverDetail/?${licenseNumber}`);
        setShowSyncConfirm(null);
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
      toast.error(`Error checking eligibility: ${error.response?.data?.message || error.message}`);
    } finally {
      setViewLoading(null);
    }
  };

  // Updated handleView function (keeping the original for backward compatibility)
  const handleView = async (driver) => {
    const emailRes = await sendConsentEmails(driver);
    if (!emailRes.success) return;
    const licenseNumber = driver.licenseNumber || driver.licenseNo;
    navigate(`/viewDriverDetailData/?${licenseNumber}`)
  };

  const handleHistory = async (driver) => {
    const emailRes = await sendConsentEmails(driver);
    if (!emailRes.success) return;
    const licenseNumber = driver.licenseNumber || driver.licenseNo;
    navigate(`/GetHistoryOfDriverDetail/?${licenseNumber}`)
  };

  // Add interval update handler
  const handleIntervalClick = (driver) => {
    setIntervalValue(driver.lcCheckInterval || 1);
    setIntervalPopup({ open: true, driver });
  };

  const handleIntervalSubmit = async () => {
    if (!intervalPopup.driver) return;
    try {
      await axios.patch(`${BASE_URL}/api/driver/update-interval`, {
        licenseNo: intervalPopup.driver.licenseNo,
        lcCheckInterval: intervalValue,
        userName,
        database
      });
      toast.success('Interval updated');
      // Update local state for immediate UI feedback
      setOriginalDrivers((prev) => prev.map(d =>
        d.id === intervalPopup.driver.id ? { ...d, lcCheckInterval: intervalValue } : d
      ));
      setDisplayedDrivers((prev) => prev.map(d =>
        d.id === intervalPopup.driver.id ? { ...d, lcCheckInterval: intervalValue } : d
      ));
      setIntervalPopup({ open: false, driver: null });
    } catch (err) {
      toast.error('Failed to update interval');
    }
  };

  // Pagination helper function
  const generatePaginationRange = (currentPage, totalPages) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    range.push(1);

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    let prev = 0;
    for (let i of uniqueRange) {
      if (i - prev > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  // Pagination logic - use displayedDrivers for Geotab data
  const totalPages = Math.ceil(displayedDrivers.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedDrivers = displayedDrivers.slice(startIndex, startIndex + recordsPerPage);

  // Reset to first page when records per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [recordsPerPage]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="root">
      <Navbar />

      <div className="page-container">

        <div className="drivers-table-container">
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div></div>
              <div>
                <label>Records per page:</label>
                <select value={recordsPerPage} onChange={(e) => setRecordsPerPage(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="card-content">
              <table className="drivers-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Id</th>
                    <th>Email</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>License Number</th>
                    <th>Phone Number</th>
                    <th>Interval (Daily)</th>
                    <th>License Province</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDrivers.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", padding: "12px" }}>
                        No drivers found
                      </td>
                    </tr>
                  ) : (
                    paginatedDrivers.map((driver) => (
                      <tr key={driver.id}>
                        <td className="action-buttons">
                          <button
                            className="table-action-btn view"
                            onClick={() => handleSync(driver)}
                            disabled={viewLoading === driver.id}
                          >
                            {viewLoading === driver.id ? "Loading..." : "Sync"}
                          </button>
                          <button
                            className="table-action-btn view"
                            onClick={() => handleView(driver)}
                            disabled={viewLoading === driver.id}
                          >
                            {viewLoading === driver.id ? "Loading..." : "View"}
                          </button>
                          <button
                            className="table-action-btn view"
                            onClick={() => handleHistory(driver)}
                            disabled={viewLoading === driver.id}
                          >
                            {viewLoading === driver.id ? "Loading..." : "History"}
                          </button>
                          <button
                            className="table-action-btn view"
                            onClick={() => handleEdit(driver)}
                          >
                            Edit
                          </button>
                          <button
                            className="table-action-btn view"
                            onClick={() => handleIntervalClick(driver)}
                          >
                            Interval
                          </button>
                        </td>
                        <td>{driver.geotabId}</td>
                        <td>{driver.email}</td>
                        <td>{driver.firstName}</td>
                        <td>{driver.lastName}</td>
                        <td>{driver.licenseNo}</td>
                        <td>{driver.phoneNumber}</td>
                        <td>{driver.lcCheckInterval || 1}</td>
                        <td>{driver.licenseProvince}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              <div className="table-footer">
                <div className="pagination-info">
                  Showing {startIndex + 1}-{Math.min(startIndex + recordsPerPage, displayedDrivers.length)} of {displayedDrivers.length} (Total: {totalDrivers} drivers)
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="pagination-nav"
                    >
                      Previous
                    </button>

                    {generatePaginationRange(currentPage, totalPages).map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? 'active' : ''}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="pagination-nav"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Confirmation Modal */}
      {showSyncConfirm && (
        <div className="form-popup-overlay">
          <div className="confirm-popup-content">
            <h3>Confirm Sync</h3>
            <p>This action is chargeable. Do you want to proceed with syncing driver {showSyncConfirm.Email}?</p>
            <div className="confirm-buttons">
              <button onClick={cancelSync} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmSync} className="confirm-btn">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {showDriverDetails && driverDetails && (
        <div className="form-popup-overlay">
          <div className="form-popup-content driver-details-modal">
            <h2 className='Driver-Modal-Title'>Driver Details - {driverDetails.driver.Email}</h2>
            <button
              className="close-btn"
              onClick={() => {
                setShowDriverDetails(false);
                setDriverDetails(null);
              }}
            >
              ×
            </button>

            <div className="driver-details-content">
              <div className="details-section">
                <h3>Local Driver Information</h3>
                <div className="details-grid">
                  <div><strong>Name:</strong> {driverDetails.driver.Email}</div>
                  <div><strong>License No:</strong> {driverDetails.driver.licenseNo}</div>
                  <div><strong>Email:</strong> {driverDetails.driver.email}</div>
                  <div><strong>Contact:</strong> {driverDetails.driver.contactNumber}</div>
                  <div><strong>Company:</strong> {driverDetails.driver.companyName}</div>
                  <div><strong>Status:</strong> {driverDetails.driver.driverStatus}</div>
                </div>
              </div>

              <div className="details-section">
                <h3>DVLA Information</h3>
                <div className="dvla-details">
                  <pre>{JSON.stringify(driverDetails.dvlaData, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowDriverDetails(false);
                  setDriverDetails(null);
                }}
                className="cancel-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete driver {showDeleteConfirm.Email}?</p>
            <div className="delete-confirm-buttons">
              <button onClick={cancelDelete} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmDelete} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Updated JSX for the interval popup */}
      {intervalPopup.open && (
        <div className="modern-popup-overlay">
          <div className="modern-popup-content">
            <div className="popup-header">
              <h3>Set Interval for</h3>
            </div>

            <div className="popup-body">
              <div className="form-group">
                <label htmlFor="interval-select">Interval (minutes):</label>
                <select
                  id="interval-select"
                  value={intervalValue}
                  onChange={e => setIntervalValue(Number(e.target.value))}
                  className="modern-select"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="popup-footer">
              <button
                onClick={() => setIntervalPopup({ open: false, driver: null })}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleIntervalSubmit}
                className="btn-primary"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicePage;