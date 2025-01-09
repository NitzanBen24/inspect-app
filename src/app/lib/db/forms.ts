import { FieldsObject } from "@/app/utils/types";
import { supabase } from "../supabase";




export const getForms = async (): Promise<FieldsObject[]> => {
    const { data, error } = await supabase
    .from('Forms')
    .select('*')

    if (error) {
        throw new Error(`Error fetching forms: ${error.message}`);
    }

    /** check what it dose */
    const filteredData = data.map((item: FieldsObject) => {
      const { user_id, ...rest } = item;
      return rest;
    });
    
    return filteredData;
}

export const getActiveForms = async (tableName: string): Promise<FieldsObject[]> => {

    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .neq('status', 'archive'); // Filter: status not 'archive'

    if (error) {
        throw new Error(`Error fetching forms: ${error.message}`);
    }

    // Remove 'user_id' from each form object
    const filteredData = data.map((item: FieldsObject) => {
        const { user_id, ...rest } = item;
        return rest;
    });

    return filteredData;
};

export const getActiveFormsByUserId = async (id: string, tableName: string): Promise<FieldsObject[]> => {
    
    const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('userid', id)
    .neq('status', 'archive');

    if (error) {
      throw new Error(`Error fetching forms for user ID "${id}" from table "${tableName}": ${error.message}`);
    }
    
    return data as FieldsObject[];
}

export const getFormById = async (id: string, tableName: string): Promise<FieldsObject> => {

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    throw new Error('Error: Invalid ID provided. ID must be a number.');
  }

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', parsedId)
    .single();

  if (error) {
    throw new Error(`Error fetching form from table "${tableName}": ${error.message}`);
  }

  return data as FieldsObject;
   
};

export const addNewForm = async (payload: FieldsObject[], tableName: string): Promise<{ message: string; success?:boolean; error?: unknown }> => {  

  if (!tableName || tableName.length === 0) {
    throw new Error('Error table name is missing!');
  }

  const { error } = await supabase.from(tableName).insert(payload);

  if (error) {
    console.error('Error inserting data:', error.message);
    throw new Error(`Error, Failed to insert data: ${error.message}`);        
  }

  return { message: 'Data inserted successfully',success: true };
}

export const updateForm = async (id: string | number, payload: FieldsObject[], tableName: string): Promise<{ message: string; success?:boolean; error?: unknown }> => {  

  const { error } = await supabase
    .from(tableName)
    .update(payload)
    .eq('id', id); // Assuming `id` is the primary key column name

  if (error) {
    console.error('Error updating data:', error.message);
    throw new Error(`Error updating data: ${error.message}`)
    //return { error, message: 'Failed to update data!' };
  }

  return { message: 'Data updated successfully',success: true };

};

export const updateFormStatus = async (payload: {id: string , status: string}, tableName: string): Promise<{ message: string; success?: boolean; error?: unknown }> => {

  const { error } = await supabase
    .from(tableName)
    .update({ status: payload.status }) // Update only the status field
    .eq("id", payload.id); // Match the record by its ID

  if (error) {
    console.error("Error updating status:", error.message);
    throw new Error(`Error updating status: ${error.message}`)    
  }

  return { message: "Status updated successfully", success: true };

};

export const  deleteForm = async (id:string, tableName: string): Promise<{ message: string; success?: boolean; error?: unknown }> => {

  const { error } = await supabase
  .from(tableName)
  .delete() // Delete the record
  .eq("id", id); // Match the record by its ID

  if (error) {
    console.error("Error deleting form:", error.message);
    throw new Error(`Error, Failed to delete form: ${error.message}`);
  }

  return { message: "Form deleted successfully", success: true };

}