import axios from "axios";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

const FacebookLogin = () => {
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  const [sdkResponse, setSdkResponse] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    script.onload = () => {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: "2354391968251323",
          autoLogAppEvents: true,
          xfbml: true,
          version: "v23.0",
        });
      };
    };

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
            const { phone_number_id, waba_id } = data.data;
            console.log(
              "FINISH → Phone number ID:",
              phone_number_id,
              "WABA ID:",
              waba_id
            );
          } else if (data.event === "CANCEL") {
            console.warn("CANCEL → at step:", data.data.current_step);
          } else if (data.event === "ERROR") {
            console.error("ERROR →", data.data.error_message);
          }

          // ✅ Update state
          setSessionInfo(JSON.stringify(data, null, 2));
        }
      } catch (error: any) {
        console.log("Non-JSON message:", event.data, "error:", error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const launchWhatsAppSignup = () => {
    const FB = window.FB;
    if (!FB) return;

    console.log("Frontend redirect_uri:", window.location.href);
    FB.login(
      (response: any) => {
        handleFBLogin(response);
      },
      {
        config_id: "988718802681268", // ✅ your Embedded Signup config ID
        response_type: "code",
        redirect_uri: "https%3A%2F%2Fmeta-frondend.vercel.app%2F",
        override_default_response_type: true,
        extras: {
          version: "v3",
        },
      }
    );
  };

  const handleFBLogin = async (response: any) => {
    console.log("SDK response:", response);

    if (response.authResponse) {
      const code = response.authResponse.code;
      console.log("Received code:", code);

      try {
        const data = await exchangeCode(code);
        console.log("response :", data);
      } catch (err) {
        console.error("Token exchange failed:", err);
      }
    }

    setSdkResponse(JSON.stringify(response, null, 2));
  };

  const exchangeCode = async (code: string) => {
    try {
      const response = await axios.post(
        "https://rtserver-znbx.onrender.com/api/whatsapp/exchange-code",
        {
          code,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to exchange code", error);
      throw error;
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <button
        onClick={launchWhatsAppSignup}
        className="bg-blue-600 text-white px-6 py-3 rounded font-bold text-lg"
      >
        Login with Facebook
      </button>

      <div className="text-left w-full max-w-2xl px-4">
        <p className="font-semibold">Session info response:</p>
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">
          {sessionInfo || "No session info received yet."}
        </pre>

        <br />

        <p className="font-semibold">SDK response:</p>
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">
          {sdkResponse || "No SDK response yet."}
        </pre>
      </div>
    </div>
  );
};

export default FacebookLogin;
