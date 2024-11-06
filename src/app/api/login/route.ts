import { getAllUsers } from '@/app/lib/dbObject';
import { authenticateUser } from '@/app/services/loginService';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async () => {
    try {
      const result = await getAllUsers();      
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error loading PDF template:', error);
      return NextResponse.json({ error: 'Failed to load PDF template' }, { status: 500 });
    }
  } 
  
  export async function POST(req: NextRequest) {
    try {
      const { email, password } = await req.json();
      // Authenticate the user
      const user = await authenticateUser(email, password);
      console.log('POST.login::',user)
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
      }
  
      // Optionally, set a cookie or session for the user
      // This example doesn't include session management for simplicity
  
      return NextResponse.json({ success: true, user: user }, { status: 200 });
    } catch (error) {
      console.error('Error during login:', error);
      return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
    }
  }




