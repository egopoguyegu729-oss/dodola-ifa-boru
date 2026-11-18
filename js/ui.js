// js/ui.js - Protects pages and shows exact error if access is blocked
let currentUserProfile = null;

function showBlockReason(msg) {
  document.body.innerHTML = `
    <div style="max-width:440px; margin:40px auto; padding:24px; background:#fff; border-radius:14px; border:2px solid #DC2626; font-family:sans-serif;">
      <h2 style="color:#DC2626; margin-bottom:10px;">Access Check Stopped</h2>
      <p style="color:#1E293B; margin-bottom:16px;"><strong>Exact Reason:</strong> ${msg}</p>
      <a href="index.html" style="display:inline-block; padding:10px 18px; background:#0B3B8C; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold;">Back to Login</a>
    </div>
  `;
}

async function requireApprovedUser(adminOnly = false) {
  if (typeof supabaseClient === 'undefined') {
    showBlockReason('js/config.js did not load properly.');
    return null;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session || !session.user) {
    showBlockReason('No saved login session found in browser.');
    return null;
  }

  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    showBlockReason('Supabase database error: ' + error.message);
    return null;
  }

  if (!profile) {
    showBlockReason('No matching row found in profiles table for user ID: ' + session.user.id);
    return null;
  }

  if (!profile.is_approved) {
    showBlockReason('Your profile is_approved value is currently: ' + profile.is_approved);
    return null;
  }

  if (adminOnly && profile.role !== 'admin') {
    showBlockReason('Admin access only. Your role is currently: ' + profile.role);
    return null;
  }

  currentUserProfile = profile;

  const adminBtn = document.getElementById('adminNavBtn');
  if (adminBtn && profile.role === 'admin') {
    adminBtn.classList.remove('hidden');
  }

  const userBadge = document.getElementById('userBadge');
  if (userBadge) {
    const label = profile.role === 'student' ? profile.class_name : profile.role.toUpperCase();
    userBadge.textContent = profile.full_name + ' (' + label + ')';
  }

  return profile;
}

async function logoutUser() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}
