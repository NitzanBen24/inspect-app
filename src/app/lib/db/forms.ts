import { ActionResponse, FieldsObject, SearchData } from "@/app/utils/types";
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
        .neq('status', 'archive') // Filter: status not 'archive'
        .order("created_at", { ascending: false }); // Ensure latest data

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
    .neq('status', 'archive')
    .order("created_at", { ascending: false }); // Ensure latest data

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

export const addNewForm = async (payload: FieldsObject, tableName: string): Promise<ActionResponse> => {  

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

export const updateForm = async (id: string | number, payload: FieldsObject, tableName: string): Promise<ActionResponse> => {  

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

export const updateFormStatus = async (payload: {id: string , status: string}, tableName: string): Promise<ActionResponse> => {

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

export const  deleteForm = async (id:string, tableName: string): Promise<ActionResponse> => {

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

export const getSearchForms = async (searchQuery: SearchData, tableName: string): Promise<any> => {
  try {
    
    let query = supabase.from(tableName).select('*').eq('status', 'archive');

    // Add filters dynamically
    Object.entries(searchQuery).forEach(([key, value]) => {
      if (key === 'created_at') {
        // Handle date filtering for the created_at field
        query = query.gte(key, `${value}T00:00:00`).lt(key, `${value}T23:59:59`);
      } else {
        // Handle other fields
        query = query.ilike(key, `%${value}%`); // Use ilike for partial matches
      }
    });

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching: getSearchForms:', error);
      throw error; // Re-throw the error to be handled by the outer try-catch block
    }
    
    return data;

  } catch (error) {
    console.error('Error in getSearchForms:', error);
    // Handle the error here, e.g., return a default value, throw a custom error, etc.
    return null; 
  }
};