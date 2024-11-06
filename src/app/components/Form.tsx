'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormField, FormState, Manufacture, PdfForm, Technicians } from '../models/models';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRef } from 'react';
import { usePost } from '../hooks/useQuery';
import Modal from './Modal';
import { formMessages, formFieldMap, fieldsNameMap, facillties } from '../utils/AppContent';



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

    return !isNaN(modelValue) && !isNaN(unitValue) ? unitValue * modelValue * 0.001 : false;
    
}


const Form = ({ file, manufactures, technicians , close }: Props) => {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);        
    const providers = useMemo(() => { return [...new Set(technicians.map((item: Technicians) => item.employer))]; }, [technicians]);
    const [provider, setProvider] = useState<string | boolean>(false);     
    const[message, setMessage] = useState<string>('');
    const formRef = useRef<HTMLDivElement | null>(null);    
    const formBlocks = useMemo(() => {
        return Object.entries(formFieldMap).map(([key, value]) => {
            // Filter the form fields for the current block
            return file.formFields.filter(
                field => value.includes(field.name) && field.require
            );
        });
    }, [file.formFields, provider]);

    console.log('Form.Render=>',file)

    const handlePostSuccess = (data: any) => {                       
        setMessage(data.success)
        openModal();
    }
    const handlePostError = (error: unknown) => {        
        setMessage("Error in sending data!");
        openModal();        
    };
    const { mutate:sendForm, isPending } = usePost('pdf-forms',handlePostSuccess, handlePostError)

    const goBack = () => {
        close();
    }

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target; 

        if (name === 'provider') setProvider(value);
        if (name === 'electrician-ls' || name === 'planner-ls') setTechniciansDetails(name);
        
    }, [setProvider]);

    const setTechniciansDetails = (type: string) => {        
        if (!formRef.current) return false;        
        
        const selectElement = formRef.current.querySelector<HTMLSelectElement>("[name="+type+"]");        
        if (selectElement) {
            //** get option id to find it in thechnicians, name is not enough */
            const selectedOption = selectElement.options[selectElement.selectedIndex];
            const technician = technicians.find((item) => item.id.toString() === selectedOption.id)            
            if (technician) {
                let typeChar = type[0];   
                let techInfo = [{[typeChar+'email']: technician.email || ''}, {[typeChar+'license']: technician.license || ''}, {[typeChar+'phone']: technician.phone || ''}];
                setField(techInfo);
            }                                 
        }
    }

    const validatePower = () => {
        const ppower = calcPower(formRef.current);        
        if (!ppower) { //** Mark input in red */  
            setMessage(message + formMessages['missingPower']);      
            return false;
        }
        // Add power value to the field if valid       
        setField([{['ppower']: ppower.toString()}])
        return true;
    }

    const setDate = () => setField([{['date']: formatHebrewDate()}]);

    const insertUserData = () => {
        const fieldsCollection = formRef.current?.getElementsByClassName('form-field')
        if (fieldsCollection) {
            [...fieldsCollection].forEach(field => {
                const inputField = field as HTMLInputElement | HTMLTextAreaElement;                  
                const fieldName = inputField.getAttribute('name'); // Get the name attribute                
                const fieldValue = inputField.value;
                if (fieldName) {                                        
                    let currFiled = file.formFields.find((item) => item.name === fieldName);
                    if (currFiled) {
                        currFiled.value = fieldValue;

                        // Alpha version => force '*' in field, until we change form input to checkbocx in cliet side ****************
                        if (fieldName === 'check' && fieldValue.length > 0) {
                            currFiled.value = '*'
                        }

                    }

                    if (fieldName === 'comments') {
                        file.formFields.push({
                            name: 'comments',
                            type: 'TextArea',
                            require:true, 
                            value: fieldValue,
                        });
                    }

                    
                }                 
            });
        }
        
    }

    const prepareForm = () => { 

        insertUserData();
       
        if (!validatePower()) {
            openModal();
            return false;
        }
        setDate();
        return true;
    }

    const handleClick = () => {            
        if (!prepareForm()) {
            //** Mark input in red */
            openModal();
            return;
        }        
        // Send form data        
        sendForm(file);
    };   

    //const setField = useCallback((name: string, val: string) => {
    const setField = useCallback((fields: FormState[]) => {
        fields.map((item) => {            
            Object.entries(item).forEach(([key, value]) => {                
                let field = file.formFields.find((item) => item.name === key)        
                if (field) {        
                    field.value = value;
                }
              });
            
        })        
    }, [file.formFields]);

    const addField = (field: FormField) => {        
        let fileNode = null;
        //Dropdown
        if (field.name.includes('-ls')) {
            fileNode = <select 
                            className='form-field mt-1 w-full border border-gray-300 rounded-lg shadow-sm' 
                            key={field.name} 
                            name={field.name} 
                            onChange={handleChange} 
                            disabled={isPending} 
                            required>     
                            <option value="">בחר</option>
                            {addOptionsToSelect(field.name)}
                        </select>;
        } else {// Textfield    
            if (field.name === 'notes') {
                fileNode = <textarea className='text-right p-2 mt-1 h-20 w-full border border-gray-300 rounded-lg shadow-sm' name={field.name} disabled={isPending} ></textarea>
            } else {                    
                fileNode =  <input 
                                className='form-field mt-1 w-full border border-gray-300 rounded-lg shadow-sm' 
                                key={field.name} 
                                type="text" 
                                name={field.name}                                
                                disabled={isPending} 
                                required />;
            }
        }                
        return fileNode;
    }

    /**
         * Refactor!!!!!!
         */ 
    const addOptionsToSelect = (fieldName: string) => {
            
        switch (fieldName) {            
            case 'electrician-ls':
                return technicians.filter((item) => item.profession === 'electrician' && item.employer === provider).map((item) => {
                    return <option id={item.id.toString()} key={item.name+'.opt'} value={ item.name }>{ item.name }</option>
                });
            case 'planner-ls':
                return technicians.filter((item) => item.profession === 'planner' && item.employer === provider).map((item) => {
                    return <option id={item.id.toString()} key={item.name+'.opt'} value={ item.name }>{ item.name }</option>
                });
            case 'convertor-ls':
                return manufactures.filter((item) => item.type === 'convertor' ||  item.type === 'both').map((item) => {
                    return <option key={item.name+'.opt'} value={ item.name }>{ item.name }</option>
                });
            case 'panel-ls':
                return manufactures.filter((item) => item.type === 'panel' ||  item.type === 'both').map((item) => {
                    return <option key={item.name+'.opt'} value={ item.name }>{ item.name }</option>
                });    
            case 'facillity-ls':
                return facillties.map((item) => {
                    return <option key={item+'.opt'} value={ item }>{ item }</option>
                });
        }

        return false;
    }

    const addSelectProvider = () => {
        return (<>
            <div className='form-item my-2 text-right flex' >            
                <select 
                    className='mt-1 w-full border border-gray-300 rounded-lg shadow-sm' 
                    key={'providers.select'} 
                    name={'provider'} 
                    onChange={handleChange} 
                    disabled={isPending} 
                    required>
                    <option key={ 'prov.val' } value={ 'בחר ספק' }>{ 'בחר ספק' }</option>     
                    {providers.map((item) => (
                        <option key={ item + '.val' } value={ item }>{ item }</option>
                    ))}
                </select>
                <label className='block text-sm min-w-20 content-center text-right font-medium text-black'>:ספק עבודה</label>
            </div>
        </>)
    }

    // Memoize the rendering of blocks
    const renderBlocks = useMemo(() => {
        return formBlocks.map((block, index) => {
            // If no fields are found for this block, return null            
            if (block.length === 0) return null;

            return (
                <div key={`block-${index}`} className='form-block py-2 text-right border-b-2 border-slate-800'>
                    {block.map(field => (
                        <div key={`field-${field.name}`} className='form-item my-2 flex'>
                            {addField(field)} {/* Assuming addField is defined elsewhere */}
                            <label className='block text-sm min-w-20 text-right font-medium text-black'>
                                :{fieldsNameMap[field.name.replace('-ls', '')]}
                            </label>
                        </div>
                    ))}
                </div>
            );
        });
    }, [formBlocks, fieldsNameMap]);
    
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => { 
        setIsModalOpen(false);
    }

    return (
        <>
        <div className='p-2'>            
            <FontAwesomeIcon icon={faArrowLeft} onClick={goBack} />
        </div>
        
        <div className='mx-auto p-2'  key={file.name+'.form'}>
            <h2 className='text-2xl font-bold text-center text-gray-800'>{'טופס הצהרת בודק' }</h2>                              
            <div ref={ formRef } className='form-body my-2'>   
                <div className='form-block text-right'> 
                    { addSelectProvider() }
                </div>
                { renderBlocks }
                {/** change comments to notes => notes comes requierd from server */}
                <div className='form-block text-right'>
                    <div className='form-item my-2 flex' key={file.name+'.comments'}>                    
                        <textarea className='form-field text-right p-2 mt-1 h-20 w-full border border-gray-300 rounded-lg shadow-sm' name="comments" disabled={isPending} ></textarea>
                        <label className='block text-sm min-w-20 content-center text-right font-medium text-black'>:הערות</label>                   
                    </div>
                </div>                
            </div>
            <button className='w-full border-2 border-black text-blck px-4 mt-3 py-2 rounded-lg' type="button" onClick={handleClick} disabled={isPending}>
                שלח
            </button>
        </div>

        
        <Modal isOpen={isModalOpen} onClose={closeModal}>
            <h2>This is a modal!</h2>
            <p>{message}</p>
        </Modal>
                    

        </>
        
    );

};

export default Form;

// // Outside the component
// const renderBlock = (block: FormField[], fieldsNameMap: any) => {
//     if (block.length === 0) return null;

//     return (
//         <div className='form-block py-2 text-right border-b-2 border-slate-800'>
//             {block.map((field) => (
//                 <div key={`field-${field.name}`} className='form-item my-2 flex'>
//                     {/* {addField(field)} */}
//                     <label className='block text-sm min-w-20 text-right font-medium text-black'>
//                         :{fieldsNameMap[field.name.replace('-ls', '')]}
//                     </label>
//                 </div>
//             ))}
//         </div>
//     );
// };


// const fillFormFields = useCallback(() => {   
//     file.formFields.map((item) => {            
//         if (formData.hasOwnProperty(item.name) && formData[item.name]) {                
//             item.value = formData[item.name];
//         }            
//     });

//     file.formFields.push({
//         name: 'comments',
//         type: 'TextArea',
//         require:true, 
//         value: formData['comments']
//     });

// }, [file.formFields]);