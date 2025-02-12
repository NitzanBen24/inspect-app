'use client'
import React, { useEffect, useState } from 'react'
import HomePage from "./views/HomePage";
import LoginForm from './views/LoginForm';
import { useUser } from './hooks/useUser';
import { useFetch, usePost } from './hooks/useQuery';
import { AuthFail, AuthResponse } from './utils/types';
import { isAuthResponse } from './utils/typeGuards';
import Image from 'next/image';
import { TechniciansProvider } from './contexts/TechniciansContext';
import { ManufactureProvider } from './contexts/ManufacturesContext';
import AppHeader from './components/AppHeader';
import { Container } from 'react-bootstrap';
import { useQueryClient } from '@tanstack/react-query';
import { Spinner } from './components/Spinner';



const Main = () => {
    
    const { user, logIn, logOut } = useUser();
    const  { data: userAuth, isLoading } = useFetch<AuthResponse | AuthFail>('users', 'auth');

    const userLogoutSuccess = (data: any) => logOut();
    const { mutate: userAuthMutation } = usePost('auth','users', userLogoutSuccess);
    
    useEffect(() => {    
        if (userAuth && isAuthResponse(userAuth)) {            
            logIn(userAuth.user);       
        }        
    }, [ userAuth ])

    if (isLoading) {
        return <Spinner />
    }

    const disconnectUser = () => userAuthMutation({});

    return (
        <>            
            <AppHeader logOutUser={ disconnectUser } />
                    
            {user.isLoggedIn ? 
            <ManufactureProvider>
            <TechniciansProvider>
                <Container fluid className='main-container'>
                    <HomePage />
                </Container>
            </TechniciansProvider>
            </ManufactureProvider>
            
             : 
            <LoginForm />}            
        </>
    )
}

export default Main