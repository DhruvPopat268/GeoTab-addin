import React, { useState, useContext, useEffect } from 'react';
import Geotab from '../contexts/Geotab';
import { useForm } from 'react-hook-form';
import './DevicePage.css';
import axios from 'axios'




const DevicePage = ({ }) => {
  const [context, setContext] = useContext(Geotab); // Access both context object and setter
  const { geotabApi, geotabState, logger } = context;
  const [showCreateForm, setShowCreateForm] = useState(false);
  // const { logger } = context;

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

  // Watch company selection for dependent fields
  const selectedCompany = watch('companyName');

  useEffect(() => {
    console.log("original drivers are", originalDrivers)
    console.log("displayed drivers are", displayedDrivers)

  }, [originalDrivers]);

  const onsubmit = async (data) => {
    const isEditing = Boolean(editingDriver);

    try {
      let res;

      if (isEditing) {
        res = await axios.patch(`http://localhost:5000/driver/update`, {
          email: editingDriver.email,
          updatedData: data
        });

        if (res.status !== 200) {
          throw new Error("Update failed");
        }
      } else {
        res = await axios.post(`http://localhost:5000/driver/create`, data);

        if (res.status === 409) {
          alert("User already exists");
          return;
        }
      }

      // Update UI
      const updatedDrivers = isEditing
        ? originalDrivers.map(driver =>
          driver.id === editingDriver.id
            ? {
              ...data,
              id: editingDriver.id,
              fullName: `${data.firstName} ${data.surname}`,
              dob: new Date(data.dob).toLocaleDateString('en-GB')
            }
            : driver
        )
        : [
          ...originalDrivers,
          {
            id: Date.now(),
            ...data,
            fullName: `${data.firstName} ${data.surname}`,
            dob: new Date(data.dob).toLocaleDateString('en-GB')
          }
        ];

      setOriginalDrivers(updatedDrivers);
      setDisplayedDrivers(updatedDrivers);

      // Make sure these are AFTER async operations
      reset();
      setEditingDriver(null);
      setShowCreateForm(false);

      // reset(); // keep this first
      // setEditingDriver(null);

      // Add this temporary debug line:
      // setTimeout(() => {
      //   setShowCreateForm(false);

      // }, 1000);

      // Confirm visually
      alert(isEditing ? "Driver updated successfully" : "Driver created successfully");

    } catch (error) {
      console.error("Error submitting driver:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
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
    setShowDeleteConfirm(null); // This closes the confirmation modal
  };

  const confirmDelete = async () => {
    try {
      if (!showDeleteConfirm) return;

      // Call backend API to delete by email
      const res = await axios.delete("http://localhost:5000/driver/delete", {
        data: { email: showDeleteConfirm.email }
      });

      if (res.status !== 200) {
        throw new Error(res.data.message || "Delete failed");
      }

      // Update UI state
      const updatedDrivers = originalDrivers.filter(
        d => d.email !== showDeleteConfirm.email
      );
      setOriginalDrivers(updatedDrivers);
      setDisplayedDrivers(updatedDrivers);

      // Close modal and show success
      setShowDeleteConfirm(null);
      alert("Driver deleted successfully");

    } catch (error) {
      console.error("Delete error:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
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

  const handleView = (driver) => {
    console.log("geotabApi in handleView:", geotabApi); // Check if addin exists here
    if (geotabApi && geotabApi.addin) {
      geotabApi.addin.navigateTo({
        page: 'driverDetail',
        options: {
          driverData: driver,
        },
      });
    } else {
      console.error("Geotab Add-in context is not available.");
      alert("Could not navigate to driver details.");
    }
  };

  return (
    <div className="root">
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
              <h2>Create New Driver</h2>
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
              <th>DOB</th>
            </tr>
          </thead>
          <tbody>
            {displayedDrivers.map(driver => (
              <tr key={driver.id}>
                <td className="action-buttons">
                  <button
                    className="table-action-btn view"
                    onClick={() => handleView(driver)} // Add your view handler
                  >
                    View
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
                <td>{driver.dob}</td>
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