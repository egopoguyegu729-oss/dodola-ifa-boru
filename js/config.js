// js/config.js - Clean Direct Supabase Connector
const SUPABASE_URL = 'https://qjxvoeioiljvwqnxmkzs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ozhGlJoKumxxP1lWCQpvug_lrLKG6Lr';

function getHeaders(token = null) {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + (token || SUPABASE_ANON_KEY),
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
}

function getSavedSession() {
  try {
    return JSON.parse(localStorage.getItem('sb_session'));
  } catch (e) {
    return null;
  }
}

window.supabaseClient = {
  auth: {
    async getSession() {
      const session = getSavedSession();
      return { data: { session }, error: null };
    },
    async signUp({ email, password, options }) {
      const res = await fetch(SUPABASE_URL + '/auth/v1/signup', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: email, password: password, data: options && options.data ? options.data : {} })
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: { message: json.msg || json.error_description || 'Sign up failed' } };
      const sessionObj = { access_token: json.access_token, user: json.user || json };
      if (json.access_token) localStorage.setItem('sb_session', JSON.stringify(sessionObj));
      return { data: sessionObj, error: null };
    },
    async signInWithPassword({ email, password }) {
      const res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: email, password: password })
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: { message: json.error_description || json.msg || 'Invalid login' } };
      const sessionObj = { access_token: json.access_token, user: json.user };
      localStorage.setItem('sb_session', JSON.stringify(sessionObj));
      return { data: sessionObj, error: null };
    },
    async signOut() {
      localStorage.removeItem('sb_session');
      return { error: null };
    }
  },
  from(table) {
    let url = SUPABASE_URL + '/rest/v1/' + table + '?select=*';
    let method = 'GET';
    let bodyData = null;
    let isSingle = false;

    const queryBuilder = {
      select(cols = '*') {
        url = url.replace('select=*', 'select=' + encodeURIComponent(cols));
        return queryBuilder;
      },
      eq(col, val) {
        url += '&' + col + '=eq.' + encodeURIComponent(val);
        return queryBuilder;
      },
      order(col, opts) {
        const asc = !opts || opts.ascending !== false;
        url += '&order=' + col + '.' + (asc ? 'asc' : 'desc');
        return queryBuilder;
      },
      single() {
        isSingle = true;
        return queryBuilder;
      },
      insert(rows) {
        method = 'POST';
        bodyData = JSON.stringify(rows);
        return queryBuilder;
      },
      update(vals) {
        method = 'PATCH';
        bodyData = JSON.stringify(vals);
        return queryBuilder;
      },
      delete() {
        method = 'DELETE';
        return queryBuilder;
      },
      async then(resolve) {
        const session = getSavedSession();
        const res = await fetch(url, {
          method: method,
          headers: getHeaders(session ? session.access_token : null),
          body: bodyData
        });
        const json = await res.json().catch(function() { return null; });
        if (!res.ok) {
          resolve({ data: null, error: { message: (json && json.message) ? json.message : 'Database error' } });
        } else {
          const singleRow = (Array.isArray(json) && json.length > 0) ? json[0] : null;
          resolve({ data: isSingle ? singleRow : json, error: null });
        }
      }
    };
    return queryBuilder;
  }
};
