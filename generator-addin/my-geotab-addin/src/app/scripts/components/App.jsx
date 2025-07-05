import React, { useState, useEffect } from 'react';
import DevicePage from './DevicePage.jsx';
import DriverDetail from './DriverDetail.jsx'
import GeotabContext from '../contexts/Geotab';
import Logger from '../utils/logger';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import LCCheckPlans from './LCCheckPlans.jsx';
import LCCheckUsage from './LCCheckUsage.jsx';
import Wallet from './wallet.jsx';
import ViewDriverLicenceSummary from './viewDriverDetailData.jsx';
import GetHistoryOfDriverDetail from './GetHistoryOfDriverDetail.jsx';
import { ToastContainer, toast } from 'react-toastify';
import './componentStyles/toast.css';

const App = ({ geotabApi, geotabState, appName }) => {
  const logger = Logger(appName);
  const [context, setContext] = useState({ geotabApi, geotabState, logger });

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        console.log("Session Info:", geotabState.currentSession);

        // Get the user info
        geotabApi.call("Get", {
          typeName: "User",
          search: { id: geotabState.userId }
        }, (user) => {
          if (user && user.length > 0) {
            console.log("Logged-in User Info:", user[0]);

            // Optionally store it in context
            setContext(prev => ({
              ...prev,
              loggedInUser: user[0]
            }));
          } else {
            console.warn("User not found");
          }
        }, (error) => {
          console.error("Error fetching user:", error);
        });

      } catch (err) {
        console.error("Unexpected error getting user data:", err);
      }
    };

    if (geotabApi && geotabState?.userId) {
      fetchLoggedInUser();
    }
  }, [geotabApi, geotabState]);


  console.log("App loaded");

  return (
    <>

      <GeotabContext.Provider value={[context, setContext]}>
        <Router>

          <Routes>

            <Route path="/" element={<Dashboard />} />

            <Route path="/addin-prayosha-prayoshaAddIn" element={<DevicePage />} />

            <Route path="/lc-check" element={<DevicePage />} />

            <Route path="/lc-check-api-plans" element={<LCCheckPlans />} />

            <Route path="/lc-check-usage" element={<LCCheckUsage />} />

            <Route path="/driverDetail" element={<DriverDetail />} />

            <Route path="/viewDriverDetailData" element={<ViewDriverLicenceSummary />} />

            <Route path="/GetHistoryOfDriverDetail" element={<GetHistoryOfDriverDetail />} />


            <Route path="/wallet" element={<Wallet />} />

           


          </Routes>

           <ToastContainer
              toastClassName="toast"
              bodyClassName=""
              position="top-right"
              autoClose={3000}
              closeButton={false}
              className="toast-container"
            />
        </Router>
      </GeotabContext.Provider>
    </>
  );
};
export default App;