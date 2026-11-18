// js/auth.js - Handles Login, +251 Sign-up, and Approval Gate

function showMessage(text, isError = true) {
  const box = document.getElementById('alertBox');
  box.textContent = text;
  box.className = isError ? 'alert-box alert-error' : 'alert-box alert-success';
  box.classList.remove('hidden');
  window.scrollTo(0, 0);
}

function showTab(tab) {
  document.getElementById('alertBox').classList.add('hidden');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    tabLogin.className = 'btn btn-primary';
    tabSignup.className = 'btn';
    tabSignup.style.background = '#E2E8F0';
    tabSignup.style.color = '#1E293B';
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    tabSignup.className = 'btn btn-primary';
    tabLogin.className = 'btn';
    tabLogin.style.background = '#E2E8F0';
    tabLogin.style.color = '#1E293B';
  }
}

function toggleClassField() {
  const role = document.getElementById('regRole').value;
  const classGroup = document.getElementById('classFieldGroup');
  if (role === 'student') {
    classGroup.classList.remove('hidden');
  } else {
    classGroup.classList.add('hidden');
  }
}

// Validate Ethiopian Phone Number (+251 followed by 9 digits)
function formatAndValidatePhone(rawPhone) {
  const cleaned = rawPhone.replace(/\s+/g, '');
  const ethiopianRegex = /^\+251\d{9}$/;
  if (!ethiopianRegex.test(cleaned)) {
    return null;
  }
  return cleaned;
}

async function checkCurrentUser() {
  try {
    if (typeof supabaseClient === 'undefined') {
      showMessage('Connection error: Supabase library did not load. Check your internet connection.');
      return;
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) return;

    if (profile.is_approved) {
      window.location.href = 'dashboard.html';
    } else {
      document.getElementById('authCard').classList.add('hidden');
      document.getElementById('pendingCard').classList.remove('hidden');
      document.getElementById('pendingUserName').textContent = profile.full_name;
      document.getElementById('pendingUserEmail').textContent = profile.email;
      document.getElementById('pendingUserPhone').textContent = profile.phone;
      document.getElementById('pendingUserRole').textContent = 
        profile.role === 'student' ? `Student (${profile.class_name})` : 'Teacher';
    }
  } catch (err) {
    console.error(err);
  }
}

// Handle Sign-Up Form Submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('signupBtn');
  btn.textContent = 'Creating Account...';
  btn.disabled = true;

  try {
    if (typeof supabaseClient === 'undefined') {
      throw new Error('Supabase did not load. Please check internet connection and reload.');
    }

    const fullName = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const rawPhone = document.getElementById('regPhone').value.trim();
    const role = document.getElementById('regRole').value;
    const grade = document.getElementById('regGrade').value;
    const section = document.getElementById('regSection').value;
    const password = document.getElementById('regPassword').value;

    const validPhone = formatAndValidatePhone(rawPhone);
    if (!validPhone) {
      throw new Error('Enter a valid Ethiopian phone number: +251 followed by 9 digits (e.g. +251 951168203).');
    }

    if (role === 'student' && (!grade || !section)) {
      throw new Error('Please select both your Grade and your Section.');
    }

    const combinedClassName = role === 'student' ? `${grade} - ${section}` : null;

    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          phone: validPhone,
          role: role,
          class_name: combinedClassName
        }
      }
    });

    if (error) throw error;

    showMessage('Registration submitted! Checking approval status...', false);
    setTimeout(() => checkCurrentUser(), 1000);

  } catch (err) {
    showMessage(err.message || 'Something went wrong. Please try again.');
    btn.textContent = 'Submit Registration';
    btn.disabled = false;
  }
});

// Handle Login Form Submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  btn.textContent = 'Signing In...';
  btn.disabled = true;

  try {
    if (typeof supabaseClient === 'undefined') {
      throw new Error('Supabase did not load. Please check internet connection and reload.');
    }

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const { error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw new Error('Invalid Gmail or password. Please try again.');

    checkCurrentUser();
  } catch (err) {
    showMessage(err.message);
    btn.textContent = 'Sign In to Portal';
    btn.disabled = false;
  }
});

async function logoutUser() {
  await supabaseClient.auth.signOut();
  window.location.reload();
}

checkCurrentUser();
