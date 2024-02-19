import React from "react";
import CustomSnackbar from "../components/CustomSnackbar";

const useSnackbarHook = () => {
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const closeSnackbar = () => {
    setSnackbar((prevState) => ({ ...prevState, open: false }));
  };

  const openSuccessSnackbar = (message: string, error?: boolean) => {
    //console.log(message);
    setSnackbar({
      open: true,
      message,
      severity: error ? "error" : "success",
    });
  };

  const SnackbarComponent = (
    <CustomSnackbar
      open={snackbar.open}
      onClose={closeSnackbar}
      message={snackbar.message}
      severity={snackbar.severity}
    />
  );

  return {
    openSuccessSnackbar,
    SnackbarComponent,
  };
};

export default useSnackbarHook;
