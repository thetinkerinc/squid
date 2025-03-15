import createClientAuth from "@gel/auth-sveltekit/client";
const PUBLIC_APP_URL = "http://localhost:5173";
const options = {
  baseUrl: PUBLIC_APP_URL
};
const auth = createClientAuth(options);
export {
  PUBLIC_APP_URL as P,
  auth as a,
  options as o
};
