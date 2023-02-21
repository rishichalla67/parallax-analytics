import { initializeApp, database } from "firebase";
import express from "express";
import redis from "redis";
import fetch from "node-fetch";

// Initialize Firebase
const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN_KEY,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

initializeApp(config);

// Create a reference to the database
const db = database();

const PORT = process.env.PORT || 3001;

const app = express();

//Crypto (CoinGecko Calls)
app.get("/v1/", (req, res) => {
  // Read data from Firebase database
  db.ref("messages").once("value", (snapshot) => {
    const data = snapshot.val();
    res.json({ message: "Hello from server!", data });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
