import React from "react";
import ReactDOM from "react-dom/client";
import { PasswordlessAuth, AuthProvider } from '@features/auth';
import { App } from '@app/App';
import "@shared/styles/global.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <PasswordlessAuth>
        <App />
      </PasswordlessAuth>
    </AuthProvider>
  </React.StrictMode>
);
