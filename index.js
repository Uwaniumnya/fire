const express = require("express");
const { JWT } = require("google-auth-library");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();

// Use the environment variable if it's set


// Create a JWT client to authenticate with Firebase
const jwtClient = new JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
});

app.use(express.json());

// Generate the OAuth2 access token using the Service Account credentials
async function generateAccessToken() {
  const accessToken = await jwtClient.getAccessToken();
  return accessToken.token;
}

// Function to send the push notification
async function sendPushNotification(fcmToken, message) {
  const accessToken = await generateAccessToken();
  const url = `https://fcm.googleapis.com/v1/projects/crystalapp-579fb/messages:send`;

  const body = {
    message: {
      token: fcmToken,
      notification: {
        title: "New Message 💌",
        body: message,
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log("Push sent:", data);
}

// Endpoint to trigger sending push notifications
app.post("/sendPushNotification", async (req, res) => {
  const { recipient_id, sender_name } = req.body;

  if (!recipient_id || !sender_name) {
    return res.status(400).send("Missing recipient_id or sender_name");
  }

  // Assuming you are using Supabase
  const { createClient } = require("@supabase/supabase-js");

  const supabase = createClient(
    "https://syymhweqggvpdseugwvi.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eW1od2VxZ2d2cGRzZXVnd3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODUwMTgsImV4cCI6MjA2ODE2MTAxOH0.5sQ0UH_FLR6UxC9WR7UOz0v6wrFW8SUsJA0dW8iKzwY" // You should never hard-code this in production!
  );

  // Fetch the FCM token for the recipient from Supabase
  const { data: user, error } = await supabase
    .from("users")
    .select("fcm_token")
    .eq("id", recipient_id)
    .maybeSingle();

  if (error || !user || !user.fcm_token) {
    return res.status(404).send("FCM token not found for this user.");
  }

  const fcmToken = user.fcm_token; // The actual FCM token

  try {
    // Send the push notification
    await sendPushNotification(fcmToken, `${sender_name}, you have a message!`);

    res.json({ success: true, message: "Notification sent successfully!" });
  } catch (error) {
    console.error("Error sending push notification:", error);
    res.status(500).send("Error sending push notification");
  }
});

// Export the Express app as a serverless function (for Vercel)
module.exports = app;
