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
import LCCheckView from './LCCheckView.jsx';
import MyGeoTabWalletGuide from './userManual.jsx';
import { ToastContainer, toast } from 'react-toastify';
import './componentStyles/toast.css';


const App = ({ geotabApi, geotabState, appName }) => {
  const logger = Logger(appName);
  const [context, setContext] = useState({ geotabApi, geotabState, logger });



  return (
    <>

      <GeotabContext.Provider value={[context, setContext]}>
        <Router>

          <Routes>

            <Route path="/" element={<Dashboard />} />

            <Route path="/" element={<Dashboard />} />

            <Route path="/addin-ptccheck-prayoshaAddIn" element={<Dashboard />} />

            <Route path="/lc-check" element={<DevicePage />} />

            <Route path="/lc-check-api-plans" element={<LCCheckPlans />} />

            <Route path="/lc-check-usage" element={<LCCheckUsage />} />

            <Route path="/driverDetail" element={<DriverDetail />} />

            <Route path="/viewDriverDetailData" element={<ViewDriverLicenceSummary />} />

            <Route path="/GetHistoryOfDriverDetail" element={<GetHistoryOfDriverDetail />} />

            <Route path="/LCCheckView" element={<LCCheckView />} />

            <Route path="/wallet" element={<Wallet />} />

            <Route path="/user-manual" element={<MyGeoTabWalletGuide />} />

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