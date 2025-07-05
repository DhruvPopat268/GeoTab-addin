/**
 * This is the entry point for your app
 * Include any assets to be bundled in here
 * (css/images/js/etc)
 */

// Allowing babel to work with older versions of IE
const regeneratorRuntime = require('regenerator-runtime');

if(!geotab.addin.prayoshaAddIn){

    require('./scripts/main');

}

require('./styles/main.css');

// // Import your DevicePage and DriverDetail components
// import DevicePage from './scripts/components/DevicePage.jsx';
// import DriverDetail from './scripts/components/DriverDetail.jsx';
// import GeotabContext from './scripts/contexts/Geotab.js';
// import { createRoot } from 'react-dom/client';
// import App from './scripts/components/App.jsx';

// // Function to render a component within the GeotabApiProvider
// const renderWithContext = (Component, api, state, appName, addinId, el) => {
//     const root = createRoot(el);
//     root.render(
//         <GeotabContext api={api} state={state}>
//             <Component geotabApi={api} geotabState={state} appName={appName} addinId={addinId} />
//         </GeotabContext>
//     );
// };

// window.geotabModules = {
//     initialize: function (api, state, initializeCallback) {
//         const appName = 'prayoshaAddIn';
//         const elAddin = document.getElementById(appName);

//         if (state.translate) {
//             state.translate(elAddin || '');
//         }

//         // You might want to render your initial page here, if App.jsx doesn't handle it
//         renderWithContext(App, api, state, appName, 'aWE5ZmY0YmQtNTBiZC1iMzh', elAddin);
//         initializeCallback();
//     },
//     device: function (api, state) { // Example: if your main page is associated with 'device'
//         const appName = 'prayoshaAddIn';
//         const elAddin = document.getElementById(appName);
//         renderWithContext(DevicePage, api, state, appName, 'aWE5ZmY0YmQtNTBiZC1iMzh', elAddin);
//     },
//     driverList: function (api, state) { // If you want a separate entry point for the list
//         const appName = 'prayoshaAddIn';
//         const elAddin = document.getElementById(appName);
//         renderWithContext(DevicePage, api, state, appName, 'aWE5ZmY0YmQtNTBiZC1iMzh', elAddin);
//     },
//     driverDetail: function (api, state) {
//         const appName = 'prayoshaAddIn';
//         const elAddin = document.getElementById(appName);
//         renderWithContext(DriverDetail, api, state, appName, 'aWE5ZmY0YmQtNTBiZC1iMzh', elAddin);
//     }
// };