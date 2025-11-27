import { Configuration, PopupRequest } from "@azure/msal-browser";

// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
    auth: {
        clientId: "1f8b804d-a894-472d-8e1f-386335611607", // This is the ONLY mandatory field that you need to supply.
        // Replace "common" with your Tenant ID (e.g., "b4c5...") to restrict to your organization.
        // Use "common" for multi-tenant (any Microsoft account).
        authority: "https://login.microsoftonline.com/cef6c279-5fcc-4d99-8bc3-5dc6bf933e30",
        redirectUri: "/", // Points to window.location.origin. You must register this URI on Azure Portal/App Registration.
        postLogoutRedirectUri: "/", // Indicates the page to navigate after logout.
    },
    cache: {
        cacheLocation: "sessionStorage", // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest: PopupRequest = {
    scopes: ["User.Read"],
};
