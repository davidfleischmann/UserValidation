"use client";

import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/auth-config";

export default function UserValidator() {
    const { instance } = useMsal();
    const [email, setEmail] = useState("");
    const [mode, setMode] = useState<"direct" | "remote">("direct");
    const [status, setStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [verificationLink, setVerificationLink] = useState("");
    const [sessionId, setSessionId] = useState("");

    // Poll for session status
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === "validating" && mode === "remote" && sessionId) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/session/${sessionId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.verified) {
                            setStatus("success");
                            clearInterval(interval);
                        }
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [status, mode, sessionId]);

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("validating");
        setErrorMessage("");
        setVerificationLink("");

        if (mode === "direct") {
            try {
                await instance.loginPopup({
                    ...loginRequest,
                    loginHint: email,
                    prompt: "login",
                });
                setStatus("success");
            } catch (error: any) {
                console.error("Validation failed", error);
                if (error.errorCode === "user_cancelled") {
                    setErrorMessage("Validation cancelled by user or engineer.");
                } else {
                    setErrorMessage(error.message || "Validation failed.");
                }
                setStatus("error");
            }
        } else {
            // Remote Mode
            try {
                const res = await fetch("/api/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const data = await res.json();
                if (data.sessionId) {
                    setSessionId(data.sessionId);
                    setVerificationLink(`${window.location.origin}/verify/${data.sessionId}`);
                } else {
                    throw new Error("Failed to create session");
                }
            } catch (error: any) {
                setErrorMessage(error.message || "Failed to start remote verification");
                setStatus("error");
            }
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Validate User</h2>

            <div className="flex justify-center mb-6 bg-black/20 p-1 rounded-lg">
                <button
                    onClick={() => { setMode("direct"); setStatus("idle"); }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "direct" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                >
                    Direct (Passwordless)
                </button>
                <button
                    onClick={() => { setMode("remote"); setStatus("idle"); }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "remote" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                >
                    Remote (Hybrid/MFA)
                </button>
            </div>

            <form onSubmit={handleValidate} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                        User Email (UPN)
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 outline-none transition-all"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === "validating"}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${status === "validating"
                        ? "bg-blue-600/50 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg hover:shadow-blue-500/25"
                        }`}
                >
                    {status === "validating" ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {mode === "direct" ? "Waiting for User..." : "Waiting for Remote Login..."}
                        </span>
                    ) : (
                        mode === "direct" ? "Send Validation Prompt" : "Generate Verification Link"
                    )}
                </button>
            </form>

            {mode === "remote" && verificationLink && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg animate-fade-in">
                    <p className="text-sm text-blue-300 mb-2">Send this link to the user:</p>
                    <div className="flex gap-2">
                        <input
                            readOnly
                            value={verificationLink}
                            className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono"
                        />
                        <button
                            onClick={() => navigator.clipboard.writeText(verificationLink)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm font-medium transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Status: <span className="text-yellow-400 animate-pulse">Waiting for user to sign in...</span>
                    </p>
                </div>
            )}

            {status === "success" && (
                <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg animate-fade-in">
                    <div className="flex items-center gap-3 text-green-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="font-medium">Validation Successful!</span>
                    </div>
                    <p className="mt-2 text-sm text-green-300/80">
                        User identity confirmed via Microsoft Authenticator.
                    </p>
                </div>
            )}

            {status === "error" && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg animate-fade-in">
                    <div className="flex items-center gap-3 text-red-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="font-medium">Validation Failed</span>
                    </div>
                    <p className="mt-2 text-sm text-red-300/80">
                        {errorMessage}
                    </p>
                </div>
            )}
        </div>
    );
}
