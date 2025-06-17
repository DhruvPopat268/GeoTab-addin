// app/api/driver-details/route.js
import axios from 'axios';

// Configure for UK region
export const runtime = 'nodejs18.x';
export const preferredRegion = 'lhr1'; // London, UK

export async function POST(request) {
  try {
    const { licenseNo } = await request.json();

    if (!licenseNo) {
      return Response.json({ error: 'License number is required' }, { status: 400 });
    }

    console.log("Authenticating with DVLA...");

    // Step 1: Generate token
    const authResponse = await axios.post(
      'https://driver-vehicle-licensing.api.gov.uk/thirdparty-access/v1/authenticate',
      {
        userName: process.env.DVLA_USERNAME,
        password: process.env.DVLA_PASSWORD
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const token = authResponse.data?.token;

    if (!token) {
      console.error("Failed to obtain authentication token");
      return Response.json({ error: 'Authentication failed' }, { status: 401 });
    }

    console.log("Token received");

    // Step 2: Fetch driver details
    console.log("Fetching driver details...");
    const driverDetailsResponse = await axios.post(
      'https://driver-vehicle-licensing.api.gov.uk/full-driver-enquiry/v1/driving-licences/retrieve',
      {
        drivingLicenceNumber: licenseNo,
        includeCPC: true,
        includeTacho: true,
        acceptPartialResponse: "true"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-api-key': process.env.DVLA_API_KEY
        }
      }
    );

    console.log("Driver details received");
    return Response.json({
      success: true,
      data: driverDetailsResponse.data
    });

  } catch (err) {
    console.error("Error in driver details API:", err.response?.data || err.message);
    
    const statusCode = err.response?.status || 500;
    const errorMessage = err.response?.data?.message || err.message || 'Internal server error';
    
    return Response.json({
      success: false,
      error: errorMessage
    }, { status: statusCode });
  }
}

// Optional: Add GET method for health check
export async function GET() {
  return Response.json({ 
    message: 'Driver Details API is running',
    region: 'UK (London)',
    timestamp: new Date().toISOString()
  });
}