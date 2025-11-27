"use client";

import React, { useEffect, useState } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "../config/auth-config";

interface ValidationProviderProps {
    children: React.ReactNode;
}

export default function ValidationProvider({ children }: ValidationProviderProps) {
    const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);

    useEffect(() => {
        const instance = new PublicClientApplication(msalConfig);
        instance.initialize().then(() => {
            setMsalInstance(instance);
        });
    }, []);

    if (!msalInstance) {
        return null; // Or a loading spinner
    }

    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
