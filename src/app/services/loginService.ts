import { NextResponse } from 'next/server';
import { getUserByEmail } from '../lib/dbObject';



export const authenticateUser = async (email: string, password: string) => {
    
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
        return userWithoutPassword;
    } catch(error) {
        console.error('Error authenticating user:', error);
        return null;
    }

  };