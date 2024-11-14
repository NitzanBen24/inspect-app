'use client'; // Enable client-side rendering in Next.js 14

import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { usePost } from '../hooks/useQuery';
import Modal from '../components/Modal';

const LoginForm = () => {
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const[message, setMessage] = useState<string>('');
  
  const { logIn } = useUser();

  const handleLoginSuccess = (data: any) => {    
    console.log('handleLoginSuccess=>',data)
    logIn(data.user);
  }
  const handleLoginError = (error: any) => {
    setMessage(error.response?.data.error);
    openModal();      
  };

  const {mutate: connectUser } = usePost('login',handleLoginSuccess, handleLoginError)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    connectUser({
      email: username,
      password: password
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => { 
      setIsModalOpen(false);
  }

  return (
    <>
    <div className="login-wrap mx-auto flex items-center p-2 h-96 max-w-80">
      <div className='login-form w-full text-right'>
        <h1 className='text-center'>התחברות</h1>
        <form onSubmit={handleSubmit}>
          <div className='form-item flex mt-2'>
            
            <input
              className='w-full border border-gray-300 rounded-lg shadow-sm'
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label className='text-sm min-w-20 text-right font-medium text-black' htmlFor="username">:שם משתמש</label>
          </div>
          <div className='form-item flex mt-2'>            
            <input
              className='w-full border border-gray-300 rounded-lg shadow-sm'
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className='text-sm min-w-20 text-right font-medium text-black' htmlFor="password">:סיסמה</label>
          </div>
          {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
          <button className='w-full border-2 border-black text-blck px-4 mt-3 py-2 rounded-lg' type="submit">כנס</button>
        </form>
      </div>
    </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} >
        <h2>This is a modal!</h2>
        <p>{ message }</p>
      </Modal>

    </>
  );
};

export default LoginForm;
