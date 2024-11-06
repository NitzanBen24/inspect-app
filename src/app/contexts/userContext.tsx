'use client'; // Enable client-side rendering in Next.js 14

import { createContext, useState, ReactNode } from 'react';

export interface User {
    isLoggedIn: boolean;
} 


export const UserContext = createContext<{
    user: User;
    logIn: () => void;
    logOut: () => void;
  } | undefined>(undefined);
  
  // UserProvider component to provide user context
  export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>({ isLoggedIn: false });
  
    // Function to log in the user
    const logIn = () => setUser({ isLoggedIn: true });
  
    // Function to log out the user
    const logOut = () => setUser({ isLoggedIn: false });
  
    return (
      <UserContext.Provider value={{ user, logIn, logOut }}>
        {children}
      </UserContext.Provider>
    );
  };



