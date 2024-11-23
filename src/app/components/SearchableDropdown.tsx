import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { ListOption } from '../utils/types';

interface Props {
  options: string[] | ListOption[];
  fieldName: string;
  text: string;
  onValueChange: (value: string, name: string, id?: number) => void;
}

export interface SearchableDropdownHandle {
  clear: () => void;
}

const SearchableDropdown = forwardRef<SearchableDropdownHandle, Props>(
  ({ options, fieldName, text, onValueChange }: Props, ref) => {
    const [query, setQuery] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<ListOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const normalizedOptions: ListOption[] = Array.isArray(options)
      ? options.map((option) =>
          typeof option === 'string' ? { val: option } : option
        )
      : [];

    const filterOptions = (input: string) => {
      return normalizedOptions.filter((option) =>
        option.val.toLowerCase().includes(input.toLowerCase())
      );
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setQuery(input);
      setFilteredOptions(filterOptions(input));
    };

    const handleOptionClick = (option: ListOption) => {
      setQuery(option.val);
      onValueChange(option.val, fieldName, option?.id);
      setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    useEffect(() => {
      setFilteredOptions(normalizedOptions);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [options]);

    useImperativeHandle(ref, () => ({
      clear: () => setQuery(''),
    }));

    const showDropdown = isOpen && filteredOptions.length > 0;

    return (
      <div ref={dropdownRef} className="relative w-full">
        <input
          type="text"
          className="form-field mt-1 w-full border border-gray-300 rounded-md shadow-sm"
          placeholder={`${text}...`}
          key={fieldName}
          name={fieldName}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        {showDropdown && (
          <ul className="absolute w-full mt-2 z-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {filteredOptions.map((option) => (
              <li
                key={option.val + 'li'}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleOptionClick(option)}
              >
                {option.val}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

export default SearchableDropdown;


// import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
// import { ListOption } from '../utils/types';

// interface Props {
//   options: string[] | ListOption[];
//   fieldName: string;
//   text: string;
//   onValueChange: (value: string, name: string, id?: number) => void;
// }

// // Adding `ref` with forwardRef
// const SearchableDropdown = forwardRef(({ options, fieldName, text, onValueChange }: Props, ref) => {
//   const [query, setQuery] = useState(''); // State to hold the search query
//   const [filteredOptions, setFilteredOptions] = useState<ListOption[]>([]); // State for filtered results
//   const [isOpen, setIsOpen] = useState(false); // State to toggle dropdown visibility
//   const dropdownRef = useRef<HTMLDivElement>(null); // Reference to detect outside clicks

//   // Normalize options to ListOption[]
//   const normalizedOptions: ListOption[] = Array.isArray(options)
//     ? options.map((option) =>
//         typeof option === 'string' ? { val: option } : option
//       )
//     : [];

//   // Filter options based on the query
//   const filterOptions = (input: string) => {
//     return normalizedOptions.filter((option) =>
//       option.val.toLowerCase().includes(input.toLowerCase())
//     );
//   };

//   // Handle input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const input = e.target.value;
//     setQuery(input);
//     setFilteredOptions(filterOptions(input));
//   };

//   const handleOptionClick = (option: ListOption) => {
//     setQuery(option.val); // Set the input value to the selected option
//     onValueChange(option.val, fieldName, option?.id); // Pass the value to the parent
//     setIsOpen(false); // Close the dropdown
//   };

//   const handleClickOutside = (e: MouseEvent) => {
//     if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
//       setIsOpen(false); // Close dropdown if clicked outside
//     }
//   };

//   // Expose the `clear` method to the parent using useImperativeHandle
//   useImperativeHandle(ref, () => ({
//     clear: () => {
//       setQuery(''); // Clear the query state
//       setFilteredOptions(normalizedOptions); // Reset the filtered options
//       setIsOpen(false); // Close the dropdown
//     },
//   }));

//   // Initialize filtered options and add event listener for outside clicks
//   useEffect(() => {
//     setFilteredOptions(normalizedOptions);
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [options]);

//   const showDropdown = isOpen && filteredOptions.length > 0;

//   return (
//     <div ref={dropdownRef} className="relative w-full">
//       {/* Input Field */}
//       <input
//         type="text"
//         className="form-field mt-1 w-full border border-gray-300 rounded-md shadow-sm"
//         placeholder={`${text}...`}
//         key={fieldName}
//         name={fieldName}
//         value={query}
//         onChange={handleInputChange}
//         onFocus={() => setIsOpen(true)} // Open dropdown when input is focused
//       />

//       {/* Dropdown List */}
//       {showDropdown && (
//         <ul className="absolute w-full mt-2 z-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
//           {filteredOptions.map((option) => (
//             <li
//               key={option.val + 'li'} // Use `id` if available, otherwise fallback to `val`
//               {...(option.id ? { id: option.id.toString() } : {})}
//               className="p-2 hover:bg-gray-100 cursor-pointer"
//               onClick={() => handleOptionClick(option)}
//             >
//               {option.val}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// });

// export default SearchableDropdown;







// import React, { useEffect, useRef, useState } from 'react';
// import { ListOption } from '../utils/types';

// interface Props {
//   options: string[] | ListOption[];
//   fieldName: string;
//   text: string;
//   onValueChange: (value: string, name: string, id?:number) => void;
// }

// const SearchableDropdown = ({ options, fieldName, text, onValueChange }: Props) => {
//   const [query, setQuery] = useState(''); // State to hold the search query
//   const [filteredOptions, setFilteredOptions] = useState<ListOption[]>([]); // State for filtered results
//   const [isOpen, setIsOpen] = useState(false); // State to toggle dropdown visibility
//   const dropdownRef = useRef<HTMLDivElement>(null); // Reference to detect outside clicks

//   // Normalize options to ListOption[]
//   const normalizedOptions: ListOption[] = Array.isArray(options)
//     ? options.map((option) =>
//         typeof option === 'string' ? { val: option } : option
//       )
//     : [];

//   // Filter options based on the query
//   const filterOptions = (input: string) => {
//     return normalizedOptions.filter((option) =>
//       option.val.toLowerCase().includes(input.toLowerCase())
//     );
//   };

//   // Handle input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const input = e.target.value;
//     setQuery(input);
//     setFilteredOptions(filterOptions(input));
//   };

//   const handleOptionClick = (option: ListOption) => {
//     setQuery(option.val); // Set the input value to the selected option    
//     onValueChange(option.val, fieldName, option?.id); // Pass the value to the parent
//     setIsOpen(false); // Close the dropdown
//   };

//   const handleClickOutside = (e: MouseEvent) => {
//     if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
//       setIsOpen(false); // Close dropdown if clicked outside
//     }
//   };

//   // Initialize filtered options and add event listener for outside clicks
//   useEffect(() => {
//     setFilteredOptions(normalizedOptions);
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [options]);

//   const showDropdown = isOpen && filteredOptions.length > 0;

//   return (
//     <>
//         <div ref={dropdownRef} className="relative w-full">
//       {/* Input Field */}
//       <input
//         type="text"
//         className="form-field mt-1 w-full border border-gray-300 rounded-md shadow-sm"
//         placeholder={`${text}...`}
//         key={fieldName}
//         name={fieldName}
//         value={query}
//         onChange={handleInputChange}
//         onFocus={() => setIsOpen(true)} // Open dropdown when input is focused
//       />

//       {/* Dropdown List */}
//       {showDropdown && (
//         <ul className="absolute w-full mt-2 z-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
//           {filteredOptions.map((option) => (
//             <li
//               key={option.val+'li'} // Use `id` if available, otherwise fallback to `val`
//               {...(option.id ? { id: option.id.toString() } : {})}
//               className="p-2 hover:bg-gray-100 cursor-pointer"
//               onClick={() => handleOptionClick(option)}
//             >
//               {option.val}
//             </li>
//           ))}
//         </ul>
//       )}
//         </div>
//     </>
//   );
// };

// export default SearchableDropdown;


