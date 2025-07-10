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
  const [loading, setLoading] = useState(false);

  // Fetch all drivers on component mount
  useEffect(() => {
    fetchAllDrivers();
  }, []);

  useEffect(() => {
    console.log("original drivers are", originalDrivers);
    console.log("displayed drivers are", displayedDrivers);
  }, [originalDrivers]);

 const fetchAllDrivers = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${BASE_URL}/api/driver/getAllDrivers`);

      if (response.status === 200 && response.data.data) {
        setOriginalDrivers(response.data.data);
        setDisplayedDrivers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error(`Error fetching drivers: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onsubmit = async (data) => {
    const isEditing = Boolean(editingDriver);

    try {
      let res;

      if (isEditing) {
        res = await axios.patch(`${BASE_URL}/api/driver/update`, {
          email: editingDriver.email,
          updatedData: data
        });

        if (res.status !== 200) {
          throw new Error("Update failed");
        }
      } else {
        res = await axios.post(`${BASE_URL}/api/driver/create`, data);

        if (res.status === 409) {
          toast.error("User already exists");
          return;
        }
      }

      // Refresh the data from server instead of manually updating state
      await fetchAllDrivers();

      // Reset form
      reset();
      setEditingDriver(null);
      setShowCreateForm(false);

      // Confirm visually
      toast.success(isEditing ? "Driver updated successfully" : "Driver created successfully");

    } catch (error) {
      console.error("Error submitting driver:", error);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    Object.entries(driver).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'fullName') {
        setValue(key, value);
      }
    });
    setShowCreateForm(true);
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
  const handleSync = (driver) => {
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

        // Check if either creditStatus or planExpired is false
        if (zeroCredit || planExpired) {
          toast.error("You don't have enough credits");
          setViewLoading(null);
          setShowSyncConfirm(null);
          return;
        }

        // If both are true, navigate to driver detail page
        navigate(`/driverDetail/?${showSyncConfirm.licenseNo}`);
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
    navigate(`/viewDriverDetailData/?${driver.licenseNo}`)
  };

    const handleHistory = async (driver) => {
    navigate(`/GetHistoryOfDriverDetail/?${driver.licenseNo}`)
  };

    if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
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
              <h2>Filter by Driver Status</h2>
              <select
                className="status-dropdown"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All Statuses">All Statuses</option>
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
                <h2>{editingDriver ? "Edit Driver" : "Create New Driver"}</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </button>

                <form onSubmit={handleSubmit(onsubmit)}>
                  <div className="form-grid">
                    {/* Left Column */}
                    <div className="form-column">
                      <div className="form-group">
                        <label>Company Name*</label>
                        <select
                          {...register('companyName', { required: 'Company is required' })}
                          className={errors.companyName ? 'error' : ''}
                        >
                          <option value="">Select a company</option>
                          {companyOptions.map(company => (
                            <option key={company} value={company}>{company}</option>
                          ))}
                        </select>
                        {errors.companyName && <span className="error-message">{errors.companyName.message}</span>}
                      </div>

                      <div className="form-group">
                        <label>Automated Licence Check</label>
                        <select {...register('automatedLicenseCheck')}>
                          <option value="">Please select</option>
                          {yesNoOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Driver Number</label>
                        <input type="text" {...register('driverNumber')} />
                      </div>

                      <div className="form-group">
                        <label>Surname*</label>
                        <input
                          type="text"
                          {...register('surname', { required: 'Surname is required' })}
                          className={errors.surname ? 'error' : ''}
                        />
                        {errors.surname && <span className="error-message">{errors.surname.message}</span>}
                      </div>

                      <div className="form-group">
                        <label>Contact Number*</label>
                        <input
                          type="tel"
                          {...register('contactNumber', { required: 'Contact number is required' })}
                          className={errors.contactNumber ? 'error' : ''}
                        />
                        {errors.contactNumber && <span className="error-message">{errors.contactNumber.message}</span>}
                      </div>

                      <div className="form-group">
                        <label>Driver Groups*</label>
                        <select
                          {...register('driverGroups', { required: selectedCompany ? 'Driver group is required' : false })}
                          className={errors.driverGroups ? 'error' : ''}
                          disabled={!selectedCompany}
                        >
                          <option value="">{selectedCompany ? 'Select group' : 'Select company first'}</option>
                          {selectedCompany && driverGroupsOptions.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </select>
                        {errors.driverGroups && <span className="error-message">{errors.driverGroups.message}</span>}
                      </div>

                      <div className="form-group">
                        <label>Depot Change Allowed</label>
                        <select {...register('depotChangeAllowed')}>
                          <option value="">Please select</option>
                          {yesNoOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="form-column">
                      <div className="form-group">
                        <label>Driver Status*</label>
                        <select
                          {...register('driverStatus', { required: 'Status is required' })}
                          className={errors.driverStatus ? 'error' : ''}
                          defaultValue="Active"
                        >
                          {statusOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        {errors.driverStatus && <span className="error-message">{errors.driverStatus.message}</span>}
                      </div>

                      <div className="form-group">
                        <label>Driver Licence No*</label>
                        <input
                          type="text"
                          {...register('licenseNo', { required: 'License number is required' })}
                          className={errors.licenseNo ? 'error' : ''}
                        />
                        {errors.licenseNo && <span className="error-message">{errors.licenseNo.message}</span>}
                      </div>

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
                        <label>Driver DOB*</label>
                        <input
                          type="date"
                          {...register('dob', { required: 'Date of birth is required' })}
                          className={errors.dob ? 'error' : ''}
                          placeholder="dd-mm-yyyy"
                        />
                        {errors.dob && <span className="error-message">{errors.dob.message}</span>}
                      </div>

                      <div className="form-group">
                        <label>Contact Email*</label>
                        <input
                          type="email"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-message">{errors.email.message}</span>}
                      </div>

                      <div className="form-group">
                        <label>Depot Name*</label>
                        <select
                          {...register('depotName', { required: selectedCompany ? 'Depot name is required' : false })}
                          className={errors.depotName ? 'error' : ''}
                          disabled={!selectedCompany}
                        >
                          <option value="">{selectedCompany ? 'Select depot' : 'Select company first'}</option>
                          {selectedCompany && depotOptions.map(depot => (
                            <option key={depot} value={depot}>{depot}</option>
                          ))}
                        </select>
                        {errors.depotName && <span className="error-message">{errors.depotName.message}</span>}
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
                <th>ACTION</th>
                <th>DRIVER NUMBER</th>
                <th>DRIVER NAME</th>
                <th>COMPANY</th>
                <th>DRIVER STATUS</th>
                <th>LICENCE NO</th>
                <th>CONTACT NUMBER</th>
                <th>EMAIL</th>
                <th>DEPOT</th>
                {/* <th>DOB</th> */}
              </tr>
            </thead>
            <tbody>
              {displayedDrivers.map(driver => (
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
                      {viewLoading === driver.id ? 'Loading...' : 'view'}
                    </button>
                      <button
                      className="table-action-btn view"
                      onClick={() => handleHistory(driver)}
                      disabled={viewLoading === driver.id}
                    >
                      {viewLoading === driver.id ? 'Loading...' : 'history'}
                    </button>
                    <button
                      className="table-action-btn"
                      onClick={() => handleEdit(driver)}
                    >
                      Edit
                    </button>
                    <button
                      className="table-action-btn danger"
                      onClick={() => handleDelete(driver)}
                    >
                      Delete
                    </button>
                  </td>
                  <td>{driver.driverNumber}</td>
                  <td>{driver.fullName}</td>
                  <td>{driver.companyName}</td>
                  <td>{driver.driverStatus}</td>
                  <td>{driver.licenseNo}</td>
                  <td>{driver.contactNumber}</td>
                  <td>{driver.email}</td>
                  <td>{driver.depotName}</td>
                  {/* <td>{driver.dob}</td> */}
                </tr>
              ))}
              {displayedDrivers.length === 0 && (
                <tr>
                  <td colSpan="10" className="no-drivers">
                    {originalDrivers.length === 0
                      ? 'No drivers added yet'
                      : 'No drivers match the filter criteria'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Confirmation Modal */}
      {showSyncConfirm && (
        <div className="form-popup-overlay">
          <div className="confirm-popup-content">
            <h3>Confirm Sync</h3>
            <p>This action is chargeable. Do you want to proceed with syncing driver {showSyncConfirm.fullName}?</p>
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
            <h2>Driver Details - {driverDetails.driver.fullName}</h2>
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
                  <div><strong>Name:</strong> {driverDetails.driver.fullName}</div>
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
            <p>Are you sure you want to delete driver {showDeleteConfirm.fullName}?</p>
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
    </div>
  );
};

export default DevicePage;