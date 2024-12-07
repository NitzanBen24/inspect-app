'use client'; // Enable client-side rendering in Next.js 14

import { createContext, useState, ReactNode } from 'react';
import { User } from '../utils/types';

// export interface User {
//   isLoggedIn: boolean;
// } 


export const UserContext = createContext<{
    user: User;
    logIn: (user:User) => void;
    logOut: () => void;
  } | undefined>(undefined);
  
  // UserProvider component to provide user context
  export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>({ isLoggedIn: false, id:0, name:'', email: '' , role:''});
  
    // Function to log in the user
    const logIn = (user: User) => setUser({ isLoggedIn: true, id: user.id, name: user.name, email: user.email, role: user.role });
  
    // Function to log out the user
    const logOut = () => setUser({ isLoggedIn: false, id:0, name:'', email: '' ,role: 'role'});
  
    return (
      <UserContext.Provider value={{ user, logIn, logOut }}>
        {children}
      </UserContext.Provider>
    );
  };



