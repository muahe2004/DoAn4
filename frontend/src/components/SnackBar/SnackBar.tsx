import React, { createContext, useCallback, useContext, useState } from "react";
import Snackbar, { type SnackbarOrigin } from "@mui/material/Snackbar";
import Alert, { type AlertColor } from "@mui/material/Alert";

type SnackbarOptions = {
  message: string;
  severity?: AlertColor;
  duration?: number;
};

type SnackbarState = SnackbarOptions & { open: boolean };

type SnackbarContextValue = {
  showSnackbar: (options: SnackbarOptions | string) => void;
  hideSnackbar: () => void;
};

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

const DEFAULT_DURATION = 3000;

export const SnackbarProvider: React.FC<{
  children: React.ReactNode;
  anchorOrigin?: SnackbarOrigin;
}> = ({ children, anchorOrigin = { vertical: "top", horizontal: "right" } }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
    duration: DEFAULT_DURATION,
  });

  const showSnackbar = useCallback((options: SnackbarOptions | string) => {
    if (typeof options === "string") {
      setSnackbar({
        open: true,
        message: options,
        severity: "info",
        duration: DEFAULT_DURATION,
      });
      return;
    }

    setSnackbar({
      open: true,
      message: options.message,
      severity: options.severity ?? "info",
      duration: options.duration ?? DEFAULT_DURATION,
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.duration}
        onClose={hideSnackbar}
        anchorOrigin={anchorOrigin}
      >
        <Alert
          onClose={hideSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextValue => {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }

  return context;
};