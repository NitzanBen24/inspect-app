import { useContext } from "react";
import { TechniciansContext } from "@/app/contexts/TechniciansContext"

export const useTechnician = () => {
    const context =  useContext(TechniciansContext);

    if (context === undefined) {
        throw new Error('useTechnician must be used within a UserProvider');
      }
      
      return context;
}