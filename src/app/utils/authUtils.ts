// authUtils.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from './types';

const SECRET_KEY = process.env.JWT_SECRET_KEY as string || '';
const COOKIE_NAME = 'sessionId';

/** Function to verify JWT token and authorize user */
export async function authorizeUser(req: NextRequest): Promise<NextResponse> {

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return NextResponse.json({ message: 'Authorized', user: decoded });
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return NextResponse.json({ error: 'Session expired or invalid' });
  }

}

/** Function to clear the JWT cookie and log out user */
export function removeUserTkn(): NextResponse {

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  return setCookie(response, COOKIE_NAME, '', 0); // Set maxAge to 0 to clear the cookie

}

export function addUserTkn(user: User): NextResponse {
    // Create a JWT with user data    
    const payload = { id: user.id,name: user.name, email: user.email };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' });

    // Set the JWT as an HTTP-only cookie
    const response = NextResponse.json({ success: true, user: user });

    return setCookie(response, COOKIE_NAME, token, 24 * 60 * 60); // Set cookie for 1 days
}

/** Helper function to set cookies */
function setCookie(response: NextResponse, name: string, value: string, maxAge: number) {
    response.cookies.set(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge,
      path: '/',
    });
    return response;
}