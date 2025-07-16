const express = require("express");
const { JWT } = require("google-auth-library");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();

// Use the environment variable if it's set


// Create a JWT client to authenticate with Firebase
const jwtClient = new JWT({
  email: "firebase-adminsdk-fbsvc@crystalapp-579fb.iam.gserviceaccount.com",
  key: "nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCYztLrzEkARIJn\nNRff9xg7zczP8JtnKWeg8Xh6H23CN9BfzP1wSF3uD6zm0TRw2Jjd/p3apsXOx8D9\nuTrHoO9ta2Uvu2ilLZuGREg3LAAYsaBpGXbNGJ7GoIFUA0w1cLiTTO80vMXNIhaB\npj3ipMlGyfw9XslDRhX4ktF30+BL6qjr330m1CRz+aMLriw+wj2X6gFO70thyIkY\npA9cZbqNbIED5G98I/42aO2mn+wdeI6CijrBkm/HyXex5aRRBLoelgLW4sdJ51jv\nOhAGJdlEhaKb7hcpWnsmW9BHvHL69PiOb316GCRm2UYcqVf2s5j3wR0LJbbj0mSz\nXQVC6MTfAgMBAAECggEAAugDDggdXkLvT7ubPtctRBVi9YNeeMGftfH9gtBOWLXF\nDHkjsR9Y1TLjyqL+QCRDzi4nwCvdlHZeaHC1Pp/zCY7+e8Af4MtPM9/PZFdfsm3e\n+E2Pe1mqudCGOGA9R9JjN8dSv8X2kBEZcOJ9ainqcubS1WalP04cApnUhnjZny90\nSnGrSF4boQoD+wmBZolKJmDxISj+5js6lF1QgdZo7RFBqz901AvcStNTBpHJ2bZk\nizywtRs2LpLpBE9+iyEOIIE2My5FZ8ETj8/SKtKufPztUKCK3eZ6PNMXxZgk1uLN\ntzoXqmEEVKKZBq5W5Htlr89Lw5UMevw2LEl2bU2uIQKBgQDXqZv2LuI0ghR6x6na\n4r6JX3IsQihXgpyutYoHrq/Y2QUonIjSn00aTW+pf3cA1iH35LYL3Kbh1jarvk/c\nVMd7GsB6ZiCM3lb1nt3oH+JXF3le57KtRQeulrULFQIBUTKTtdE6+S2phMDdslcj\nBLaYbOYo7rNvIAi1CYMMVDo5EQKBgQC1Y5kzHGis4OToIpOxbYkS+Bi/Bp4OVTmg\nAXHH/jkWExZzwK+1EBIJ7co1usxUVKNVlkAIdh0IdoSSk95dgt+RQfCprC5l7aKh\nGgUULIVtL3thr3EYMkiceyszTig0xLzOpuaW6fxB1NstnoWxvmfY9RFmA0cftWfv\nAo4KVAWe7wKBgQDBoZ1QakPbVTfCDWbqCk9809+U8Ul7WOAI1SI7R5LHJgNFtVX7\nleAKT6CEFNfqPlh9VDJHcDO97TFk/hiCAPSiCSDsRKnREQgOvDcNZSM5gvAMUAfT\nHnmJPfMLIi+MszSv/rz/MB7ZZ0IrSyaFYIP5Uz1LXxZoHeDzerjY5v7noQKBgFm2\nnykWXfdTbCQcJexVfrxxFNw2S6pPIKcwz7PY2yc93Zb2sHDfN+zNPXwBndn/2qEU\nJSuKL6Xl6IAOvqaFekn/0SY6UOB8/jisA+MMehmcqGuSOF99T0iF6sH/YAdpXvDe\nv6HYrLlqq9UOWJWm1PoLi8VmzaCzOmqOWu5kzDrlAoGBAJ8VEKCaBqHgg9euJ7+K\nDSb8qmzooieg8R/ZB/GSPDSg61Hna+2TtUzIUp1cQZXLRLaBUOkP9V+IMGERevHg\nZw+KUrYN3Ukr+VbH6L/j57e4/V6IAVRfu6eU1fka68TPjbEK2nfymZD6ZjaqOLm1\n5El9tblOYx1FqA7fFHVYV3AL",
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
