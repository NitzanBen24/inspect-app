'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormField, FormState, Manufacture, PdfForm, Technicians } from '../utils/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRef } from 'react';
import { usePost } from '../hooks/useQuery';
import Modal from './Modal';
import { formMessages, formFieldMap, fieldsNameMap, facillties } from '../utils/AppContent';
import { useUser } from '../hooks/useUser';
import { elementsWithValueExist } from '../utils/helper';



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
    const providers = useMemo(() => { return [...new Set(technicians.map((item: Technicians) => item.employer))]; }, [technicians]);
    const [provider, setProvider] = useState<string | boolean>(false);     
    const [message, setMessage] = useState<string>('');
    const formRef = useRef<HTMLDivElement | null>(null); 
    const formBlocks = useMemo(() => {
        return Object.entries(formFieldMap).map(([key, value]) => {
            // Filter the form fields for the current block
            return file.formFields.filter(
                field => value.includes(field.name) && field.require
            );
        });
    }, [file.formFields, provider]);

    //console.log('Form.render=>', file.formFields)

    const sendRef = useRef<HTMLInputElement | null>(null);        

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

    const setDate = () => setField([{['date']: formatHebrewDate()}]);

    const cleanForm = () => {        
        if (!formRef.current) {
            goBack();
            return;
        }
                
        formRef.current.querySelectorAll<HTMLElement>('.form-field').forEach((item) => {            
            if (item instanceof HTMLInputElement || item instanceof HTMLTextAreaElement) {                
                item.value = ''; // Clear the value for input and textarea
            } else if (item instanceof HTMLSelectElement) {                
                item.selectedIndex = 0; // Reset the selected option to the first option for select
            }
        });

        const providerSelect = formRef.current.querySelector<HTMLSelectElement>('[name="provider"]');
        if (providerSelect) {
            providerSelect.selectedIndex = 0 ;
        }

        // Remove fields to prevent duplication
        const fieldsToRemove = ['comments', 'message', 'provider', 'reciver','status'];
        file.formFields = file.formFields.filter((item) => !fieldsToRemove.includes(item.name));


        file.formFields.forEach((item) => {            
            delete item.value;            
        });                
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

                    if (fieldName === 'comments' || fieldName === 'message') {                        
                        file.formFields.push({
                            name: fieldName,
                            type: 'TextArea',
                            require:true, 
                            value: fieldValue,
                        });
                    }
                }                 
            });
        }         
    }

    const addFormFields = () => {

        let newFields = [];

        // Add provider
        let providerNode = formRef.current?.querySelector<HTMLInputElement>('[name="provider"]');
        let newProviderNode = formRef.current?.querySelector<HTMLInputElement>('[name="new-provider"]');
        let providerVal = newProviderNode?.value || providerNode?.value;

        file.formFields.push({
            name: 'provider',
            type: 'TextArea',
            require: true, 
            value: providerVal,
        });

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


        let statusVal = formRef.current?.querySelector<HTMLInputElement>('[name="status"]:checked')?.value;
        if (statusVal) {
            file.formFields.push({
                name: 'status',
                type: 'TextArea',
                require:false,
                value:statusVal,
            })
        }

        setField(newFields);
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
        
        addFormFields();

        const ppower = calcPower(formRef.current);
        if (ppower) {
            setField([{['ppower']: ppower.toString()}]);
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

    const setField = useCallback((fields: FormState[]) => {
        fields.forEach((item) => {
            Object.entries(item).forEach(([key, value]) => {                
                let field = file.formFields.find((item) => item.name === key)        
                if (field) {        
                    field.value = value;
                }
              });            
        });    
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
                fileNode = <textarea className='p-2 mt-1 h-20 w-full border border-gray-300 rounded-lg shadow-sm' name={field.name} disabled={isPending} ></textarea>
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

    const addProviderFields = () => {
        return (<>
            <div className='form-item my-2 flex'> 
                <label className='block text-sm min-w-20 content-center font-medium text-black'>ספק עבודה:</label>
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
            </div>

            <div className='form-item my-2 flex'> 
                <label className='block text-sm min-w-20 content-center font-medium text-black'>הוסף ספק:</label>
                <input 
                    className='mt-1 w-full border border-gray-300 rounded-lg shadow-sm' 
                    key={'provider.input'} 
                    type="text" 
                    name={'new-provider'}                                
                    disabled={isPending} 
                    required />
            </div>

        </>)
    }

    // Memoize the rendering of blocks
    const renderBlocks = useMemo(() => {
        return formBlocks.map((block, index) => {
            // If no fields are found for this block, return null            
            if (block.length === 0) return null;

            return (
                <div key={`block-${index}`} className='form-block py-2 border-b-2 border-slate-800'>
                    {block.map(field => (
                        <div key={`field-${field.name}`} className='form-item my-2 flex'>                             
                            <label className='block content-center text-sm min-w-20 font-medium text-black'>
                                {fieldsNameMap[field.name.replace('-ls', '')]}:
                            </label>
                            {addField(field)}
                            {field.name === 'omega' && (
                                <>
                                <label className='block content-center mr-2 text-sm min-w-10 py-auto font-medium text-black'>תקין:</label>
                                <input type="checkbox" name='ocheck' defaultChecked={true}/>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            );
        });
    }, [formBlocks, fieldsNameMap]);

    const addTextFields = (fields: [{ name: string, text: string }, { name: string, text: string }]) => {
        return fields.map((field: { name: string, text: string }) => (            
            <div className='form-block' key={'block-' + field.name}>
                <div className='form-item my-2 flex' key={file.name + '.' +field.name}>
                    <label className='block text-sm min-w-20 content-center font-medium text-black'>
                       {field.text}
                    </label>
                    <textarea key={ field.name + '.text'}
                        className='form-field p-2 mt-1 h-20 w-full border border-gray-300 rounded-lg shadow-sm'
                        name={field.name}
                        disabled={isPending}
                    ></textarea>
                </div>
            </div>
        ));
    };
    
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
                <div className='form-block'> 
                    { addProviderFields() }
                </div>
                { renderBlocks }
                { addTextFields([{name: 'comments', text: 'הערות:'}, { name: 'message', text: 'הודעה'}]) }  

                <div className='flex status-wrap mt-3'>
                    <label className='block text-sm min-w-20 content-center font-medium text-black'>תוצאה:</label>
                    <div className='flex items-center'>
                        <label className='block text-sm content-center font-medium text-black' htmlFor="status-complete">תקין:</label>
                        <input className='mx-2' type="radio" name='status' value="complete" defaultChecked={true} id='status-complete' />
                        <label className='block text-sm content-center font-medium text-black' htmlFor="status-complete">לא תקין:</label>
                        <input className='mx-2' type="radio" name='status' value="incomplete" id='status-incomplete' />
                    </div>                    
                </div>


            </div>

            

            <button className='w-full border-2 border-black text-blck px-4 mt-3 py-2 rounded-lg' type="button" onClick={handleClick} disabled={isPending}>
                שלח
            </button>

            {/* Alpha version => Testing */}
            <div ref={ sendRef } className='stagging-send flex'>
                <label>Send to me</label>
                <input type="checkbox" name="reciver" defaultChecked={true} id=""/>
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

