import { useEffect } from "react";

const FacebookLogin = () => {
  useEffect(() => {
    // Load Facebook SDK script
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    // Initialize the Facebook SDK
    script.onload = () => {
      (window as any).fbAsyncInit = function () {
        (window as any).FB.init({
          appId: "1272868310644432", // ✅ your App ID
          autoLogAppEvents: true,
          xfbml: true,
          version: "v19.0", // ✅ Graph API version
        });
      };
    };

    // Add message event listener
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      )
        return;

      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP") {
          console.log("message event: ", data);
          // handle Meta signup event here
        }
      } catch {
        console.log("message event: ", event.data);
      }
    };

    window.addEventListener("message", handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Launch method and callback
  const launchWhatsAppSignup = () => {
    const FB = (window as any).FB;
    if (!FB) return;

    FB.login(
      (response: any) => {
        if (response.authResponse) {
          const code = response.authResponse.code;
          console.log("response: ", code);
          // handle success (send code to backend)
        } else {
          console.log("response: ", response);
          // handle cancel/error
        }
      },
      {
        config_id: "1016974567027067", // ✅ your config ID
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "3",
        },
      }
    );
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={launchWhatsAppSignup}
        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg"
      >
        Login with Facebook
      </button>
    </div>
  );
};

export default FacebookLogin;
