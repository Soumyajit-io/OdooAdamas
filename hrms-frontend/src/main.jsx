import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";

import App from "./App";
import "./index.css";

const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  console.log("Clerk key:", clerkPubKey)
  console.log(import.meta.env)

ReactDOM.createRoot(
 document.getElementById("root")
).render(
 <React.StrictMode>

  console.log(import.meta.env);
  console.log(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

   <ClerkProvider publishableKey={clerkPubKey} afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard">
      <App />
   </ClerkProvider>

 </React.StrictMode>
);