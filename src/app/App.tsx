'use client';
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Main from './Main';
import { UserProvider } from './contexts/userContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';



const queryClient = new QueryClient();

const App = () => {    
    return (
        <>
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                <Container fluid className='h-screen'>
                    <Main />
                </Container>
            </UserProvider>
        </QueryClientProvider>
        </>
      );
}

export default App