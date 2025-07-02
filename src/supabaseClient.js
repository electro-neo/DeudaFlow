import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dwucipmxkzdetqdmkiaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dWNpcG14a3pkZXRxZG1raWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzY0NjAsImV4cCI6MjA2NzA1MjQ2MH0.YK2PvtP1D7QzRXocbKcFqTR9Ej9C7ReP0nEppSn7rTU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);