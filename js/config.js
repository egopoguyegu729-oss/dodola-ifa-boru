// js/config.js
import { createClient } from 'https://esm.sh';

const SUPABASE_URL = 'https://qjxvoeioiljvwqnxmkzs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ozhGlJoKumxxP1lWCQpvug_lrLKG6Lr';

window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
