import React, { useState } from 'react';

import DevicePage from './DevicePage.jsx';
import DriverDetail from './DriverDetail.jsx'


import GeotabContext from '../contexts/Geotab';
import Logger from '../utils/logger';
import APITable from './APITable.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const App = ({ geotabApi, geotabState, appName }) => {
  const logger = Logger(appName);
  const [context, setContext] = useState({ geotabApi, geotabState, logger });

  return (
    <>

      <GeotabContext.Provider value={[context, setContext]}>

        {/* <DriverDetail /> */}
        <Router>
          <Routes>
            <Route path="/" element={<DevicePage />} />
            <Route path="/page-two" element={<DriverDetail />} />
          </Routes>
        </Router>
        {/* <APITable/> */}

      </GeotabContext.Provider>
    </>
  );
};

export default App;