import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.elmjtdztnwecsregkbut.supabase.co
const supabaseKey = import.meta.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbWp0ZHp0bndlY3NyZWdrYnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3NDQ3NzksImV4cCI6MjA1NTMyMDc3OX0.KicoVbt18thHT2Xud4L5oa95yboiZSYmomNFYnnLdIg

export const supabase = createClient(supabaseUrl, supabaseKey)