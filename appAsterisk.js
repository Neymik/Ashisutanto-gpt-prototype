import AriClient from 'ari-client';
import fs from 'fs';

async function connectToAsterisk() {
    try {
        // Ensure Asterisk is configured to allow this connection
        const client = await AriClient.connect(
            'http://localhost:8088', 
            'asterisk_api', 
            'your_secret_password'
        );


        console.log('Connected to ARI successfully');

        // Handle incoming calls
        client.on('StasisStart', async (event, channel) => {
            console.log('Call received:', channel.id);

            try {
                // Answer the call
                await channel.answer();

                // Record the call
                const recordingName = `recording_${Date.now()}.wav`;
                const recording = await client.recordings.record({
                    name: recordingName,
                    format: 'wav',
                    maxDurationSeconds: 60,
                    channelId: channel.id
                });

                // Handle recording completion
                recording.on('RecordingFinished', (event, recordedFile) => {
                    console.log('Recording saved:', recordedFile.name);
                    
                    // Optional: Move or process the recording
                    fs.copyFile(
                        `/var/spool/asterisk/recordings/${recordedFile.name}`, 
                        `./recordings/${recordedFile.name}`, 
                        (err) => {
                            if (err) console.error('Failed to copy recording:', err);
                        }
                    );
                });

                // Play a welcome message
                await channel.play({
                    media: 'sound:welcome'
                });

            } catch (err) {
                console.error('Call handling error:', err);
            }
        });

        // Create WebSocket connection for the application
        client.start('webrtc-app');

        console.log('Listening for calls...');

    } catch (err) {
        console.error('ARI Connection Error:', err);
        
        // Detailed error handling
        if (err.code === 'ECONNREFUSED') {
            console.log('Connection refused. Check:');
            console.log('1. Asterisk is running');
            console.log('2. ARI is enabled in http.conf and ari.conf');
            console.log('3. Correct username/password');
        }
    }
}

// Run the connection
connectToAsterisk();