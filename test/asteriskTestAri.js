
import AriClient from 'ari-client';

// Test ARI connection
async function testAriConnection() {
    try {
        console.log('Attempting to connect to ARI...');
        
        const client = await AriClient.connect(
            'http://localhost:8088',
            'user',
            'your_secret_password'
        );

        console.log('Successfully connected to ARI!');
        
        // List all active channels
        const channels = await client.channels.list();
        console.log('Active channels:', channels.length);
        
        // List all applications
        const apps = await client.applications.list();
        console.log('Available applications:', apps.map(app => app.name));
        
        // Test websocket events
        console.log('Setting up WebSocket connection...');
        client.on('StasisStart', (event, channel) => {
            console.log('Received StasisStart event!');
        });
        
        // Keep connection alive for testing
        console.log('Listening for events (press Ctrl+C to exit)...');
        
    } catch (error) {
        console.error('Connection failed:', error.message);
        
        // Provide helpful troubleshooting info
        if (error.code === 'ECONNREFUSED') {
            console.log('\nTroubleshooting steps:');
            console.log('1. Check if Asterisk is running:');
            console.log('   sudo systemctl status asterisk');
            console.log('2. Verify HTTP server is enabled:');
            console.log('   asterisk -rx "http show status"');
            console.log('3. Check configuration files:');
            console.log('   asterisk -rx "core show settings"');
        }
    }
}

testAriConnection();
