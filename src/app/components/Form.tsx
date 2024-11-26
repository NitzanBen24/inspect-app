'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormField, FormState, ListOption, Manufacture, PdfForm, Technicians } from '../utils/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRef } from 'react';
import { usePost } from '../hooks/useQuery';
import Modal from './Modal';
import { formMessages, formFieldMap, fieldsNameMap, facillties } from '../utils/AppContent';
import { useUser } from '../hooks/useUser';
import { elementsWithValueExist } from '../utils/helper';
import SearchableDropdown, { SearchableDropdownHandle } from './SearchableDropdown';



interface Props {
  file: PdfForm,
  manufactures: Manufacture[],
  technicians: Technicians[],
  close: () => void,
}

// Utility function to get today's date in the format yyyy month (Hebrew) dd
const formatHebrewDate = () => {
    const monthsHebrew = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    const today = new Date();
    const yy = today.getFullYear().toString(); 

    const mmHText = monthsHebrew[today.getMonth()];
    const dd = today.getDate().toString();
    
    return yy + "  " + mmHText + "  " + dd;
  };

// Calculate power value
const calcPower = (formNode:HTMLDivElement | null): number | false => {
    if (!formNode) return false;
    
    const modelNode = formNode.querySelector<HTMLInputElement>("[name='pmodel']");
    const unitNode = formNode.querySelector<HTMLInputElement>("[name='punits']");

    if (!modelNode || !unitNode) {     
        console.error('Model or Unit field not found');       
        return false;
    }

    const modelValue = parseFloat(modelNode.value);
    const unitValue = parseFloat(unitNode.value);
    const result = (unitValue * modelValue * 0.001).toFixed(2);
    return !isNaN(modelValue) && !isNaN(unitValue) ? parseFloat(result) : false;
    
}


const Form = ({ file, manufactures, technicians , close }: Props) => {

    const { user } = useUser();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);        
    const providers = [...new Set(technicians.map((item: Technicians) => item.employer))];
    const [provider, setProvider] = useState<string | boolean>(false);     
    const [message, setMessage] = useState<string>('');
    const formRef = useRef<HTMLDivElement | null>(null); 
    const formBlocks = Object.entries(formFieldMap).map(([key, value]) => {
        return file.formFields.filter(
            field => value.includes(field.name) && field.require
        );
    });

    const sendRef = useRef<HTMLInputElement | null>(null);        
    const dropdownRefs = useRef<SearchableDropdownHandle[]>([]);// Array of DropDown lists refs

    //Ensures the refs are added to the dropdownRefs array when the component is mounted.
    const registerRef = (ref: SearchableDropdownHandle | null) => {
        if (ref) {
          dropdownRefs.current.push(ref);
        }
    };
    
    //console.log('Form.render=>',file.formFields)
    
    // Clear all DropDwons
    const handleClearDropdowns = () => {
        dropdownRefs.current.forEach((ref) => ref.clear());
    };
  
    const handleSendSuccess = (data: any) => {                         
        setMessage(data.success);         
        cleanForm();
        openModal();
    }
    const handleSendError = (error: unknown) => {        
        setMessage("Error in sending data!");
        openModal();        
    };
    const { mutate:sendForm, isPending } = usePost('pdf-forms',handleSendSuccess, handleSendError);

    // const handleSaveSuccess = (data: any) => {
    //     //console.log('handleSaveSuccess=>', data)
    //     setMessage(data.success); 
    // }
    // const handleSaveError = (error: unknown) => {
    //     //console.log('handleSaveError=>error', error)
    //     setMessage("Error in saving data!");
    //     openModal();        
    // }
    // const { mutate: saveForm } = usePost('records',handleSaveSuccess,handleSaveError)

    const goBack = () => {
        close();
    }

    const handleListChange = useCallback((value: string, name: string, id?: number) => {   

        if (name === 'provider') {
            setProvider(value)
        }        
    
        if (id && (name === 'electrician-ls' || name === 'planner-ls')) setTechniciansDetails(name, value, id);
      },[setProvider]);

    const setTechniciansDetails = (type: string, val: string, id: number ) => {        
        if (!formRef.current) return false; 

        const technician = technicians.find((item) => item.id === id)
        if (technician) {
            let typeChar = type[0];   
            let techInfo = [{[type]: technician.name || ''}, {[typeChar+'email']: technician.email || ''}, {[typeChar+'license']: technician.license || ''}, {[typeChar+'phone']: technician.phone || ''}];            
            setFields(techInfo);
        }                                 
    }

    const setDate = () => setFields([{['date']: formatHebrewDate()}]);

    const cleanForm = () => {        
        if (!formRef.current) {
            goBack();
            return;
        }
                
        formRef.current.querySelectorAll<HTMLElement>('.form-field').forEach((item) => {            
            if (item instanceof HTMLInputElement || item instanceof HTMLTextAreaElement) {                
                item.value = ''; // Clear the value for input and textarea
            } 
            
        });
       
        const fieldsToRemove = ['reciver','status'];
        file.formFields = file.formFields.filter((item) => !fieldsToRemove.includes(item.name));


        file.formFields.forEach((item) => {            
            delete item.value;            
        });        
        
        handleClearDropdowns();// Clear all DropDowns
    }

    const fillFormFields = () => {
        const fieldsCollection = formRef.current?.getElementsByClassName('form-field');
        if (fieldsCollection) {
            [...fieldsCollection].forEach(field => {
                const inputField = field as HTMLInputElement | HTMLTextAreaElement;                  
                const fieldName = inputField.getAttribute('name'); // Get the name attribute                
                const fieldValue = inputField.value;
                if (fieldName) {                                        
                    const currFiled = file.formFields.find((item) => item.name === fieldName);
                    if (currFiled) {
                        currFiled.value = fieldValue;
                    }                    
                }                 
            });
        }

        let newFields = [];

        // If mcurrent & rcurrent are filled add check and scurrent to formFields
        if (elementsWithValueExist(file.formFields,['mcurrent', 'rcurrent'])) {
            newFields.push({['check']: '*'}, {['scurrent']: '300'});             
        }

        //checkVoltage
        if (!elementsWithValueExist(file.formFields,['volt-n', 'volt-l'])) {
            newFields.push({['irrelavent']: '*'}, {['zero']: ''}, {['propper']: ''});            
        } else {
            newFields.push({['propper']: '*'}, {['zero']: '0'});            
        }

        let ocheckNode = formRef.current?.querySelector<HTMLInputElement>('[name="ocheck"]');         
        if (ocheckNode && ocheckNode.checked) {            
            newFields.push({['opass']: 'תקין'});            
        } else {            
            newFields.push({['ofail']: '*'});                  
        }


        // Inspections result
        let statusVal = formRef.current?.querySelector<HTMLInputElement>('[name="status"]:checked')?.value;
        if (statusVal) {
            file.formFields.push({
                name: 'status',
                type: 'TextArea',
                require:false,
                value:statusVal,
            })
        }
        
        setFields(newFields);
    }

    const prepareForm = () => { 

        // Alpha version => Testing        
        const sendToMe = sendRef.current?.querySelector<HTMLInputElement>('[name="reciver"]');    
        if (sendToMe && sendToMe.checked) {            
            file.formFields.push({
                name: 'reciver',
                type: 'TextArea',
                require:false,                 
            });
        }
            
        fillFormFields();

        const ppower = calcPower(formRef.current);
        if (ppower) {
            setFields([{['ppower']: ppower.toString()}]);
        }

        setDate();
        
        return true;
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {            
        
        //const btnId = event.currentTarget.id;
        
        if (!prepareForm()) {
            //** Mark input in red */
            openModal();
            return;
        }         
                
        sendForm(file);    

        // if (btnId === 'BtnSave') {
        //     const payload: FormState = file.formFields.filter((field) => field.require === true).reduce((obj:any, field) => {
        //         obj[field.name] = field.value || ''; 
        //         return obj;
        //     }, {});            

        //     payload.name = file.name;
            
        //     saveForm(file.formFields);

        // }

        // if (btnId === 'BtnSend') {
        //     // Send form data            
        //     sendForm(file);    
        // }
        
    };

    //const send

    const setFields = useCallback((fields: FormState[]) => {
        fields.forEach(item => {
            const [key, value] = Object.entries(item)[0];
            const field = file.formFields.find(f => f.name === key);
            if (field) field.value = value;
        });        
    }, [file.formFields]);
    

    function getListOptions(name: string): string[] | ListOption[] {
        
        const nameToArrayMap: Record<string, string[] | ListOption[]> = {
            provider: providers,
            electrician: technicians.filter((item) => item.profession === 'electrician' && item.employer === provider).map((item) => {
                return {
                    val: item.name,
                    id: item.id
                }
            }),
            planner: technicians.filter((item) => item.profession === 'planner' && item.employer === provider).map((item) => {
                return {
                    val: item.name,
                    id: item.id
                }
            }),
            convertor: manufactures.filter((item) => item.type === 'convertor' ||  item.type === 'both').map((item) => {
                return item.name;
            }),
            panel: manufactures.filter((item) => item.type === 'panel' ||  item.type === 'both').map((item) => {
                return item.name;
            }),
            facillity: facillties,
        };
      
        // Return the array for the given name or an empty array if the name is not found
        return nameToArrayMap[name] || [];
    }
      

    const addField = (field: FormField) => {       
        
        const listOptions = getListOptions(field.name.replace("-ls", ""));        
        // Determine the field node
        const fieldNode = field.type === 'DropDown' ? (            
            <SearchableDropdown ref={registerRef} options={listOptions} fieldName={field.name} text="חפש" onValueChange={handleListChange} />
        ) : field.type === 'TextArea' ? (
            <textarea className="form-field mt-1 w-full border border-gray-300 rounded-lg shadow-sm" key={field.name} name={field.name} rows={3} disabled={isPending} required />
        ) : (
            <input className="form-field mt-1 w-full border border-gray-300 rounded-lg shadow-sm" type="text" key={field.name} name={field.name} disabled={isPending} required />
        );

        // Return the complete JSX block
        return (
            <div key={`field-${field.name}`} className="form-item my-2 flex">
                <label className="block content-center text-sm min-w-20 font-medium text-black">
                    {fieldsNameMap[field.name.replace("-ls", '')]}:
                </label>
                {fieldNode}
                {field.name === 'omega' && (
                    <>
                        <label className="block content-center mr-2 text-sm min-w-10 py-auto font-medium text-black">
                            תקין:
                        </label>
                        <input type="checkbox" name="ocheck" defaultChecked={true} />
                    </>
                )}
            </div>
        );
    };

    // Memoize the rendering of blocks
    const renderBlocks = useMemo(() => {        
        return formBlocks.map((block, index) => {
            // If no fields are found for this block, return null            
            if (block.length === 0) return null;            
            return (
                <div key={`block-${index}`} className='form-block py-2 border-b-2 border-slate-800'>
                    {block.map(field => (
                        addField(field)
                    ))}                    
                </div>
            );
        });
    }, [formBlocks, fieldsNameMap, file.formFields]);
    
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => { 
        setIsModalOpen(false);
    }
    
    return (
        <>        
        
        <div className='mx-auto p-2'  key={file.name+'.form'}>
            <div className='form-head flex'>
                <div className='p-2'>            
                    <FontAwesomeIcon icon={faArrowLeft} onClick={goBack} />
                </div>
                <h2 className='text-2xl font-bold flex-grow text-right text-gray-800'>{'טופס הצהרת בודק' }</h2>
            </div>            
            <div ref={ formRef } className='form-body my-2'>                   
                { renderBlocks }  
                
                <div className='flex status-wrap mt-3'>
                    <label className='block text-sm min-w-20 content-center font-medium text-black'>תוצאה:</label>
                    <div className='flex items-center'>
                        <label className='block text-sm content-center font-medium text-black' htmlFor="status-complete">עבר:</label>
                        <input className='mx-2' type="radio" name='status' value="complete" defaultChecked={true} id='status-complete' />
                        <label className='block text-sm content-center font-medium text-black' htmlFor="status-complete">לא עבר:</label>
                        <input className='mx-2' type="radio" name='status' value="incomplete" id='status-incomplete' />
                    </div>                    
                </div>

            </div>

            <button id='BtnSend' className='w-full border-2 border-black text-blck px-4 mt-3 py-2 rounded-lg' type="button" onClick={handleClick} disabled={isPending}>
                שלח
            </button>
            {/* <button id='BtnSave' className='w-full border-2 border-black text-blck px-4 mt-3 py-2 rounded-lg' type="button" onClick={handleClick} disabled={isPending}>
                שמור
            </button> */}

            {/* Alpha version => Testing */}
            <div ref={ sendRef } className='stagging-send flex mt-5'>
                <label className='mr-2'>Send to me</label>
                <input type="checkbox" name="reciver" defaultChecked={false} id=""/>
            </div>
        </div>

        
        <Modal isOpen={isModalOpen} onClose={closeModal}>
            <h2>This is a modal!</h2>
            <p>{message}</p>
        </Modal>
                    

        </>
        
    );

};

export default Form;
