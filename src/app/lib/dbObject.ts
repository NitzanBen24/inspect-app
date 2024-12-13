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

export const getForms = async (): Promise<FieldsObject[]> => {
    const { data, error } = await supabase
    .from('Forms')
    .select('*')

    if (error) {
        throw new Error(`Error fetching forms: ${error.message}`);
    }

    const filteredData = data.map((item: FieldsObject) => {
      const { user_id, ...rest } = item;
      return rest;
    });
    
    return filteredData;
}


export const addNewForm = async (payload: FieldsObject[]): Promise<{ message: string; success?:boolean; error?: unknown }> => {
  try {
    const { error } = await supabase.from('Forms').insert(payload);

    if (error) {
      console.error('Error inserting data:', error.message);
      return { error, message: 'Failed to insert data!' };
    }

    return { message: 'Data inserted successfully',success: true };
  } catch (err) {
    console.error('Unexpected error inserting data:', err);
    return { error: err, message: 'An unexpected error occurred!'};
  }
};

export const getFormById = async (id: string) :Promise<any> => {  
  try {
    const { data, error } = await supabase
      .from('Forms')
      .select('*')
      .eq('id', parseInt(id))
      .single()

      if (error) {
        //console.error('Error updating data:', error.message);
        return { error, message: error.message };
      }

      return data;

  } catch (err) {
    console.error('Unexpected error updating data:', err);
    return { error: err, message: 'Failed to update data!' };
  }

}

export const updateForm = async (id: string | number, payload: FieldsObject[]): Promise<{ message: string; success?:boolean; error?: unknown }> => {  
  try {
    const { error } = await supabase
      .from('Forms')
      .update(payload)
      .eq('id', id); // Assuming `id` is the primary key column name

    if (error) {
      console.error('Error updating data:', error.message);
      return { error, message: 'Failed to update data!' };
    }

    return { message: 'Data updated successfully',success: true };
  } catch (err) {
    console.error('Unexpected error updating data:', err);
    return { error: err, message: 'An unexpected error occurred!' };
  }
};

export const updateFormStatus = async (
  payload: {id: string , status: string}
): Promise<{ message: string; success?: boolean; error?: unknown }> => {
  try {
    const { error } = await supabase
      .from("Forms")
      .update({ status: payload.status }) // Update only the status field
      .eq("id", payload.id); // Match the record by its ID

    if (error) {
      console.error("Error updating status:", error.message);
      return { error, message: "Failed to update status!" };
    }

    return { message: "Status updated successfully", success: true };
  } catch (err) {
    console.error("Unexpected error updating status:", err);
    return { error: err, message: "An unexpected error occurred while updating status!" };
  }
};

export const  deleteForm = async (id:string): Promise<{ message: string; success?: boolean; error?: unknown }> => {
  try {
    const { error } = await supabase
    .from("Forms")
    .delete() // Delete the record
    .eq("id", id); // Match the record by its ID

    if (error) {
      console.error("Error deleting form:", error.message);
      return { error, message: "Failed to delete form!" };
    }

    return { message: "Form deleted successfully", success: true };
  } catch (err) {
    console.error("Unexpected error updating status:", err);
    return { error: err, message: "An unexpected error occurred while deleting form!" };
  }
}