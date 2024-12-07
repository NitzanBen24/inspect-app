import { createContext, useState, ReactNode } from 'react';
import { Manufacture } from '../utils/types';

// Create the context with the correct types
export const ManufactureContext = createContext<{
    manufactures: Manufacture[];
    manufacturesSet: (manufacture: Manufacture[]) => void;
} | undefined>(undefined);

export const ManufactureProvider = ({ children }: { children: ReactNode }) => {
    const [manufactures, setManufactures] = useState<Manufacture[]>([]);

    const manufacturesSet = (manufactures: Manufacture[]) => {
        setManufactures(manufactures);
    }

    return (
        <ManufactureContext.Provider value={{ manufactures, manufacturesSet }}>
            {children}
        </ManufactureContext.Provider>
    );
};

