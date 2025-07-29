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

  // New state for sync confirmation
  const [showSyncConfirm, setShowSyncConfirm] = useState(null);

  // Watch company selection for dependent fields
  const selectedCompany = watch('companyName');

  const sessionDataRaw = localStorage.getItem("sTokens_ptcdemo1");
  const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
  const userName = sessionData?.userName || "unknown@user.com";
  console.log("userName is", userName)
  const database = sessionData?.database
  const [loading, setLoading] = useState(false);

  // Add interval update handler
  const [intervalPopup, setIntervalPopup] = useState({ open: false, driver: null });
  const [intervalValue, setIntervalValue] = useState(1);

  const [drivers, setDrivers] = useState([]);

  // Fetch all drivers on component mount
  useEffect(() => {
    fetchAllDrivers();
    console.log("original drivers are", originalDrivers)
    console.log("displayed drivers are", displayedDrivers)

  }, []);

  useEffect(() => {
    console.log("original drivers are", originalDrivers);
    console.log("displayed drivers are", displayedDrivers);
  }, [originalDrivers]);

  const fetchAllDrivers = async () => {
    try {
      setLoading(true);

      if (!geotabApi) {
        console.error("Geotab API not available");
        toast.error("Geotab API not available");
        return;
      }

      geotabApi.call("Get", {
        typeName: "User",
        resultsLimit: 1000
      }, function (users) {
        console.log("All users:", users);

        const drivers = users.filter(user => user.isDriver === true);
        console.log("Filtered drivers:", drivers);

        const transformedDrivers = drivers.map(driver => ({
          id: driver.id,
          Email: driver.name || `${driver.firstName} ${driver.lastName}`,
          firstName: driver.firstName || "",
          lastName: driver.lastName || "",
          employeeNo: driver.employeeNo || "",
          phoneNumber: driver.phoneNumber || "",
          licenseNumber: driver.licenseNumber || "",
          licenseProvince: driver.licenseProvince || "",
          driverStatus: driver.isActive ? "Active" : "InActive",
          lcCheckInterval: driver.lcCheckInterval || 1 // Add lcCheckInterval to transformed drivers
        }));

        setOriginalDrivers(transformedDrivers);
        setDisplayedDrivers(transformedDrivers);
        setLoading(false);
      }, function (error) {
        console.error("Error fetching drivers from Geotab:", error);
        toast.error(`Error fetching drivers: ${error.message}`);
        setLoading(false);
      });

    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error(`Error fetching drivers: ${error.message}`);
      setLoading(false);
    }
  };

  // Add this function after fetchAllDrivers
  const syncDriversToMongo = async (drivers) => {
    if (!drivers || drivers.length === 0) return;
    // Map licenseNumber to licenseNo for backend compatibility
    const mappedDrivers = drivers.map(driver => ({
      ...driver,
      licenseNo: driver.licenseNumber,
    }));
    try {
      const res = await axios.post(`${BASE_URL}/api/driver/sync`, { drivers: mappedDrivers , userName});
      toast.success(res.data?.message || 'Drivers synced');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to sync drivers';
      toast.error(msg);
    }
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/api/driver/getAllDrivers`, {
        userName
      });
      setDrivers(res.data.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError(err.response?.data?.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  // Add this useEffect after the fetchAllDrivers useEffect
  useEffect(() => {
    if (originalDrivers.length > 0) {
      syncDriversToMongo(originalDrivers);
      fetchDrivers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalDrivers]);

  // Update sendConsentEmails to handle a single driver
  const sendConsentEmails = async (driver) => {
    const licenseNumber = driver.licenseNumber || driver.licenseNo;
    const email = driver.Email || driver.email;
    const firstName = driver.firstName;
    const lastName = driver.lastName;

    if (firstName && lastName && licenseNumber && email) {
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
        const msg = err.response?.data?.message || err.message || 'Failed to send consent email';
        toast.error(msg);
        return err.response?.data || { success: false };
      }
    }
    return { success: false };
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

  // const handleEdit = (driver) => {
  //   setEditingDriver(driver);
  //   setValue('firstName', driver.firstName);
  //   setValue('lastName', driver.lastName);
  //   setValue('employeeNo', driver.employeeNo);
  //   setValue('phoneNumber', driver.phoneNumber);
  //   setValue('licenseNumber', driver.licenseNumber);
  //   setValue('licenseProvince', driver.licenseProvince);
  //   setShowCreateForm(true);
  // };

  const handleEdit = (driver) => {
    window.location.href = `https://my.geotab.com/${database}/#users,sortMode:byName`
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
        data: { email: showDeleteConfirm.email }
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
      const eligibilityResponse = await axios.post(`${BASE_URL}/api/UserWallet/checksEligibility`, { userId: userName });
      if (eligibilityResponse.status === 200) {
        const { zeroCredit, planExpired } = eligibilityResponse.data;
        if (zeroCredit || planExpired) {
          toast.error("You don't have enough credits");
          setViewLoading(null);
          setShowSyncConfirm(null);
          return;
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
        userName
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
        <div className='main-con'>
          <div className="filter-container">
            <div className="filter-header">
              <h3 className="text-[28px] font font-light leading-[36px] not-italic tracking-[0] normal-case">Filter by Driver Status</h3>

              <select
                className="status-dropdown"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All Statuses">All Status</option>
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="filter-actions">
              <button
                className="action-btn filter-btn"
                onClick={applyFilter}
              >
                Filter
              </button>
              <button
                className="action-btn reset-btn"
                onClick={resetFilter}
              >
                Reset Filter
              </button>
              <button
                onClick={() => {
                  setEditingDriver(null);
                  reset();
                  setShowCreateForm(true);
                }}
                className="action-btn create-btn"
              >
                Create Form
              </button>
            </div>
          </div>

          {/* Create Form Popup */}
          {showCreateForm && (
            <div className="form-popup-overlay">
              <div className="form-popup-content">
                <h2 className='form-title'>{editingDriver ? "Edit Driver" : "Create New Driver"}</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </button>

                <form onSubmit={handleSubmit(onsubmit)}>
                  <div className="form-grid">
                    <div className="form-column">
                      <div className="form-group">
                        <label>First Name*</label>
                        <input
                          type="text"
                          {...register('firstName', { required: 'First name is required' })}
                          className={errors.firstName ? 'error' : ''}
                        />
                        {errors.firstName && <span className="error-message">{errors.firstName.message}</span>}
                      </div>

                      <div className="form-group">
                        <label>Last Name*</label>
                        <input
                          type="text"
                          {...register('lastName', { required: 'Last name is required' })}
                          className={errors.lastName ? 'error' : ''}
                        />
                        {errors.lastName && <span className="error-message">{errors.lastName.message}</span>}
                      </div>

                      <div className="form-group">
                        <label>Employee Number*</label>
                        <input
                          type="text"
                          {...register('employeeNo', { required: 'Employee number is required' })}
                          className={errors.employeeNo ? 'error' : ''}
                        />
                        {errors.employeeNo && <span className="error-message">{errors.employeeNo.message}</span>}
                      </div>
                    </div>

                    <div className="form-column">
                      <div className="form-group">
                        <label>License Number*</label>
                        <input
                          type="text"
                          {...register('licenseNumber', { required: 'License number is required' })}
                          className={errors.licenseNumber ? 'error' : ''}
                        />
                        {errors.licenseNumber && <span className="error-message">{errors.licenseNumber.message}</span>}
                      </div>

                      <div className="form-group">
                        <label>Phone Number*</label>
                        <input
                          type="tel"
                          {...register('phoneNumber', { required: 'Phone number is required' })}
                          className={errors.phoneNumber ? 'error' : ''}
                        />
                        {errors.phoneNumber && <span className="error-message">{errors.phoneNumber.message}</span>}
                      </div>

                      <div className="form-group">
                        <label>License Province*</label>
                        <input
                          type="text"
                          {...register('licenseProvince', { required: 'License province is required' })}
                          className={errors.licenseProvince ? 'error' : ''}
                        />
                        {errors.licenseProvince && <span className="error-message">{errors.licenseProvince.message}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      {editingDriver ? "Update" : "Create Driver"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="drivers-table-container">
          <table className="drivers-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Email</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>License Number</th>
                <th>Phone Number</th>
                <th>Interval (Daily)</th>
                <th>License Province</th>
                <th>Status</th>
                
              </tr>
            </thead>
            <tbody>
              {drivers.map(driver => (
                <tr key={driver.id}>
                  <td className="action-buttons">
                    <button
                      className="table-action-btn view"
                      onClick={() => handleSync(driver)}
                      disabled={viewLoading === driver.id}
                    >
                      {viewLoading === driver.id ? 'Loading...' : 'Sync'}
                    </button>
                    <button
                      className="table-action-btn view"
                      onClick={() => handleView(driver)}
                      disabled={viewLoading === driver.id}
                    >
                      {viewLoading === driver.id ? 'Loading...' : 'View'}
                    </button>
                    <button
                      className="table-action-btn view"
                      onClick={() => handleHistory(driver)}
                      disabled={viewLoading === driver.id}
                    >
                      {viewLoading === driver.id ? 'Loading...' : 'History'}
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
                    {/* <button
                      className="table-action-btn danger"
                      onClick={() => handleDelete(driver)}
                    >
                      Delete
                    </button> */}
                  </td>
                  <td>{driver.email}</td>
                  <td>{driver.firstName}</td>
                  <td>{driver.lastName}</td>
                  <td>{driver.licenseNo}</td>
                  <td>{driver.phoneNumber}</td>
                  <td>{driver.lcCheckInterval || 1}</td>
                  <td>{driver.licenseProvince}</td>
                  <td>{driver.driverStatus}</td>
                 
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Interval Popup */}
      {intervalPopup.open && (
        <div className="form-popup-overlay">
          <div className="form-popup-content">
            <h3>Set Interval for {intervalPopup.driver.Email}</h3>
            <label>
              Interval (minutes):
              <select
                value={intervalValue}
                onChange={e => setIntervalValue(Number(e.target.value))}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </label>
            <div className="form-actions">
              <button onClick={() => setIntervalPopup({ open: false, driver: null })} className="cancel-btn">Cancel</button>
              <button onClick={handleIntervalSubmit} className="submit-btn">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicePage;