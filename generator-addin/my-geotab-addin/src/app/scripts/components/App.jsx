import React, { useState } from 'react';
import DevicePage from './DevicePage.jsx';
import DriverDetail from './DriverDetail.jsx'
import GeotabContext from '../contexts/Geotab';
import Logger from '../utils/logger';
import APITable from './APITable.jsx';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

const App = ({ geotabApi, geotabState, appName }) => {
  const logger = Logger(appName);
  const [context, setContext] = useState({ geotabApi, geotabState, logger });
  
  console.log("App loaded");
  
  return (
    <>
      <GeotabContext.Provider value={[context, setContext]}>
        <Router>
          <Routes>

            <Route path="/" element={<DevicePage />} />
            <Route path="/addin-addin-prayoshaAddIn" element={<DevicePage />} />

            <Route path="/driverDetail" element={<DriverDetail />} />
            <Route path="/page-two" element={<DriverDetail />} />
          </Routes>
        </Router>
      </GeotabContext.Provider>
    </>
  );
};
export default App;