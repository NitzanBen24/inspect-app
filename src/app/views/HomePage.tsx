import { useFetch, useMultiFetch } from "../hooks/useQuery";
import FormsList from "../components/FormsList";
import Form from "../components/Form";
import { PdfForm, Manufacture, Technicians, FieldsObject, FormField, FormListObject } from "../utils/types";
import { useEffect, useMemo, useState } from "react";
import { useTechnician } from "../hooks/useTechnician";
import { useManufacture } from "../hooks/useManufactures";
import { useUser } from "../hooks/useUser";


const sortRecords = (records: PdfForm[], id: string, role: string) => {

    const sortedRecords: any = [                
        { saved: records.filter((item: any) => item.status === 'saved' && item.userId === id.toString()) },
    ]

    if (role === 'admin') {
        sortedRecords.push({ pending: records.filter((item: any) => item.status === 'pending') });  
        /** option for a list of form that send to customer from Sofi ************** */
        // sortedRecords.push({ sent: records.filter((item: any) => item.status === 'sent') });
    } 

    return sortedRecords;
}


const HomePage = () => {
    const { user } = useUser();
    const { techniciansSet,technicians } = useTechnician(); // Access technicians and shuffle function
    const { manufacturesSet } = useManufacture();
    const [form, setForm] = useState<PdfForm | undefined>();
    
    const { isLoading, isError, data } = useMultiFetch<[{ pdfFiles: PdfForm[], records: PdfForm[] }, Manufacture[], Technicians[], FieldsObject[]]>([
        { key: "data", path: "forms" },//
        { key: "manufactures", path: "get-data/manufactures" },
        { key: "technicians", path: "get-data/technicians" },
      ]);

    /// Destructure the response or provide defaults to avoid runtime errors
    const [forms, allManufactures, allTechnicians] = (data ?? [{ pdfFiles: [], records: [] }, [], [], []]) as [
        { pdfFiles: PdfForm[]; records: PdfForm[] },
        Manufacture[],
        Technicians[],
        FieldsObject[]
    ];

     // Update technicians and manufactures context when data is successfully fetched
    useEffect(() => {        
        if (!isLoading && !isError && allManufactures) {
            manufacturesSet(allManufactures as Manufacture[]); // Update manufacture context
        }
        if (!isLoading && !isError && allTechnicians) {
            techniciansSet(allTechnicians as Technicians[]); // Update technician context
        }
    }, [isLoading, isError, allManufactures, allTechnicians, manufacturesSet, techniciansSet, forms, form]);


    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading data.</div>;
    if (!forms) return <div>Missing forms</div>        

    const selectForm = (cform: PdfForm) => {      
        setForm(cform);
    };
  
    const closeForm = () => {        
        setForm(undefined);
    }
    
    const recordsPermited = sortRecords(forms.records, user.id.toString(), user.role);   

    return (
      <>
        {form ? (
          <Form
            close={closeForm}
            form={form} 
          />
        ) : (
          <>          
          {(
              <>
                <FormsList openForm={selectForm} title="בחר טופס" addFilter={false} forms={forms.pdfFiles as PdfForm[]} />
                {recordsPermited && 
                    recordsPermited.map((list: any, index: number) => {
                        return Object.keys(list).map((key) => (
                            <FormsList 
                                key={`${index}-${key}`}
                                openForm={selectForm} 
                                title={key}
                                addFilter={true} 
                                forms={list[key] as PdfForm[]} 
                            />
                            ))                    
                        })}               
              </>
            )}            
          </>
        )}
      </>
    );
  };
  
  export default HomePage;

  

  

  
