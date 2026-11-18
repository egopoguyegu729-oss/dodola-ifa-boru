// js/ui.js - Protects pages and loads user profile & navigation

let currentUserProfile = null;

async function requireApprovedUser(adminOnly = false) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }

  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile || !profile.is_approved) {
    window.location.href = 'index.html';
    return null;
  }

  if (adminOnly && profile.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return null;
  }

  currentUserProfile = profile;

  // Show Admin button in top bar if user is an admin
  const adminBtn = document.getElementById('adminNavBtn');
  if (adminBtn && profile.role === 'admin') {
    adminBtn.classList.remove('hidden');
  }

  // Display user name & role if badge exists
  const userBadge = document.getElementById('userBadge');
  if (userBadge) {
    const label = profile.role === 'student' ? profile.class_name : profile.role.toUpperCase();
    userBadge.textContent = `${profile.full_name} (${label})`;
  }

  return profile;
}

async function logoutUser() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}
