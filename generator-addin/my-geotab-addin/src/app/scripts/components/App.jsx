import React, { useState } from 'react';
import DevicePage from './DevicePage.jsx';
import DriverDetail from './DriverDetail.jsx'
import GeotabContext from '../contexts/Geotab';
import Logger from '../utils/logger';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import LCCheckPlans from './LCCheckPlans.jsx';
import LCCheckUsage from './LCCheckUsage.jsx';
import Wallet from './wallet.jsx';

const App = ({ geotabApi, geotabState, appName }) => {
  const logger = Logger(appName);
  const [context, setContext] = useState({ geotabApi, geotabState, logger });



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

            <Route path="/wallet" element={<Wallet />} />

          </Routes>
        </Router>
      </GeotabContext.Provider>
    </>
  );
};
export default App;