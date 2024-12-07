import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://khcvcqvpsrlxneziwmsx.supabase.co';//process.env.SUPABASE_PROJECT_URL!;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY3ZjcXZwc3JseG5leml3bXN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODM3MjE5NCwiZXhwIjoyMDQzOTQ4MTk0fQ.NJ3zNGsCO2AkwvgSQ-XTCzysXHrMgZGqUK87bHM3d3U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
