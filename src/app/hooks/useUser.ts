import { useContext } from "react";
import { UserContext } from "../contexts/userContext";

// Custom hook for consuming the UserContext
export const useUser = () => {
    const context = useContext(UserContext);
    
    if (context === undefined) {
      throw new Error('useUserContext must be used within a UserProvider');
    }
    
    return context;
  };