import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://khcvcqvpsrlxneziwmsx.supabase.co';//process.env.SUPABASE_PROJECT_URL!;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY3ZjcXZwc3JseG5leml3bXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzNzIxOTQsImV4cCI6MjA0Mzk0ODE5NH0.KP623OklxMERe9dp3Udp0yYJTD7ZEBUqLSq3geG_dOM';//process.env.SUPABASE_API_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
