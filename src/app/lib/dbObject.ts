import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

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
