
import { db } from "./Firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
  

(function () 
{
  const form = document.getElementById('registerForm');
  const alertBox = document.getElementById('regAlert');

  // Inputs
  const fullNameEl = document.getElementById('fullName');
  const emailEl = document.getElementById('email');
  const phoneEl = document.getElementById('phone');
  const pwdEl = document.getElementById('password');
  const confirmPwdEl = document.getElementById('confirmPassword');
  const ageEl = document.getElementById('age');
  const genderEl = document.getElementById('gender');
  const bloodEl = document.getElementById('bloodGroup');
  const emerPhoneEl = document.getElementById('emergencyPhone');
  const agreeEl = document.getElementById('agree');

  // Show/Hide password
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const isPass = pwdEl.getAttribute('type') === 'password';
      pwdEl.setAttribute('type', isPass ? 'text' : 'password');
      btn.innerHTML = `<i class="fas ${isPass ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
    });
  });

  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    hideAlert();

    // Basic front-end validation
    const fullName = fullNameEl.value.trim();
    const email = emailEl.value.trim();
    var phone = phoneEl.value.trim();
    const password = pwdEl.value;
    const confirmPassword = confirmPwdEl.value;
    const age = parseInt(ageEl.value || '0', 10);
    const gender = genderEl.value;
    const bloodGroup = bloodEl.value;
    const emergencyPhone = emerPhoneEl.value.trim();

    let valid = true;

    if (!fullName || fullName.length < 2) {
      setError('fullName', 'Please enter your full name.');
      valid = false;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('email', 'Please enter a valid email address.');
      valid = false;
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('phone', 'Please enter a valid phone number.');
      phone=phone.replace(/\D/g, '');
      valid = false;
    }

    // Password: at least 8 chars, include number and symbol
    const pwdPattern = /^(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!password || !pwdPattern.test(password)) {
      setError('password', 'Use 8+ chars with a number and a symbol.');
      valid = false;
    }

    if (confirmPassword !== password) {
      setError('confirmPassword', 'Passwords do not match.');
      valid = false;
    }

    if (!age || age < 0 || age > 120) {
      setError('age', 'Please enter a valid age.');
      valid = false;
    }

    if (!gender) {
      setError('gender', 'Select your gender.');
      valid = false;
    }

    if (!bloodGroup) {
      setError('bloodGroup', 'Select your blood group.');
      valid = false;
    }

    if (!agreeEl.checked) {
      showAlert('error', 'Please agree to the Terms & Privacy Policy.');
      valid = false;
    }

    if (!valid) return;
else {
  try {

    // WAIT for Patients doc
    await addDoc(collection(db, "Patients"), {
      Name: fullName,
      Email: email,
      PhoneNumber: phone,
      Password: password,
      Age: age,
      Gender: gender,
      BloodGroup: bloodGroup,
      EmergencyPH: emergencyPhone,
      Role: 'Patient'
    });

    // WAIT for Users doc
    await addDoc(collection(db, "Users"), {
      Name: fullName,
      Email: email,
      Password: password,
      Role: "Patient"
    });

    // Only runs AFTER both succeed
    showAlert('success', "Registration Successful. Please click on Login to continue.");
    
    form.reset();
    sessionStorage.clear();
    localStorage.clear();

    // Safe to redirect now
     window.location.replace("Login.html");

  } catch (err) {
    console.error(err);
    showAlert('error', 'Something went wrong. Please try again.');
  }

  }
  });

  // Helpers
  function setError(field, message) {
    const el = document.querySelector(`.error[data-for="${field}"]`);
    if (el) el.textContent = message;
  }
  function clearErrors() {
    document.querySelectorAll('.error').forEach(e => e.textContent = '');
  }
  function showAlert(type, message) {
    alertBox.classList.remove('hidden', 'error', 'success');
    alertBox.classList.add(type === 'success' ? 'success' : 'error', 'alert');
    alertBox.textContent = message;
  }
  function hideAlert() {
    alertBox.classList.add('hidden');
    alertBox.textContent = '';
  }
})();