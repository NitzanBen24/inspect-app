'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormField, FieldsObject, ListOption, PdfForm, Technicians } from '../utils/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRef } from 'react';
import { useImageUpload, usePost } from '../hooks/useQuery';
import Modal from './Modal';
import { fieldsNameMap, facillties, appStrings } from '../utils/AppContent';
import { useUser } from '../hooks/useUser';
import SearchableDropdown, { SearchableDropdownHandle } from './SearchableDropdown';
import { useTechnician } from '../hooks/useTechnician';
import { useManufacture } from '../hooks/useManufactures';
import { addInspectionFields, calcPower, formatHebrewDate, generateFormBlocks, isStorageForm } from '../client/utils/formUtil';
import { getHebrewFormName } from '../utils/helper';
import { Spinner } from './Spinner';
import AttachFile from './AttachFile';




interface Props {
    form: PdfForm,
    close: () => void,
}

const Form = ({ form, close }: Props) => {
    //console.log('Form.render=>')
    const { user } = useUser();
    const { technicians } = useTechnician();
    const { manufactures } = useManufacture();
    
    const providers = [...new Set(technicians.map((item: Technicians) => item.employer))];
    
    const [ images, setImages ] = useState<File[] | string[]>([]);
    const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);            
    const [ provider, setProvider ] = useState<string | boolean>(false);     
    const [ message, setMessage ] = useState<string>('');
    const [ isLoading, setLoading ] = useState<boolean>(false);
    
    const sendMail = useRef(false);
    const hasStorageForm = useRef<boolean>(false);
    const formRef = useRef<HTMLDivElement | null>(null); 
    const formBlocks = generateFormBlocks(form.formFields);// todo check if useMemo is helpful here

    const sendRef = useRef<HTMLInputElement | null>(null);        
    const dropdownRefs = useRef<SearchableDropdownHandle[]>([]);// Array of DropDown lists refs
    const attachmentsRef = useRef<{ clear: () => void } | null>(null);

    //Ensures the refs are added to the dropdownRefs array when the component is mounted.
    const registerRef = (ref: SearchableDropdownHandle | null) => {
        if (ref) {
          dropdownRefs.current.push(ref);
        }
    };    

    useEffect(() => {
        // check if storage form 
        if (form.name === 'inspection' && isStorageForm(form.formFields)) {            
            toggleStorageFields();            
        }

        let isProvider = provider;
        // fill existing data of the form, if exists => edit action
        formRef.current?.querySelectorAll<HTMLElement>('.form-field').forEach((item) => {                 
            if (item instanceof HTMLInputElement || item instanceof HTMLTextAreaElement) {                               
                const inputField = form.formFields.find((field) => field.name === item.name)                  
                item.value =  inputField?.value || ''; // Clear the value for input and textarea
                
                if (item.name === 'provider' && item.value) {
                    isProvider = item.value;
                }                
            }   
        });     

        if (isProvider) setProvider(isProvider);        
        
    }, [form.formFields])    

    const handleSubmitSuccess = (res: any) => {            
        if (form.status === 'sent') {
            form.status = 'send';
            sendMail.current = true;
            submitForm(form);
        } else {
            setLoading(false);
            clearAttchedFiles();
            cleanForm();
            setMessage(res.message); 
            openModal();        
        }
    }
    const handleSubmitError = (error: any) => {
        setLoading(false);
        setMessage(error.response?.data?.message || "Error in saving data!");
        openModal();        
    }    
    const { mutate: formSubmit, isPending } = usePost(
        'forms',
        ['formRecords'],
        handleSubmitSuccess,
        handleSubmitError
    );

    // todo: Handle error
    const handleUploadError = (error: any) => {
        console.error('Error uploading images: ', error);
    }
    const handleUploadSuccess = (res: any) => {             
        attachImagesSorce(res);
        submitForm(form);
    }
    const { mutate: uploadImages } = useImageUpload(
        'upload', 
        'images', 
        handleUploadSuccess,
        handleUploadError,        
    );

    const attachImagesSorce = (data: any) => {
        //todo: add error method to component => stop proccess and pop up modal with the error message
        if(!data.folderName) {
            return;
        }
        form.images = data.folderName;
    }

    const goBack = () => close();

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

        form.formFields.forEach((item) => {            
            delete item.value;            
        });
        
        //inspections form only
        if (form.name === 'inspection') {// || form.name === 'בדיקה'
            const fieldsToRemove = ['reciver','status'];
            form.formFields = form.formFields.filter((item) => !fieldsToRemove.includes(item.name));    
        }        
        
        form.status = 'new';
        delete form.id;         

        /**
         * check the array of refs, why so many
         */
        handleClearDropdowns();// Clear all DropDowns
    }

    const updateFormStatus = (btnId: string) => {
        
        if (btnId === 'BtnSave') {       
            form.status = 'saved';        
        }

        if (btnId === 'BtnSend') {         
            if (user.role === 'admin' || user.role === 'supervisor') {
                form.status = 'sent';                
            } else {
                form.status = 'pending';
            }            
        }
    }

    const prepareToSend = () => { 

        if (form.name === 'inspection') {

            const newFields = addInspectionFields(form.formFields, formRef);    
            setFields(newFields);

            const ppower = calcPower(formRef.current);
            if (ppower) {
                setFields([{['ppower']: ppower.toString()}]);
            }

            // Inspections result
            let statusVal = formRef.current?.querySelector<HTMLInputElement>('[name="status"]:checked')?.value;
            if (statusVal) {
                form.formFields.push({
                    name: 'status',
                    type: 'TextArea',
                    require:false,
                    value:statusVal,
                })
            } 
        }
        
        setDate();        

        // Alpha version => Testing        
        const sendToMe = sendRef.current?.querySelector<HTMLInputElement>('[name="reciver"]');    
        if (sendToMe && sendToMe.checked) {            
            form.formFields.push({
                name: 'reciver',
                type: 'TextArea',
                require:false,                 
            });
        }       
        
    }
    
    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {            
        
        if (!event.currentTarget.id) {
            console.error('Error can not submit Form!!')
            setMessage('Something went wrong, can not submit Form!!');
            openModal()
        }
        
        setLoading(true);
        
        updateFormStatus(event.currentTarget.id);
        
        prepareToSend();

        fillFormFields();
    
        if (images.length > 0) {            
            uploadImages({
                images: images as File[],                
                userId: user?.id
            });
        } else {                        
            submitForm(form);
        }
    };

    const fillFormFields = () => {
        const fieldsCollection = formRef.current?.getElementsByClassName('form-field');
        if (fieldsCollection) {
            [...fieldsCollection].forEach(field => {
                const inputField = field as HTMLInputElement | HTMLTextAreaElement;                  
                const fieldName = inputField.getAttribute('name'); // Get the name attribute                
                const fieldValue = inputField.value;
                if (fieldName) {                                        
                    const currFiled = form.formFields.find((item) => item.name === fieldName);
                    if (currFiled) {
                        currFiled.value = fieldValue;
                    }                    
                }                 
            });
        }
    }

    const submitForm = (submissionForm: PdfForm) => {        
        formSubmit({
            userId: submissionForm.userId || user.id, 
            userName: submissionForm.userName || user.name,
            role: user.role,
            form: submissionForm, 
            sendMail: sendMail.current, 
            hasStorageForm,
            action: 'submit',
        });
    }

    const setFields = useCallback((fields: FieldsObject[]) => {
        fields.forEach(item => {
            const [key, value] = Object.entries(item)[0];
            const field = form.formFields.find(f => f.name === key);
            if (field) field.value = value;
        });        
    }, [form.formFields]);
    
    const toggleStorageFields = () => {
                        
        const storageElement: any = formRef.current?.querySelector('.storage');
        
        if (storageElement) {
            const currentDisplay = storageElement.style.display;
            // Toggle the display property
            if (currentDisplay === 'block') {
                hasStorageForm.current = false;
                storageElement.setAttribute('style', 'display:none');
            } else {
                hasStorageForm.current = true;
                storageElement.setAttribute('style', 'display:block');
            }
        }
    };
    

    // Renders
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
    
     // Clear all DropDwons
    const handleClearDropdowns = () => {
        dropdownRefs.current.forEach((ref) => ref.clear());
    };


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
        
        const listOptions = field.type === 'DropDown' ? getListOptions(field.name.replace("-ls", "")) : [];
        
        const renderField = () => {
            if (field.type === 'DropDown') {
                return (
                    <SearchableDropdown ref={registerRef} options={listOptions} fieldName={field.name}  text="חפש" value={field.value || ''} onValueChange={handleListChange} />                
                );
            }
            if (field.type === 'TextArea') {
                return (
                    <textarea className="form-field mt-1 w-full border border-gray-300 rounded-lg shadow-sm" key={field.name} name={field.name} rows={3} disabled={isPending} required/>
                );
            }
            return (
                <input className="form-field mt-1 w-full border border-gray-300 rounded-lg shadow-sm" type="text" key={field.name} name={field.name} disabled={isPending} required />
            );
        };

        // Return the complete JSX block
        return (
            <div key={`field-${field.name}`} className="form-item my-2 flex">
                <label className="block content-center text-sm min-w-20 font-medium text-black">
                    {fieldsNameMap[field.name.replace("-ls", '')]}:
                </label>               
                {renderField()}
                {/* Consider move this from here */}
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
            if (!block.fields || block.fields.length === 0) return null;
            
            return (    
                
                <div key={`block-${index}`}>
                    
                    {form.name === 'inspection' && block.name === 'storage' && (
                        <label key={'storage-lable'} onClick={toggleStorageFields} className="storage-toggle flex pt-2 content-center text-gray-400 text-sm min-w-10 py-auto font-medium ">
                            טופס אגירה:
                            {/* <svg className="-mr-1 size-5 text-gray-400 " viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                            </svg>     */}
                        </label>                                        
                    )}  
                    
                    { (<div key={`block-${index}-in`} className={`form-block py-2 border-b-2 border-slate-800 ${block.name}`}>
                        {block.fields.map(field => (
                            addField(field)
                        ))}                    
                    </div>) }

                </div>
            );
        });
    }, [formBlocks, fieldsNameMap, form.formFields]);
    
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // AttachFile methods
    const updateImages = (files: File[]) => {   
        setImages(files)
    }

    const clearAttchedFiles = () => {
        attachmentsRef.current?.clear();
        delete form.images;
        setImages([]);
    }

    return (
        <>        
        
        <div className='mx-auto p-2'  key={form.name+'.form'}>
            <div className='form-head flex'>
                <div className='p-2'>            
                    <FontAwesomeIcon icon={faArrowLeft} onClick={goBack} />
                </div>
                <h2 className='text-2xl font-bold flex-grow text-right text-gray-800'>{'טופס ' + getHebrewFormName(form.name) }</h2>
            </div>            
            <div ref={ formRef } className='form-body my-2'>                   
                { renderBlocks }  
                
                {form.name === 'inspection' && <div className='flex status-wrap mt-3'>
                    <label className='block text-sm min-w-20 content-center font-medium text-black'>תוצאה:</label>
                    <div className='flex items-center'>
                        <label className='block text-sm content-center font-medium text-black' htmlFor="status-complete">עבר:</label>
                        <input className='mx-2' type="radio" name='status' value="complete" defaultChecked={true} id='status-complete' />
                        <label className='block text-sm content-center font-medium text-black' htmlFor="status-complete">לא עבר:</label>
                        <input className='mx-2' type="radio" name='status' value="incomplete" id='status-incomplete' />
                    </div>                    
                </div>}

            </div>

            {isLoading && <Spinner />}

            <button id='BtnSend' className='w-full border-2 border-black text-blck px-4 mt-3 py-2 rounded-lg' type="button" onClick={handleClick} disabled={isPending}>
                שלח
            </button>
            <button id='BtnSave' className='w-full border-2 border-black text-blck px-4 mt-3 py-2 rounded-lg' type="button" onClick={handleClick} disabled={isPending}>
                שמור
            </button>
            
            {form.images ? <div className='py-2 text-right text-green-500'>{appStrings.attchmentsExists}</div>  : <AttachFile ref={attachmentsRef} updateFiles={updateImages}/>}                    
            
            {/* Alpha version => Testing */}
            <div ref={ sendRef } className='staging-send flex mt-5'>
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

