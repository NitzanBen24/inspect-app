import { NextResponse } from 'next/server';
import { User } from '../utils/types';
import { getUserByEmail } from '../lib/db/users';



export const isUserExists = async (email: string, password: string): Promise<User | null> => {
    
    try {                

        const user = await getUserByEmail(email);       
        
        if (!user) {
            console.error('authenticateUser.null::')
            return null
        }

        if (user.password !== password) {
            console.error('authenticateUser.pass.notEqual::')
            return null;
        }

        const { password: _, ...userWithoutPassword } = user;
        
        return userWithoutPassword as User;
    } catch(error) {
        console.error('Error authenticating user:', error);
        return null;
    }

  };