'use client'
import React from 'react'
import Image from 'next/image';
import { useUser } from '../hooks/useUser';


interface Props {
    logOutUser: () => void
}

const AppHeader = ({ logOutUser }: Props) => {

    const { user } = useUser();

    return (
        <div className="app-header mb-4 px-2">
            <div className="flex justify-between items-center">                
                <div className="user-toggle">                                                
                    {user.isLoggedIn ? <button className='border-2 p-1 text-xs border-black text-blck rounded-lg' onClick={ logOutUser }>Logout</button> : ''}
                </div>
                <div className="logo p-2">
                    <Image
                        src="/img/logo.jpg"
                        alt="Company Logo"
                        // layout="responsive"
                        width={86}
                        height={76}
                        objectFit="contain"
                        priority                    // Loads the logo quickly
                    />
                </div>
            </div>
        </div>
    )
}

export default AppHeader