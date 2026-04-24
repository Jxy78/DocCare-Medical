  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { db} from "./Firebase.js";
import {collection, addDoc, getDocs} from  "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
  

var users=null;
  
async function listPatients() 
{

  const ref=collection(db,"Users");
  const snap=await getDocs(ref);


  
 const result = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,           
        Name: data.Name,    
        Email: data.Email,
        Role : data.Role,
        Password : data.Password   
    
      };
    });

  console.log("Size : ", snap.size);
  users=result;
  return result;
  
}
listPatients();



(function () {
  const form = document.getElementById('loginForm');
  const emailEl = document.getElementById('email');
  const pwdEl = document.getElementById('password');
  const rememberEl = document.getElementById('rememberMe');
  const alertBox = document.getElementById('loginAlert');
  const toggleBtn = document.querySelector('.password-toggle');

  // Quick login buttons (demo helpers)
  document.querySelectorAll('[data-quick]').forEach(btn => 
    {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-quick');
      if(role == 'patient')
        emailEl.ariaPlaceholder = role + '@gmail.com';
      else 
        emailEl.ariaPlaceholder = role + '@doccare.com';
      pwdEl.ariaPlaceholder = 'Password@123';
      selectRole(role);
    });
  });

  // Restore "remember me"
  const remembered = JSON.parse(localStorage.getItem('doccare_remember') || '{}');
  if (remembered.email) emailEl.value = remembered.email;
  if (remembered.role) selectRole(remembered.role);
  if (remembered.email || remembered.role) rememberEl.checked = true;

  // Show/Hide password
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isPass = pwdEl.getAttribute('type') === 'password';
      pwdEl.setAttribute('type', isPass ? 'text' : 'password');
      toggleBtn.innerHTML = `<i class="fas ${isPass ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
    });
  }

  // Simple form validation + mock login
  form.addEventListener('submit', (e) => 
  {
    e.preventDefault();
    clearErrors();
    hideAlert();

    const email = emailEl.value.trim();
    const password = pwdEl.value;
    const role = getSelectedRole();

    let valid = true;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('email', 'Please enter a valid email address.');
      valid = false;
    }
    if (!password || password.length < 6) {
      setError('password', 'Password must be at least 6 characters.');
      valid = false;
    }
    if (!role) {
      setError('role', 'Please select a role.');
      valid = false;
    }

    if (!valid) return;

    let present=false;
    var urole="";
    var dataobject=null;
    for(const p of users)
    {
      if(p.Email == email)
        {
          dataobject=p;
         if(p.Password == password){
            present=true;
            urole=p.Role;
          }
          else{
            setError('password',"Incorrect Password.");
            document.getElementById("errr").style.display="";
          }
        }
    }
    
    if(!present)
      setError('email',"Please enter a valid email address.");
    else{
        if(role == urole){
            showAlert("success","Account Verified");
            sessionStorage.setItem("email",email);
            sessionStorage.setItem("name",dataobject.Name);
        
    
          // Redirect based on role
          switch (role) {
            case 'Admin':  return redirect('AdminIndex.html');
            case 'Doctor': return redirect('DoctorIndex.html');
            default:       return redirect('index.html');
    }
            
  }
        else
             showAlert("error","Incorrect Role selected.");
        }
   

      
  });

  // Forgot password (demo)
  const forgotLink = document.getElementById('forgotLink');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      showAlert('success', 'Please contact support@doccare.com to reset your password.');
    });
  }

  // Utilities
  function getSelectedRole() {
    const checked = document.querySelector('input[name="role"]:checked');
    return checked ? checked.value : '';
  }
  function selectRole(value) {
    const node = document.querySelector(`input[name="role"][value="${value}"]`);
    if (node) node.checked = true;
  }
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
  function redirect(path) {
    // Optionally, gate-keep admin/doctor pages from direct access:
    // Add a small guard snippet at the top of AdminIndex.html / DoctorIndex.html.
    window.location.href = path;
  }
})();
