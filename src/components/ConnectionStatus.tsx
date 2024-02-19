import React, { useEffect, useRef, useState } from "react";
import useSnackbarHook from "../hooks/snackbarHook";

const ConnectionStatus: React.FC = () => {
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const wasOnline = useRef(isOnline);

  const updateOnlineStatus = () => {
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      openSuccessSnackbar("You've lost network connection.", true);
    } else if (!wasOnline.current) {
      openSuccessSnackbar("Network connection restored!");
    }
    wasOnline.current = navigator.onLine;
  };

  useEffect(() => {
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return <div> {SnackbarComponent}</div>;
};

export default ConnectionStatus;
