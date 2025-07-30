// Load environment variables from .env file
require("dotenv").config();

// Import necessary modules
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const http = require("http");

const connectDB = require("./db/connection");

// Initialize Express app
const app = express();

// Create an HTTP server with Express
const server = http.createServer(app);


// Middleware options for CORS
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true); // Allow requests from all origins
  },
  credentials: true, // Allow credentials (cookies, HTTP authentication)
};


// Connect to MongoDB using the connection function
connectDB();

// Configure middleware
app.use(cors(corsOptions)); // Enable CORS with options
app.use(bodyParser.json()); // Parse JSON bodies with standard JSON format
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies


// Import route modules
const authRouter = require("./routes/auth");
const cityRouter = require("./routes/city");

// Register routes with base paths
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/city", cityRouter);
// app.use("/api/v1/users", userRouter);

let googleSheetData = [];
let googleSheetData1 = [];

async function fetchGoogleSheetData() {
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  const API_KEY = process.env.GOOGLE_API_KEY;
  
  // Check if environment variables are set
  if (!SHEET_ID || !API_KEY) {
    console.error('Missing required environment variables: GOOGLE_SHEET_ID or GOOGLE_API_KEY');
    return;
  }
  
  const RANGE = 'Sheet1!A1:Z13000'; // adjust range as needed
  const RANGE1 = 'Master sheet (2)!A1:ZZ11'; // adjust range as needed - extended to get up to 702 columns

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const url1 = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE1}?key=${API_KEY}`;

  try {
    // Fetch both sheets in parallel
    const [response, response1] = await Promise.all([
      fetch(url),
      fetch(url1)
    ]);

    const [data, data1] = await Promise.all([
      response.json(),
      response1.json()
    ]);

    const rows = data.values;
    const rows1 = data1.values;

    if (!rows || rows.length === 0) {
      console.error('Error: No data found in Sheet1');
      return;
    }

    if (!rows1 || rows1.length === 0) {
      console.error('Error: No data found in Master sheet (2)');
      return;
    }

    googleSheetData = rows;
    googleSheetData1 = rows1;
    
    console.log(`Successfully fetched ${rows.length} rows from Sheet1 and ${rows1.length} rows from Master sheet (2)`);
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

// Fetch data once when the server starts
fetchGoogleSheetData();


app.get('/api/sheet-data', (req, res) => {  
  res.json([googleSheetData,googleSheetData1]);
});

// Endpoint to refresh Google Sheets data
app.post('/api/refresh-sheet-data', async (req, res) => {
  try {
    console.log('Refreshing Google Sheets data...');
    await fetchGoogleSheetData();
    console.log('Google Sheets data refreshed successfully');
    res.json({ 
      success: true, 
      message: 'Data refreshed successfully',
      data: [googleSheetData, googleSheetData1]
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to refresh data' 
    });
  }
});

// Start the server and listen on the specified port
const PORT = process.env.PORT || 3013;
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

