'use client'
import React, { useEffect, useState } from 'react'
import LoginForm from './views/LoginForm';
import { useUser } from './hooks/useUser';
import { useFetch, usePost } from './hooks/useQuery';
import { AuthFail, AuthResponse } from './utils/types';
import { isAuthResponse } from './utils/typeGuards';
import { TechniciansProvider } from './contexts/TechniciansContext';
import { ManufactureProvider } from './contexts/ManufacturesContext';
import AppHeader from './components/AppHeader';
import { Container } from 'react-bootstrap';
import { Spinner } from './components/Spinner';
import Home from './views/Home';



const Main = () => {
    //console.log('Main.render=>')
    const { user, logIn, logOut } = useUser();
    const  { data: userAuth, isLoading } = useFetch<AuthResponse | AuthFail>(
        'users', 
        'auth', 
        { 
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            staleTime: 10 * 60 * 1000,
            cacheTime: 15 * 60 * 1000,
        }
    );

    const { mutate: userAuthMutation } = usePost('auth','users', () => logOut());    

    useEffect(() => {    
        if (userAuth && isAuthResponse(userAuth)) {            
            logIn(userAuth.user);       
        }        
    }, [ userAuth ])

    if (isLoading) return <Spinner />;
    if (!user.isLoggedIn) return <LoginForm />;

    return (
        <>            
            <AppHeader logOutUser={ () => userAuthMutation({}) } />
                    
            <ManufactureProvider>
            <TechniciansProvider>
                <Container fluid className='main-container'>                    
                    <Home />
                </Container>
            </TechniciansProvider>
            </ManufactureProvider>
              
        </>
    )
}

export default Main