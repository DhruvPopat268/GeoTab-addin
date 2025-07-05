/* global mygeotab */

(function() {
  'use strict';

  mygeotab.addin = {
    addinId: 'com.pratosh.prayoshaaddin', // Replace with your unique addinId
    initialize: function(api, appInfo) {
      console.log('Add-in initialized!', appInfo);

      api.getSession(function(session, error) {
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        console.log('Current session:', session);
      });

      // Your Add-in initialization logic here
    },
    focus: function() {
      console.log('Add-in focused.');
      // Logic to run when the Add-in becomes visible
    },
    blur: function() {
      console.log('Add-in blurred.');
      // Logic to run when the Add-in is hidden
    }
  };
})();