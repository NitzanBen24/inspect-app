'use client';

import { useState } from "react";
import { usePost } from "../hooks/useQuery";
import { PdfForm } from "../utils/types";
import { appStrings } from "../utils/AppContent";
import FormsList from "./FormsList"; // Import your FormsList component
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { getHebrewString, isEmptyProps } from "../utils/helper";
import { useUser } from "../hooks/useUser";

interface Props {
  selectForm: (form: PdfForm) => void;
}

const Archive = ({ selectForm }: Props) => {

    const { user } = useUser();
    const [ searchForm, setSearchForm ] = useState<boolean>(false)
    const [searchData, setSearchData] = useState({
        name: "",
        customer: "",
        user_name: "",
        created_at: "",
    });
    const [searchResults, setSearchResults] = useState<PdfForm[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState<string | null>(null);

    //console.log('Archive.render=>')

    const handleSearchSuccess = (res: any) => {
        setLoading(false);        
        setSearchResults(res.data);        
        if (res.data.length === 0) {
            setNotFound(appStrings.missigRecords);
        } else {
            setNotFound(null)
        }
    };

    const handleSearchError = (err: any) => {        
        setLoading(false);
        setError(err.message || "Error fetching forms.");
    };

    const { mutate: searchRecords } = usePost(
        "forms", // API endpoint
        ['archive'], // Query key
        handleSearchSuccess,
        handleSearchError
    );

    const search = () => {        
        setLoading(true);
        setError(null);
        searchRecords({search:searchData, action: 'search'});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchData({ ...searchData, [e.target.name]: e.target.value });
    };

    const toggleBlock = () => {
        setSearchForm(!searchForm);
    }

    const reset = () => {
        setSearchData({
            name: "",
            customer: "",
            user_name: "",
            created_at: "",
        })
        setSearchResults([]);
        setNotFound(null);
    }

    return (
        <>
        <div className="archive-block py-2 px-4">
            <h2 className="flex text-lg cursor-pointer" onClick={toggleBlock}>
                {appStrings.archive}
                <ChevronDownIcon className="size-6"/>
            </h2>
        
            {/* Search Form */}
            {searchForm &&  
            <div className="archvie-body">
                {/* query search inputs */}                
                <div className="flex w-full flex-col md:flex-row gap-2 my-4">
                    <div>
                        <label>שם טופס:</label>
                        <input
                            className="border border-gray-300 rounded-lg p-1 w-full"
                            type="text"
                            name="name"
                            value={searchData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>לקוח:</label>
                        <input
                            className="border border-gray-300 rounded-lg p-1 w-full"
                            type="text"
                            name="customer"
                            value={searchData.customer}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>בודק:</label>
                        <input
                            className="border border-gray-300 rounded-lg p-1 w-full"
                            type="text"
                            name="user_name"
                            value={searchData.user_name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>תאריך:</label>
                        <input
                            className="border border-gray-300 rounded-lg p-1 w-full"
                            type="date"
                            name="created_at"
                            value={searchData.created_at}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="button-wrapp flex items-end">
                        <button
                            className="border-2 w-full md:w-auto border-black text-black px-4 py-1 mt-2 rounded-lg"
                            type="button"
                            onClick={search}
                            disabled={loading || !Object.values(searchData).some((v) => v)}
                            >
                            {loading ? 'מחפש...' : 'חפש'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && <p className="text-red-500">{error}</p>}

                {/* Search Results */}

                {(searchResults.length > 0) && 
                <div className="btn-wrap flex justify-end">
                    <button className="border-2 px-3 py-1 text-xs border-black text-blck rounded-lg" onClick={reset}>{appStrings.clear}</button>
                </div>}

                {searchResults.length > 0 &&                    
                (<>
                <FormsList
                    forms={searchResults}
                    openForm={selectForm}
                    title={getHebrewString("")}
                    addFilter={true}
                    display={true}
                />                        
                </>)}
        
                {notFound && <p>{appStrings.missigRecords}</p>}

            </div>}
        </div>
        </>
    );
};

export default Archive;
