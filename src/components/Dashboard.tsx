import { useEffect, useState } from "react";

declare global {
  interface Window {
    waEmbeddedSignup?: any;
  }
}

const Dashboard = () => {
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasWABA = params.get("hasWABA");
    const fbAccessToken = params.get("fbAccessToken");

    const loadWaSignupScript = () => {
      const script = document.createElement("script");
      script.src = "https://www.whatsapp.com/business/embedded-signup.js";
      script.async = true;
      script.onload = () => {
        if (
          hasWABA === "false" &&
          fbAccessToken &&
          window.waEmbeddedSignup
        ) {
          setShowSignup(true);

          window.waEmbeddedSignup.init({
            element: "wa_embed_signup",
            accessToken: fbAccessToken,
            businessName: "My Business Name",
            callback: (result: any) => {
              console.log("Signup result:", result);
              // Store result.waba_id, phone_number_id, etc.
            },
          });
        }
      };
      script.onerror = () => {
        console.error("❌ Failed to load WhatsApp embedded signup script");
      };
      document.body.appendChild(script);
    };

    loadWaSignupScript();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {showSignup ? (
        <div id="wa_embed_signup" />
      ) : (
        <p>You already have a WhatsApp Business Account 🎉</p>
      )}
    </div>
  );
};

export default Dashboard;
