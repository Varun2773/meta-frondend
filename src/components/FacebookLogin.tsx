import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const FacebookLoginRaw = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  const [signupInfo, setSignupInfo] = useState<string | null>(null);

  // Facebook App Info
  const clientId = "2354391968251323";
  const redirectUri = "https://meta-frondend.vercel.app/";
  const scope =
    "whatsapp_business_messaging,whatsapp_business_management,business_management";
  const config_id = "634146679679302";

  // Build Facebook OAuth URL
  const buildFacebookLoginUrl = () => {
    const state = "xyz123"; // Optional CSRF protection
    return `https://www.facebook.com/v23.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(
      scope
    )}&response_type=code&state=${state}&config_id=${config_id}`;
  };

  // Handle OAuth redirect & extract code
  useEffect(() => {
    const fbCode = searchParams.get("code");
    if (fbCode) {
      setCode(fbCode);
      exchangeCode(fbCode);
    }
  }, [searchParams]);

  // Exchange code for access token
  const exchangeCode = async (code: string) => {
    try {
      const response = await axios.post(
        "https://rtserver-znbx.onrender.com/api/whatsapp/exchange-code",
        { code }
      );
      const token = response.data.access_token;
      setAccessToken(token);
      setSessionInfo(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error("Token exchange failed:", error);
      setSessionInfo("Token exchange failed.");
    }
  };

  // Listen to messages from the embedded signup iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      )
        return;

      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP") {
          if (data.event === "FINISH") {
            console.log("✅ FINISH:", data.data);
          } else if (data.event === "CANCEL") {
            console.warn("⚠️ CANCEL:", data.data?.current_step);
          } else if (data.event === "ERROR") {
            console.error("❌ ERROR:", data.data?.error_message);
          }

          setSignupInfo(JSON.stringify(data, null, 2));
        }
      } catch (err) {
        console.warn("Ignored non-JSON postMessage:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-gray-50">
      {!accessToken ? (
        <a
          href={buildFacebookLoginUrl()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-bold text-lg shadow"
        >
          Login with Facebook
        </a>
      ) : (
        <>
          <p className="text-green-700 font-semibold text-lg">
            ✅ Facebook Access Token Acquired
          </p>
          <iframe
            title="WA Embedded Signup"
            src={`https://www.facebook.com/embed/wa/whatsapp-business-onboarding/?access_token=${accessToken}&config_id=${config_id}`}
            style={{
              width: "100%",
              maxWidth: "800px",
              height: "600px",
              border: "none",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          />
        </>
      )}

      <div className="w-full max-w-3xl space-y-4">
        <div>
          <p className="font-semibold">Authorization Code:</p>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">
            {code || "No code received yet."}
          </pre>
        </div>

        <div>
          <p className="font-semibold">Backend Token Response:</p>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">
            {sessionInfo || "Waiting for token..."}
          </pre>
        </div>

        <div>
          <p className="font-semibold">Signup Event Response (from Facebook iframe):</p>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">
            {signupInfo || "Waiting for signup event..."}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FacebookLoginRaw;
