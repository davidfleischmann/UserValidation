"use client";

import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/config/auth-config";
import ValidationProvider from "@/components/ValidationProvider";
import { useParams } from "next/navigation";

function VerificationProcess() {
    const { instance, inProgress } = useMsal();
    const params = useParams();
    const sessionId = params.id as string;
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("Initializing secure verification...");
    const hasStarted = React.useRef(false);

    useEffect(() => {
        const verifyUser = async () => {
            if (hasStarted.current || inProgress !== "none") return;
            hasStarted.current = true;

            try {
                // 1. Get session details to know who we are verifying
                const sessionRes = await fetch(`/api/session/${sessionId}`);
                if (!sessionRes.ok) throw new Error("Invalid or expired session");
                const session = await sessionRes.json();

                setMessage(`Verifying identity for ${session.email}...`);

                // 2. Trigger Login
                await instance.loginPopup({
                    ...loginRequest,
                    loginHint: session.email,
                    prompt: "login",
                });

                // 3. If successful, notify API
                await fetch(`/api/session/${sessionId}`, { method: "POST" });

                setStatus("success");
                setMessage("Identity Verified Successfully. You can close this window.");
            } catch (error: any) {
                console.error(error);
                // Ignore interaction_in_progress errors as they might happen if the user clicks fast or strict mode
                if (error.errorCode !== "interaction_in_progress") {
                    setStatus("error");
                    setMessage(error.message || "Verification failed.");
                }
            }
        };

        if (sessionId) {
            verifyUser();
        }
    }, [sessionId, instance, inProgress]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0f172a] text-white">
            <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 text-center">
                {status === "verifying" && (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <h2 className="text-xl font-bold mb-2">Verifying Identity</h2>
                        <p className="text-gray-300">{message}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center text-green-400">
                        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h2 className="text-xl font-bold mb-2">Verified!</h2>
                        <p className="text-gray-300">{message}</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center text-red-400">
                        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
                        <p className="text-gray-300">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <ValidationProvider>
            <VerificationProcess />
        </ValidationProvider>
    );
}
