'use client';
import React, { useState } from 'react';
import { PdfForm } from '../utils/types';
import { useDelete, usePatch, usePost } from '../hooks/useQuery';
import { useUser } from '../hooks/useUser';
import { AxiosError } from 'axios';
import Modal from './Modal';
import { isStorageForm, reverseDateDirection } from '../client/utils/formUtil';
import { getHebrewString } from '../utils/helper';
import { ChevronDownIcon } from '@heroicons/react/16/solid';



interface Props {
  forms: PdfForm[];
  addFilter: boolean;
  title: string;
  display: boolean;
  openForm: (form:PdfForm) => void;
}

const FormsList = ({ forms, openForm, title, addFilter, display }: Props) => {

  const { user } = useUser();
  const [ show, setShow ] = useState<boolean>(display);
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);
  const [ message, setMessage ] = useState<string>('');

  const onUpdateSucces = (data: any) => {
    setMessage(data.message); 
    openModal();
  }
  const onUpdateError = (error: any) => {
      setMessage(error.message);
      openModal(); 
  }
  const {mutate: updateForm } = usePatch(
    'forms',    
    ['formRecords'],
    onUpdateSucces,
    onUpdateError,
  )

  const onDeleteSuccess = (data: any) => {
    setMessage(data.message); 
    openModal();
  };
  const onDeleteError = (error: AxiosError) => {
      setMessage(error.message);
      openModal(); 
  };
  const { mutate: deleteForm } = useDelete(
      'forms', // API path
      ['formRecords'],
      onDeleteSuccess,
      onDeleteError
  );

  const removeForm = (event: React.MouseEvent, form: PdfForm) => {
      const formId = form.id?.toString();
      if (!formId) {
        console.error('Form ID is missing!');
        return;
      }
      
      if (form.status === 'saved') {
        deleteForm({ id: formId, formName: form.name });
      }

      if (form.status === 'sent') {
        updateForm({ id: formId, status: 'archive', formName: form.name });
      }
      event.stopPropagation();
  };


  const handleClick = (form: PdfForm) => {
    openForm(form);
  }

  const openModal = () => {
    setIsModalOpen(true);
  }

  const closeModal = () => { 
      setIsModalOpen(false);
  }

  const toggleList = () => {
    setShow(!show)
  }


//console.log('FormList=>',forms)
  
  return (
      <>
      {forms.length > 0 && <div className='form-list border-gray-400 border-bottom py-2 px-4'>
          <h2 className='flex text-lg cursor-pointer' onClick={toggleList}>
            {getHebrewString(title)}
            {/* <ChevronDown />             */}
            {title && <ChevronDownIcon className="size-6"/>}
          </h2>          
          <ul className='p-0 flex flex-col-reverse'>           
          {show && forms.map((form) => {
            const isStorage = isStorageForm(form.formFields); // Check once per form
            return (
              <li
                className={`form-list-item py-1 grid grid-cols-6 gap-3 place-items-center border-gray-400 border mb-1 rounded-md ${
                  isStorage ? "bg-cyan-50" : "bg-white"
                }`}
                key={form.name + form?.id}
                onClick={() => handleClick(form)}
              >
                <span>{getHebrewString(form.name)}</span>
                <span>{form.formFields.find((item) => item.name === "customer")?.value || ""}</span>
                <span>{form.formFields.find((item) => item.name === "provider")?.value || ""}</span>
                <span>{form?.userName}</span>
                <span>{typeof form?.created === "string" ? reverseDateDirection(form.created.slice(0, 10)) : ""}</span>
                <div>                  
                  {form.status !== "new" && form.status !== "pending" && form.status !== 'archive' && (
                    <button
                      className="btn-remove px-1 border-2 border-white bg-black text-white rounded-lg"
                      onClick={(event) => removeForm(event, form)}
                    >
                      הסר
                    </button>
                  )}
                </div>
              </li>
            );
          })}
             {show && addFilter && <li
            className='form-list-item grid grid-cols-6 gap-3 place-items-center mb-2'
            key={getHebrewString(title)}
            >
              <span>שם טופס:</span>
              <span>לקוח:</span>
              <span>ספק:</span>
              <span>בודק:</span>
              <span>תאריך:</span>
            </li>}
          </ul>
      </div>}

      <Modal isOpen={isModalOpen} onClose={closeModal}>
            <h2>This is a modal!</h2>
            <p>{message}</p>
        </Modal>
      </>
  )
}

export default FormsList