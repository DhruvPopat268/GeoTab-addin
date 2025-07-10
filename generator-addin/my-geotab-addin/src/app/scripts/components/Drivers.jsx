import React, { useEffect, useState } from 'react';

// Geotab add-in registration (MUST be globally available)
if (typeof geotab !== 'undefined' && geotab.addin) {
    geotab.addin.prayoshaAddIn = (api, state) => {
        return {
            initialize: (api, state, callback) => {
                window._geotabApi = api;
                window._geotabState = state;
                console.log("Prayosha Add-In initialized");
                callback();
            },
            focus: (api, state) => {
                window._geotabApi = api;
                window._geotabState = state;
                console.log("Prayosha Add-In focused");
            },
            blur: () => {
                console.log("Prayosha Add-In blurred");
            }
        };
    };
}

const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto'
    },
    title: {
        color: '#333',
        marginBottom: '20px'
    },
    button: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        margin: '10px 0'
    },
    list: {
        listStyleType: 'none',
        padding: 0,
        margin: 0
    },
    loading: {
        color: '#666',
        fontStyle: 'italic'
    },
    error: {
        color: '#dc3545',
        backgroundColor: '#f8d7da',
        borderColor: '#f5c6cb',
        padding: '10px',
        borderRadius: '4px'
    },
    driverItem: {
        padding: '10px',
        margin: '5px 0',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        borderLeft: '4px solid #007bff'
    }
};

const Drivers = () => {
    const [driverList, setDriverList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDrivers = () => {
        setLoading(true);
        setError('');
        setDriverList([]);

        const api = window._geotabApi;
        if (!api) {
            setError("API not available");
            setLoading(false);
            return;
        }

        api.call(
            "Get",
            { typeName: "User", resultsLimit: -1 },
            (users) => {
                const filteredDrivers = users.filter(user => user.userType === "Driver");
                console.log("Filtered drivers:", filteredDrivers);
                setDriverList(filteredDrivers);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching drivers:", err);
                setError(`Failed to fetch drivers: ${err.message}`);
                setLoading(false);
            }
        );
    };

    useEffect(() => {
        if (window._geotabApi) {
            loadDrivers();
        }
    }, []);

    return (
        <div id="prayoshaAddIn" style={styles.container}>
            <h1 style={styles.title}>Welcome to the Prayosha Add-In</h1>
            <button onClick={loadDrivers} style={styles.button}>Refresh Drivers</button>

            <ul style={styles.list}>
                {loading && <li style={styles.loading}>Loading drivers...</li>}
                {error && <li style={styles.error}>{error}</li>}
                {!loading && !error && driverList.length === 0 && (
                    <li style={styles.error}>No drivers found</li>
                )}
                {!loading && !error &&
                    driverList.map(driver => {
                        let info = driver.name || "Unnamed driver";
                        if (driver.licenseNumber) info += ` (License: ${driver.licenseNumber})`;
                        if (driver.employeeNo) info += ` - Employee #${driver.employeeNo}`;
                        return (
                            <li key={driver.id} title={`Driver ID: ${driver.id}`} style={styles.driverItem}>
                                {info}
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
};

export default Drivers;
