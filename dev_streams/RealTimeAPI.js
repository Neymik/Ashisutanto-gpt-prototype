
import WebSocket from 'ws';
import fs from 'fs';
import dotenv from 'dotenv';

const SYSTEM_MESSAGE = 'You are a helpful and bubbly AI assistant who loves to chat about anything the user is interested about and is prepared to offer them facts. You have a penchant for dad jokes, owl jokes, and rickrolling – subtly. Always stay positive, but work in a joke when appropriate.';
const VOICE = 'alloy';
const PORT = process.env.PORT || 5050; // Allow dynamic port assignment
// List of Event Types to log to the console. See OpenAI Realtime API Documentation. (session.updated is handled separately.)
const LOG_EVENT_TYPES = [
    'response.content.done',
    'rate_limits.updated',
    'response.done',
    'input_audio_buffer.committed',
    'input_audio_buffer.speech_stopped',
    'input_audio_buffer.speech_started',
    'session.created'
];

console.log("Client connected");
const openAiWs = new WebSocket(
  "wss://api.openai.com/v1/realtime?model=model=gpt-4o-realtime-preview-2024-10-01",
  {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Beta": "realtime=v1",
    },
  }
);
let streamSid = null;
const sendSessionUpdate = () => {
  const sessionUpdate = {
    type: "session.update",
    session: {
      turn_detection: { type: "server_vad" },
      input_audio_format: "g711_ulaw",
      output_audio_format: "g711_ulaw",
      voice: VOICE,
      instructions: SYSTEM_MESSAGE,
      modalities: ["text", "audio"],
      temperature: 0.8,
    },
  };
  console.log("Sending session update:", JSON.stringify(sessionUpdate));
  openAiWs.send(JSON.stringify(sessionUpdate));
};
// Open event for OpenAI WebSocket
openAiWs.on("open", () => {
  console.log("Connected to the OpenAI Realtime API");
  setTimeout(sendSessionUpdate, 250); // Ensure connection stability, send after .25 seconds
});
// Listen for messages from the OpenAI WebSocket (and send to Twilio if necessary)
openAiWs.on("message", (data) => {
  try {
    const response = JSON.parse(data);
    if (LOG_EVENT_TYPES.includes(response.type)) {
      console.log(`Received event: ${response.type}`, response);
    }
    if (response.type === "session.updated") {
      console.log("Session updated successfully:", response);
    }
    if (response.type === "response.audio.delta" && response.delta) {
      const audioDelta = {
        event: "media",
        streamSid: streamSid,
        media: {
          payload: Buffer.from(response.delta, "base64").toString("base64"),
        },
      };
      connection.send(JSON.stringify(audioDelta));
    }
  } catch (error) {
    console.error(
      "Error processing OpenAI message:",
      error,
      "Raw message:",
      data
    );
  }
});
// Handle WebSocket close and errors
openAiWs.on("close", () => {
  console.log("Disconnected from the OpenAI Realtime API");
});
openAiWs.on("error", (error) => {
  console.error("Error in the OpenAI WebSocket:", error);
});



// Handle incoming messages from Twilio
connection.on("message", (message) => {
  try {
    const data = JSON.parse(message);
    switch (data.event) {
      case "media":
        if (openAiWs.readyState === WebSocket.OPEN) {
          const audioAppend = {
            type: "input_audio_buffer.append",
            audio: data.media.payload,
          };
          openAiWs.send(JSON.stringify(audioAppend));
        }
        break;
      case "start":
        streamSid = data.start.streamSid;
        console.log("Incoming stream has started", streamSid);
        break;
      default:
        console.log("Received non-media event:", data.event);
        break;
    }
  } catch (error) {
    console.error("Error parsing message:", error, "Message:", message);
  }
});
// Handle connection close
connection.on("close", () => {
  if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();
  console.log("Client disconnected.");
});