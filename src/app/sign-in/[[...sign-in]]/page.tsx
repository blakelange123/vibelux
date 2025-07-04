import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back to VibeLux
          </h1>
          <p className="text-gray-400">
            Sign in to access your horticultural lighting platform
          </p>
        </div>
        
        <SignIn 
          appearance={{
            baseTheme: "dark",
            elements: {
              rootBox: "mx-auto",
              card: "bg-gray-900 shadow-xl border border-gray-800",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white",
              socialButtonsBlockButtonText: "text-white",
              dividerLine: "bg-gray-800",
              dividerText: "text-gray-400",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-gray-800 border-gray-700 text-white placeholder-gray-500",
              formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-300",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white",
              footerActionLink: "text-indigo-400 hover:text-indigo-300",
              identityPreviewText: "text-gray-300",
              identityPreviewEditButton: "text-indigo-400 hover:text-indigo-300",
            },
            variables: {
              colorPrimary: "#6366f1",
              colorBackground: "#111827",
              colorText: "#ffffff",
              colorTextSecondary: "#9ca3af",
              colorInputBackground: "#1f2937",
              colorInputText: "#ffffff",
              borderRadius: "0.5rem",
            }
          }}
          redirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}