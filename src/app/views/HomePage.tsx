import { useMultiFetch } from "../hooks/useQuery";
import FormsList from "../components/FormsList";
import Form from "../components/Form";
import { PdfForm, Manufacture, Technicians, FieldsObject, User } from "../utils/types";
import { useEffect, useMemo, useState } from "react";
import { useTechnician } from "../hooks/useTechnician";
import { useManufacture } from "../hooks/useManufactures";
import { useUser } from "../hooks/useUser";
import Archvie from "../components/Archive";
import { useQueryClient } from "@tanstack/react-query";

const RenderFormsLists = ({ records, selectForm }: { records: any[]; selectForm: (form: PdfForm) => void }) => {
  
  return (    
    <>
      {records.map((list, index) =>
        Object.keys(list).map((key) => {
          const forms = list[key] as PdfForm[];          
          const addFilter = key !== 'files';
          const showList = key === 'files' || key === 'pending';
          if (forms.length === 0) return null;
          
          return (
            <FormsList
              key={`${index}-${key}`} openForm={selectForm} title={key} addFilter={addFilter} forms={forms} display={showList} />
          );
        })
      )}
    </>
  );
};

const useHomePageData = (user: User) => {
  const { isLoading, isError, data } = useMultiFetch<[
    { pdfFiles: PdfForm[]; activeForms: PdfForm[] },
    Manufacture[],
    Technicians[],
    FieldsObject[]
  ]>([
    { key: "forms", path: `forms/${user.id}`, user: user },
    { key: "manufactures", path: "get-data/manufactures", user: user },
    { key: "technicians", path: "get-data/technicians", user: user },
  ]);

  const [forms, manufactures, technicians] = (data ?? [{ pdfFiles: [], activeForms: [] }, [], []]) as [
    { pdfFiles: PdfForm[]; activeForms: PdfForm[] },
    Manufacture[],
    Technicians[]
  ];

  return { isLoading, isError, forms, manufactures, technicians };
};

const HomePage = () => {
  const { user } = useUser();
  const { techniciansSet } = useTechnician();
  const { manufacturesSet } = useManufacture();
  const [form, setForm] = useState<PdfForm | undefined>();
  const [initialized, setInitialized] = useState(false);
  const { isLoading, isError, forms, manufactures, technicians } = useHomePageData(user);
  
  useEffect(() => {    
    if (isLoading || isError || initialized) return;
    
    manufacturesSet(manufactures);
    techniciansSet(technicians);
    setInitialized(true);
    
  }, [isLoading, isError, manufactures, technicians, manufacturesSet, techniciansSet, initialized]);

  const selectForm = (cform: PdfForm) => {
    setForm(cform);
  }
  const closeForm = () => setForm(undefined);  


  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data.</div>;

  const sortedRecords = [
    { files: forms.pdfFiles.filter((item) => item.name !== 'storage')},
    { saved: forms.activeForms.filter((item) => item.status === "saved" && item.userId === user.id.toString()) },
    { pending: forms.activeForms.filter((item) => item.status === "pending") },
    { sent: user.role !== 'user' ? forms.activeForms.filter((item) => item.status === "sent") : [] }
  ]; 
  
  // console.log('Home.render=>forms',forms)
  
  return (    
    <div className='main-wrapp my-3'>
      {form ? (
        <Form close={closeForm} form={form} />
      ) : (     
        <>        
          <RenderFormsLists records={sortedRecords} selectForm={selectForm} /> 
          { (user.role !== 'user') && <Archvie selectForm={selectForm}/> }
        </>   
      )}
    </div>        
  );
};

export default HomePage;

