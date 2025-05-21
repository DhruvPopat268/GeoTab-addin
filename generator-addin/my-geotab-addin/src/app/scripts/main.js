/* eslint-disable */
import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';

/**
 * @returns {{initialize: Function, focus: Function, blur: Function, startup: Function, shutdown: Function}}
 */
geotab.addin.prayoshaAddIn = function (api, state, meta) {
  'use strict';
  const appName = 'prayoshaAddIn';
  const addinId = 'aWE5ZmY0YmQtNTBiZC1iMzh';

  let elAddin = null;
  let reactRoot = null;

  return {
    initialize: function (freshApi, freshState, initializeCallback) {
      // Get the root container dynamically
      elAddin = document.getElementById(appName);

      if (!elAddin) {
        console.error(`❌ Could not find div with id "${appName}"`);
        return;
      }

      // Apply translation if available
      if (freshState.translate) {
        freshState.translate(elAddin);
      }

      // Remove "hidden" class if present
      elAddin.className = elAddin.className.replace('hidden', '').trim();

      // Create React root
      reactRoot = createRoot(elAddin);

      // MUST call when setup is done
      initializeCallback();
    },

    focus: function (freshApi, freshState) {
      if (!elAddin || !reactRoot) {
        console.error("❌ Add-In not initialized properly.");
        return;
      }

      elAddin.className = elAddin.className.replace('hidden', '').trim();

      freshApi.getSession(session => {
        freshState.currentSession = session;

        // Render your App or placeholder
        // reactRoot.render(<App geotabApi={freshApi} geotabState={freshState} appName={appName} addinId={addinId} />);
        reactRoot.render(<div style={{ color: 'black' }}>Hello World!</div>);

        console.log("✅ Focus called");
      });
    },

    blur: function () {
      // You can add cleanup code here if needed
    }
  };
};
