'use client';
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { pdfForm } from '../models/models';

interface Props {
  list: pdfForm[];
  open: (form:pdfForm) => void
}

const FormsList = ({ list, open }: Props) => {

  console.log('FormList=>', list)
  if (!list.length) {
    return <><div>שגיאה! חסר תוכן</div></>
  }

  const handleClick = (form: pdfForm) => {
    open(form);
  }

  return (
      <>
      <div className='p-2'>
          <h2 className='text-2xl text-right'>:בחר טופס</h2>
          {/* <p className='text-sm text-right'>:בחר טופס</p> */}
          <ul className='list-group text-right'>
            {list.map((form) => (
              <li
              className='list-group-item'
              key={form.name}
              onClick={() => handleClick(form)}
              >
                    {form.name}
              </li>
            ))}
          </ul>
      </div>
      </>
  )
}

export default FormsList