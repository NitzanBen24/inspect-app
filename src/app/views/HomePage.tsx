import { useFetch, useMultiFetch } from "../hooks/useQuery";
import FormsList from "../components/FormsList";
import Form from "../components/Form";
import { PdfForm, Manufacture, Technicians, FieldsObject } from "../utils/types";
import { useEffect, useMemo, useState } from "react";
import { useTechnician } from "../hooks/useTechnician";
import { useManufacture } from "../hooks/useManufactures";
import { useUser } from "../hooks/useUser";

const RenderFormsLists = ({ records, selectForm }: { records: any[]; selectForm: (form: PdfForm) => void }) => {
  return (
    <>
      {records.map((list, index) =>
        Object.keys(list).map((key) => {
          const forms = list[key] as PdfForm[];
          if (forms.length === 0) return null;

          return (
            <FormsList
              key={`${index}-${key}`}
              openForm={selectForm}
              title={key}
              addFilter={true}
              forms={forms}
            />
          );
        })
      )}
    </>
  );
};

const HomePage = () => {
  const { user } = useUser();
  const { techniciansSet } = useTechnician();
  const { manufacturesSet } = useManufacture();
  const [form, setForm] = useState<PdfForm | undefined>();

  const { isLoading, isError, data } = useMultiFetch<[{ pdfFiles: PdfForm[]; activeForms: PdfForm[] }, Manufacture[], Technicians[], FieldsObject[]]>([
    { key: "data", path: `forms/${user.id}` },
    { key: "manufactures", path: "get-data/manufactures" },
    { key: "technicians", path: "get-data/technicians" },
  ]);

  const [forms, allManufactures, allTechnicians] = (data ?? [{ pdfFiles: [], activeForms: [] }, [], []]) as [
    { pdfFiles: PdfForm[]; activeForms: PdfForm[] },
    Manufacture[],
    Technicians[]
  ];
  
  useEffect(() => {
    if (!isLoading && !isError) {
      if (allManufactures) manufacturesSet(allManufactures);
      if (allTechnicians) techniciansSet(allTechnicians);
    }
  }, [isLoading, isError, allManufactures, allTechnicians, manufacturesSet, techniciansSet]);

  const selectForm = (cform: PdfForm) => setForm(cform);
  const closeForm = () => setForm(undefined);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data.</div>;

  const sortedRecords: any = [
      { files: forms.pdfFiles.filter((item) => item.name !== 'storage')},
      { saved: forms.activeForms.filter((item) => item.status === "saved" && item.userId === user.id.toString()) },
      { pending: forms.activeForms.filter((item) => item.status === "pending") },
      { sent: forms.activeForms.filter((item) => item.status === "sent") }
  ];  
  
  return (
    <>
      {form ? (
        <Form close={closeForm} form={form} />
      ) : (        
        <RenderFormsLists records={sortedRecords} selectForm={selectForm} />        
      )}
    </>
  );
};

export default HomePage;

