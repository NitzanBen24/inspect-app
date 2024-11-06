import { supabase } from "./supabase";

export const getAllUsers = async (): Promise<any[]> => {
    const { data, error } = await supabase
    .from('Users')
    .select('*');

    if (error) {
        throw new Error(`Error fetching forms: ${error.message}`);
    }
    
    return data;
}

export const getUserByEmail = async (email : string): Promise<any> => {
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

export const getManufactures = async () => {
    const { data , error } = await supabase
    .from('Manufactures')
    .select('*');

    if (error) {
        throw new Error(`Error fetching forms: ${error.message}`);
    }
    // console.log('getManufactures::',data)
    return data;
}

export const getTechnicians = async () => {
    const { data , error } = await supabase
    .from('Technicians')
    .select('*');

    if (error) {
        throw new Error(`Error fetching forms: ${error.message}`);
    }
    // console.log('getTechnicians::',data)
    return data;
}

//khcvcqvpsrlxneziwmsx