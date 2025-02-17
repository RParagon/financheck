// Importando o Supabase client via Skypack
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const SUPABASE_URL = 'https://elmjtdztnwecsregkbut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbWp0ZHp0bndlY3NyZWdrYnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3NDQ3NzksImV4cCI6MjA1NTMyMDc3OX0.KicoVbt18thHT2Xud4L5oa95yboiZSYmomNFYnnLdIg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
