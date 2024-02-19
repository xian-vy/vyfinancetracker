import { Button, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { DASHBOARD_PATH } from "../constants/routes";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Stack direction="row" justifyContent="center" alignItems="center" height="100vh">
          <Typography variant="body2">Snap.. something went wrong</Typography>
          <Button onClick={() => (window.location.href = DASHBOARD_PATH)}>Try Again</Button>
        </Stack>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
