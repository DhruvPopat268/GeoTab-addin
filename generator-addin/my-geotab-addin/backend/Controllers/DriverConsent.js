const DriverConsent = require('../models/DriverConsent')

module.exports.createDriverConsent = async (req, res, next) => {
    try {
        const { driverName, licenseNo, country, timestamp } = req.body;

        const newConsent = new DriverConsent({
            driverName,
            licenseNo,
            country,
            timestamp: timestamp ? new Date(timestamp) : new Date()
        });

        await newConsent.save();
        res.status(200).json({ success: true, message: 'Driver consent stored successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save data', error: error.message });
    }
}