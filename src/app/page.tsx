import ValidationProvider from "@/components/ValidationProvider";
import UserValidator from "@/components/UserValidator";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0f172a]">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
            MSP Validator
          </h1>
          <p className="text-gray-400">Secure User Identity Verification</p>
        </div>

        <ValidationProvider>
          <UserValidator />
        </ValidationProvider>
      </div>
    </main>
  );
}
