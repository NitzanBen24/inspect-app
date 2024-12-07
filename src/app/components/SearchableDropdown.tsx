import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { ListOption } from '../utils/types';

interface Props {
  options: string[] | ListOption[];
  fieldName: string;
  text: string;
  value?:string;
  onValueChange: (value: string, name: string, id?: number) => void;
}

export interface SearchableDropdownHandle {
  clear: () => void;
}

const SearchableDropdown = forwardRef<SearchableDropdownHandle, Props>(
  ({ options, fieldName, text, value, onValueChange }: Props, ref) => {
    const [query, setQuery] = useState(value);
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

