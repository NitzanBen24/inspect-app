'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { FieldsObject, PdfForm } from '../utils/types';
import { useTechnician } from '../hooks/useTechnician';
import { useDelete, usePatch, usePost } from '../hooks/useQuery';
import { useUser } from '../hooks/useUser';
import { AxiosError } from 'axios';
import Modal from './Modal';


interface Props {
  forms: PdfForm[];
  addFilter: boolean;
  title: string;
  openForm: (form:PdfForm) => void;
}

const setHebrewTitle = (title: string): string => {
  const options: Record<string, string> = 
    {
      saved: 'שמורים',
      pending: 'מחכים לחיוב',
      sent: 'נשלחו לחיוב'
    }
  

  return options[title] || 'בחר טופס';
}

const FormsList = ({ forms, openForm, title, addFilter }: Props) => {  

  const { user } = useUser();
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
    'data',
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

  const { mutate: deleteForm } = useDelete<{ id: string }>(
      'forms', // API path
      'data', // Query key for invalidation
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
          deleteForm({ id: formId });
      }

      if (form.status === 'sent') {
        updateForm({ id: formId, status: 'archive' });
      }
      event.stopPropagation();
  };


  const handleClick = (form: PdfForm) => {
    openForm(form);
  }

  const openModal = () => setIsModalOpen(true);
    const closeModal = () => { 
        setIsModalOpen(false);
    }

  return (
      <>
      {forms.length > 0 && <div className='form-list p-2 mb-3'>
          <h2 className='text-lg'>{setHebrewTitle(title)}:</h2>          
          <ul className='p-0 flex flex-col-reverse'>           
            {forms.map((form) => (
              <li
              className='form-list-item grid grid-cols-6 gap-3 place-items-center border-gray-400 border mb-1 rounded-md'
              key={form.name+form?.id}
              onClick={() => handleClick(form)}
              >   
                  
                  <span>{form.name}</span>
                  <span>{form.formFields.find((item) => item.name === 'customer')?.value || ''}</span>
                  <span>{form.formFields.find((item) => item.name === 'provider')?.value || ''}</span>
                  <span>{form?.userName}</span>                  
                  <span>{typeof form?.created === 'string' ? form.created.slice(0, 10) : ''}</span> {/* Safe check */}
  
                  {(form.status !== 'new' && form.status !== 'pending') && <button className='btn-remove px-1 my-2 border-2 border-white bg-black text-white rounded-lg' onClick={(event) => removeForm(event, form)}>הסר</button> }
              </li>
            ))}
             {addFilter && <li
            className='form-list-item grid grid-cols-6 gap-3 place-items-center mb-2'
            key={setHebrewTitle(title)}
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