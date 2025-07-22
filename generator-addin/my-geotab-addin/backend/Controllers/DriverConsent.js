const DriverConsent = require('../models/DriverConsent')

module.exports.createDriverConsent = async (req, res, next) => {
    try {
        const { firstName, lastName, consentGiven } = req.body;
    
        if (!firstName || !lastName) {
          return res.status(400).json({ success: false, message: 'First and last name are required.' });
        }
    
        const newConsent = new DriverConsent({
          firstName,
          lastName,
          consentGiven: consentGiven || false
        });
    
        const saved = await newConsent.save();
        res.status(201).json({ success: true, data: saved });
    
      } catch (err) {
        console.error('Error saving driver consent:', err);
        res.status(500).json({ success: false, message: 'Server error' });
      }
}