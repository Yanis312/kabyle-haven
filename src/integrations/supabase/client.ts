
import { createClient } from "@supabase/supabase-js";

// Supabase project configuration
const supabaseUrl = "https://wiyqlsbatmrwunvoihxa.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeXFsc2JhdG1yd3Vudm9paHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjIzOTYsImV4cCI6MjA1NzI5ODM5Nn0.PjzdfOkQpog6Ra4GMpVSZop-6DofagQsK8h8W2mnhLg";

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
