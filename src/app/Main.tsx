'use client'
import React, { useEffect, useState } from 'react'
import HomePage from "./views/HomePage";
import LoginForm from './views/LoginForm';
import { useUser } from './hooks/useUser';
import { useFetch, usePost } from './hooks/useQuery';
import { AuthFail, AuthResponse } from './utils/types';
import { isAuthResponse } from './utils/typeGuards';
import Image from 'next/image';


const Main = () => {
    
    const { user, logIn, logOut } = useUser();    
    const  { data: userAuth, isLoading } = useFetch<AuthResponse | AuthFail>('users', 'auth');

    const userLogoutSuccess = (data: any) => logOut();
    const { mutate: userAuthMutation } = usePost('auth', userLogoutSuccess);
    
    useEffect(() => {    
        if (userAuth && isAuthResponse(userAuth)) {            
            logIn(userAuth.user);
        }        
    }, [ userAuth ])

    if (isLoading) {
        return (<div>Checking user</div>)
    }

    const disconnectUser = () => userAuthMutation({});

    return (
        <>
            <div className="app-header my-3 px-2">
                <div className="flex justify-between items-center">                
                    <div className="user-toggle">                                                
                        {user.isLoggedIn ? <button className='border-2 p-1 text-xs border-black text-blck rounded-lg' onClick={ disconnectUser }>Logout</button> : ''}
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
                    
            {user.isLoggedIn ? <HomePage /> : <LoginForm />}            
        </>
    )
}

export default Main