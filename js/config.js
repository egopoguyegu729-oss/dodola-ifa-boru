// js/config.js
const SUPABASE_URL = 'https://qjxvoeioiljvwqnxmkzs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ozhGlJoKumxxP1lWCQpvug_lrLKG6Lr';

var supabaseClient = null;

if (window.supabase && window.supabase.createClient) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
