'use client';
import FormsList from "../components/FormsList";
import { Manufacture, PdfForm, Technicians } from "../utils/types";
import { useState } from "react";
import Form from "../components/Form";
import { useFetch } from "../hooks/useQuery";


const HomePage = () => {
  
  const [form, setForm] = useState<PdfForm | undefined>();
  
  const { 
    data: forms, 
    isLoading: loadingForms, 
    isError: errorForms, 
    isSuccess: successForms 
  } = useFetch<PdfForm[]>('forms','pdf-forms');
  const { 
    data: manufactures, 
    isLoading: loadingManufactures, 
    isError: errorManufactures, 
    isSuccess: successManu 
  } = useFetch<Manufacture[]>(
    'manufactures',
    'get-data/manufactures',
    {
      enabled: successForms, 
    }
  );
  const { 
    data: technicians, 
    isLoading: loadingTechnicians, 
    isError: errorTechnicians, 
    isSuccess: successTech 
  } = useFetch<Technicians[]>(
    'technicians',
    'get-data/technicians',
    {
      enabled: successForms && !!manufactures,
    }
  )

  const isLoading = loadingForms  || loadingManufactures || loadingTechnicians;
  const isError = errorForms || errorManufactures || errorTechnicians;

  if (isLoading) {
    return <div>Loading..</div>
  }

  if (isError) {
    return (
      <div>
        <p>Error no data.</p>
      </div>
    );
  }
  

  if (!manufactures?.length || !technicians?.length) {
    return <div>no content..</div>
  }

  const openForm = (cform: PdfForm) => setForm(cform);

  const closeForm = () => setForm(undefined)


  return (
    <>      
      
      {form? <Form close={ closeForm } file={ form } manufactures={ manufactures } technicians={ technicians } /> : forms && <FormsList open={ openForm } list={ forms }/>}
    </>
  )
}

export default HomePage
