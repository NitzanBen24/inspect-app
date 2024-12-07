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




/**
 * Consider move this methods to a differtent folder and place
 */
export const formToFields = (data:{payload: PdfForm, userId: string,userName: string, status: string}): FieldsObject[] => {  

  const queryData: FieldsObject = data.payload.formFields.filter((field) => field.require === true).reduce((obj:any, field) => {
    let fieldName  = field.name.includes("-ls") ? field.name.replace("-ls", "") : field.name;
    obj[fieldName] = field.value || ''; 
    return obj;
  }, {});

  
  queryData.name     = data.payload.name;
  queryData.userid   = data.userId;
  queryData.userName = data.userName;
  queryData.status   = data.status;

  return [queryData];

}

export const fieldsToForm = (records: FieldsObject[], form: PdfForm): PdfForm[] => {
  return records.map((record) => {

    if (!form) {
      return {
        name: record.name,
        formFields: [],
        status: 'unknown',
        id: record.id,
      };
    }

    const formFields: FormField[] = form.formFields.map((formField) => { 
      const recordFieldValue = record[formField.name.replace('-ls','')];         
      return {
        ...formField,
        value: recordFieldValue || '', // Default to empty string if no value in the record
      };
    });
    
    return {
      name: form.name,
      formFields: formFields,
      status: record.status,
      id: record.id,
      userId: record.userid,
      userName: record.userName,
      created: record.created_at,
    };
  });
};

