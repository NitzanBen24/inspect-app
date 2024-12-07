import { createContext, useState, ReactNode } from 'react';
import { Technicians } from '../utils/types';

// Create the context with the correct types
export const TechniciansContext = createContext<{
    technicians: Technicians[];
    techniciansSet: (technicians: Technicians[]) => void;
} | undefined>(undefined);

export const TechniciansProvider = ({ children }: { children: ReactNode }) => {
    const [technicians, setTechnicians] = useState<Technicians[]>([]);
    
    const techniciansSet = (technicians: Technicians[]) => {
        setTechnicians(technicians);
    };

    return (
        <TechniciansContext.Provider value={{ technicians, techniciansSet }}>
            {children}
        </TechniciansContext.Provider>
    );
};

