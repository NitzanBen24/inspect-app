'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { FieldsObject, PdfForm } from '../utils/types';
import { useTechnician } from '../hooks/useTechnician';

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

  const handleClick = (form: PdfForm) => {
    openForm(form);
  }

  return (
      <>
      {forms.length > 0 && <div className='form-list p-2 mb-3'>
          <h2 className='text-lg'>{setHebrewTitle(title)}:</h2>          
          <ul className='p-0'>
            {addFilter && <li
            className='form-list-item grid grid-cols-5 gap-4 mb-2'
            key={setHebrewTitle(title)}
            >
              <span>שם טופס:</span>
              <span>לקוח:</span>
              <span>ספק:</span>
              <span>בודק:</span>
              <span>תאריך:</span>
            </li>}
            {forms.map((form) => (
              <li
              className='form-list-item grid grid-cols-5 gap-4 border-gray-400 border mb-1 rounded-md'
              key={form.name+form?.id}
              onClick={() => handleClick(form)}
              >                
                  <span>{form.name}</span>
                  <span>{form.formFields.find((item) => item.name === 'customer')?.value || ''}</span>
                  <span>{form.formFields.find((item) => item.name === 'provider')?.value || ''}</span>
                  <span>{form?.userName}</span>
                  {/* <span>{form?.created.slice(0, 10) || 'No Date'}</span> */}
                  <span>{typeof form?.created === 'string' ? form.created.slice(0, 10) : ''}</span> {/* Safe check */}
  
                  
              </li>
            ))}
          </ul>
      </div>}
      </>
  )
}

export default FormsList