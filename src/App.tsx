import React, { useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { Payment } from "./pages/Payment";
import { getCurrentUser, signOut, initializeUserCredits } from "./lib/supabase";

type Page = "home" | "auth" | "dashboard" | "payment";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        // Initialize credits for the user
        try {
          await initializeUserCredits(currentUser.id);
        } catch (error) {
          console.error("Failed to initialize credits:", error);
        }
        
        setCurrentPage("dashboard");
      } else {
        setCurrentPage("home");
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setCurrentPage("home");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === "home" && (
        <Home 
          onSignIn={() => setCurrentPage("auth")}
          onSignUp={() => setCurrentPage("auth")}
        />
      )}
      {currentPage === "auth" && (
        <Auth 
          onSuccess={async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            if (currentUser) {
              try {
                await initializeUserCredits(currentUser.id);
              } catch (error) {
                console.error("Failed to initialize credits:", error);
              }
              setCurrentPage("dashboard");
            }
          }}
        />
      )}
      {currentPage === "dashboard" && user && (
        <Dashboard 
          user={user}
          onSignOut={handleSignOut}
        />
      )}
      {currentPage === "payment" && (
        <Payment userId={user?.id || ""} onSuccess={() => setCurrentPage("dashboard")} />
      )}
    </div>
  );
}

export default App;
