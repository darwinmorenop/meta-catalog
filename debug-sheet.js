const XLSX = require('xlsx');
const https = require('https');

const url = 'https://docs.google.com/spreadsheets/d/14j3x4aCuZ0VW2qPEY8z_0kWIVwwVY-KC/export?format=csv';

function getWithRedirects(url, callback) {
    https.get(url, (resp) => {
        if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
            console.log('Redirecting to:', resp.headers.location);
            getWithRedirects(resp.headers.location, callback);
            return;
        }

        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            callback(null, data);
        });

    }).on("error", (err) => {
        callback(err, null);
    });
}

getWithRedirects(url, (err, data) => {
    if (err) {
        console.error('Error fetching CSV:', err);
        return;
    }

    console.log('CSV Data received. Length:', data.length);
    console.log('First 200 chars:', data.substring(0, 200));

    const workbook = XLSX.read(data, { type: 'string' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Default parsing
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    console.log('Parsed Object [0]:', JSON.stringify(jsonData[0], null, 2));

    // Check types
    if (jsonData[0]) {
        console.log('Type of ID:', typeof jsonData[0].id);
        console.log('Type of price:', typeof jsonData[0].price);
        console.log('Raw value of ID:', jsonData[0].id);
    }
});
