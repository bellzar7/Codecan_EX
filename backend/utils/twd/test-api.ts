/**
 * Test script to verify TwelveData API connectivity
 * Run with: ts-node -r dotenv/config -r module-alias/register backend/utils/twd/test-api.ts
 */

async function testTwelveDataAPI() {
  const apiKey = process.env.TWD_API_KEY;
  const baseUrl = process.env.TWD_BASE_URL || "https://api.twelvedata.com";

  console.log("=== TwelveData API Test ===\n");
  console.log("API Key:", apiKey ? `${apiKey.substring(0, 8)}...` : "NOT SET");
  console.log("Base URL:", baseUrl);
  console.log("");

  if (!apiKey) {
    console.error("❌ TWD_API_KEY not found in .env file");
    process.exit(1);
  }

  // Test 1: Forex Pairs
  console.log("1. Testing Forex Pairs endpoint...");
  try {
    const forexUrl = `${baseUrl}/forex_pairs?apikey=${apiKey}`;
    const response = await fetch(forexUrl);
    console.log("   Status:", response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("   ✅ Success!");
      console.log("   Data keys:", Object.keys(data));
      console.log("   Has data array:", !!data.data);
      console.log("   Count:", data.data?.length || 0);
      if (data.data && data.data.length > 0) {
        console.log("   First item:", data.data[0]);
      }
    } else {
      const text = await response.text();
      console.log("   ❌ Failed:", text.substring(0, 200));
    }
  } catch (error: any) {
    console.log("   ❌ Error:", error.message);
  }
  console.log("");

  // Test 2: Stocks
  console.log("2. Testing Stocks endpoint...");
  try {
    const stocksUrl = `${baseUrl}/stocks?apikey=${apiKey}`;
    const response = await fetch(stocksUrl);
    console.log("   Status:", response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("   ✅ Success!");
      console.log("   Count:", data.data?.length || 0);
    } else {
      const text = await response.text();
      console.log("   ❌ Failed:", text.substring(0, 200));
    }
  } catch (error: any) {
    console.log("   ❌ Error:", error.message);
  }
  console.log("");

  // Test 3: Indices
  console.log("3. Testing Indices endpoint...");
  try {
    const indicesUrl = `${baseUrl}/indices?apikey=${apiKey}`;
    const response = await fetch(indicesUrl);
    console.log("   Status:", response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("   ✅ Success!");
      console.log("   Count:", data.data?.length || 0);
    } else {
      const text = await response.text();
      console.log("   ❌ Failed:", text.substring(0, 200));
    }
  } catch (error: any) {
    console.log("   ❌ Error:", error.message);
  }
  console.log("");

  console.log("=== Test Complete ===");
}

testTwelveDataAPI().catch(console.error);
