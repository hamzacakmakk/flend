const app = require('./src/app');

const server = app.listen(5005, async () => {
    try {
        const response = await fetch('http://localhost:5005/api/integrations', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                marketplace_name: 'Trendyol',
                api_key: '111:222',
                api_secret: '333'
            })
        });
        const d = await response.text();
        console.log('STATUS:', response.status);
        console.log('RESPONSE:', d);
    } catch(err) {
        console.error('ERROR:', err);
    } finally {
        server.close();
        process.exit();
    }
});
