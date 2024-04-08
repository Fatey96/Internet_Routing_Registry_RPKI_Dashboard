const express = require('express');
const RPKIData = require('../models/RPKIData');
const router = express.Router();

// Route to handle GET requests to fetch RPKI data
router.get('/rpki', async (req, res) => {
    try {
        const { ASN, prefix, state } = req.query;

        // Build the query object based on provided filters
        let queryObject = {};
        if (ASN) queryObject.ASN = Number(ASN);
        if (prefix) queryObject.prefix = prefix;
        if (state) queryObject.state = state;

        const rpkiData = await RPKIData.find(queryObject);
        console.log(`Fetched RPKI data with filters - ASN: ${ASN}, Prefix: ${prefix}, State: ${state}`);
        res.json(rpkiData);
    } catch (error) {
        console.error('Error fetching RPKI data:', error.message);
        console.error(error.stack);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;