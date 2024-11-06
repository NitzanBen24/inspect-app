'use client'
import React, { useState } from 'react'
import HomePage from "./views/HomePage";
import LoginForm from './views/LoginForm';
import { useUser } from './hooks/useUser';


const Main = () => {
   // const { user } = useUser();
    const [isLogged, setIsLooged] = useState(false);

    const isLoggedIn = (status: boolean) => {        
        // if (user) {
        //     authUser(user)
        // }
        
        setIsLooged(status);
    }


    

    return (
        <>
            {/** useContext  */}
            {/* {user.isLoggedIn ? <HomePage /> : <LoginForm />} */}

            {/** callBack function to child component */}
            {isLogged? <HomePage /> : <LoginForm isLogged={isLoggedIn}/>}
            

            {/* <HomePage />  */}
        </>
    )
}

export default Main