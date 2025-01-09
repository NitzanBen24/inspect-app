import { data } from "autoprefixer";
import { useUser } from "../hooks/useUser";
import { FormField, FieldsObject, PdfForm, User } from "../utils/types";
import { supabase } from "./supabase";
import { appDropDwons } from "../utils/AppContent";


export const getAllUsers = async (): Promise<User[]> => {
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

/** Add Return Type => remove any!! */
export const getManufactures = async (): Promise<any[]> => {
    const { data , error } = await supabase
    .from('Manufactures')
    .select('*');

    if (error) {
        throw new Error(`Error fetching forms: ${error.message}`);
    }
    
    return data;
}

/** Add Return Type => remove any!! */
export const getTechnicians = async (): Promise<any[]> => {
    const { data , error } = await supabase
    .from('Technicians')
    .select('*');

    if (error) {
        throw new Error(`Error fetching forms: ${error.message}`);
    }    
    return data;
}
