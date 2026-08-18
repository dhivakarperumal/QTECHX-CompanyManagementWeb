/**
 * Token Debugger - Check authentication status
 * Open browser console and run: checkTokenStatus()
 */

export function checkTokenStatus() {
  console.group("🔐 Authentication Status Debug");
  
  // Check localStorage
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  console.log("📦 localStorage.token:", token ? `Found (${token.length} chars)` : "❌ NOT FOUND");
  
  if (token) {
    // Parse JWT to see claims
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const decoded = JSON.parse(atob(parts[1]));
        console.log("🔑 Token Claims:", decoded);
        console.log("⏰ Expires:", new Date(decoded.exp * 1000).toLocaleString());
      }
    } catch (e) {
      console.error("⚠️ Could not decode token:", e.message);
    }
  }
  
  console.log("👤 localStorage.user:", user ? `Found (${user.length} chars)` : "❌ NOT FOUND");
  if (user) {
    try {
      const userObj = JSON.parse(user);
      console.log("User Data:", userObj);
      console.log("User Role:", userObj.role);
    } catch (e) {
      console.error("⚠️ Could not parse user data");
    }
  }
  
  console.log("ℹ️ Next Steps:");
  if (!token) {
    console.log("❌ No token found. You need to:");
    console.log("   1. Log in to your account");
    console.log("   2. Make sure your user has been promoted to 'admin' role");
  } else {
    console.log("✅ Token found. If you're still getting 401:");
    console.log("   1. Check the backend logs for auth errors");
    console.log("   2. Try logging out and back in");
  }
  
  console.groupEnd();
}

// Make it globally available in browser console
if (typeof window !== 'undefined') {
  window.checkTokenStatus = checkTokenStatus;
}

export default checkTokenStatus;
