import { User } from "@/app/utils/types";
import { supabase } from "../supabase";

export async function getAllUsers (): Promise<User[]> {
    const { data, error } = await supabase
    .from('Users')
    .select('*');

    if (error) {
        throw new Error(`Error fetching forms: ${error.message}`);
    }
    
    return data;
}

export async function getUserByEmail (email : string): Promise<any> {
    const {data, error } = await supabase
    .from('Users')
    .select('*')
    .eq('email', email)
    .single()

    if (error) {
        throw new Error(`Error fetching forms: ${error.message}`);
    }
    
    return data;
}

export async function getRole (id: string): Promise<any> {
    try {
        const { data, error } = await supabase
        .from('Users')
        .select('role')
        .eq('id',id)
        .single()

        if (error) {
            console.error('Error getting user role:', error.message);            
            throw new Error(`Failed to get user role: ${error.message}`);
        }
        
        return data;
    } catch (err) {
        console.error('Unexpected error getting user role:', err);
        return { error: err, message: 'Can not get user role An unexpected error occurred!' };
    }
}