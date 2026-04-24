import { db} from "./Firebase.js";
import {collection, addDoc, getDocs,doc,where,updateDoc,query, deleteDoc} from  "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
  

const form=document.getElementById("formdoc");
var name=sessionStorage.getItem("name");
var email=sessionStorage.getItem("email");
var doctorsMap=null;
var patientsMap=null ;
var adminsMap=null ;
var appointmentsmap=null;
var imageUrl=null, admData=null;
var totalActiveDoctors=0,active=0;
const photoPreview = document.getElementById('photoPreview');
const photoInput = document.getElementById('photoInput');

let selectedImage = null;

const tbody = document.getElementById("tbod");
const fragment = document.createDocumentFragment();

document.getElementById("Admin-name").innerText=name;

document.getElementById("adddocbt").addEventListener('click',function(event)
{
    showModal(event.target.dataset.name);
    
});

getUsers();
get_Appointments();
getAdminByEmail(email);

//Adding Doctors Account
 form.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.getElementById("submitDocBT").innerText="Adding...."
    document.getElementById("submitDocBT").disabled=true;
    
    let name = document.getElementById("doc-name").value;
    let email = document.getElementById("doc-email").value;
    let special=document.getElementById("doc-special").value;
    let phone = document.getElementById("doc-phone").value;
    let fee = document.getElementById("doc-consultfee").value;
    let status = document.getElementById("doc-status").value;
    let password = document.getElementById("doc-pass").value;

    await uploadAndGetURl();
    console.log("Image URL : ",imageUrl);
    
    
    try{
        addDoc(collection(db, "Doctors"),
          {
            Name : name,
            Email : email,
            PhoneNumber : phone,
            Password : password,
            Speciality : special,
            ConsultFee : fee,
            Status : status,
            Experience : "NA",
            Bio : "NA",
            ImgUrl : imageUrl
        });
        addDoc(collection(db, "Users"),
          {
            Name : name,
            Email : email,
            Password : password,
            Role : "Doctor",
            ImgUrl : imageUrl
        });
        closeModal("addDoctorModal");
        passwordText.innerText=password;
        dacmOpenModal();

        doctorsMap.push({
            Name : name,
            Email : email,
            PhoneNumber : phone,
            Password : password,
            Speciality : special,
            ConsultFee : fee,
            Status : status,
            Experience : "NA",
            Bio : "NA"
        });

        active = doctorsMap.filter(d => d.Status === "Active").length;
        document.getElementById("total-pat").innerText = patientsMap.length;
        document.getElementById("total-doc").innerText = doctorsMap.length;
        document.getElementById("total-doc2").innerText = doctorsMap.length;
        document.getElementById("total-active").innerText = active;

        document.getElementById("submitDocBT").innerText="Add Doctor"
    document.getElementById("submitDocBT").active=true;

        form.reset();

          
        }
        catch(error){
            console.log(error);
        }
    

    

    });


document.getElementById("closedocmodal").addEventListener('click',function(event){
    closeModal("addDoctorModal");
});

// Tab Navigation
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('pageTitle');
    
    const tabTitles = {
        'dashboard': 'Dashboard',
        'doctors': 'Manage Doctors',
        'appointments': 'Manage Appointments',
        'patients': 'Manage Patients',
        'history': 'History Records',
        'settings': 'Settings'
    };

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get tab name
            const tab = this.getAttribute('data-tab');
            
            // Update page title
            if (pageTitle && tabTitles[tab]) {
                pageTitle.textContent = tabTitles[tab];
            }
            
            // Show corresponding tab content
            showTab(tab);
        });
    });

    // Filter buttons functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Close modals on outside click
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
});
document.getElementById("appoint").addEventListener('click',function(event){
    switchTab("appointments");
});
document.getElementById("Add-doctor").addEventListener('click',function(event){
    switchTab("doctors");
});
document.getElementById("btnhistory").addEventListener('click',function(event){
    switchTab("history");
});

// Show Tab Function
function showTab(tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// Switch Tab (for quick actions)
function switchTab(tabName) 
{
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(nav => {
        nav.classList.remove('active');
        if (nav.getAttribute('data-tab') === tabName) {
            nav.classList.add('active');
        }
    });
    
    const pageTitle = document.getElementById('pageTitle');
    const tabTitles = {
        'dashboard': 'Dashboard',
        'doctors': 'Manage Doctors',
        'appointments': 'Manage Appointments',
        'patients': 'Manage Patients',
        'history': 'History Records',
        'settings': 'Settings'
    };
    
    if (pageTitle && tabTitles[tabName]) {
        pageTitle.textContent = tabTitles[tabName];
    }
    
    showTab(tabName);
}

// Show Modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// Close Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

document.getElementById("modal-close").addEventListener('click',function(event){
    closeModal("addDoctorModal");
});


// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}


const modal = document.getElementById("dacm-overlay");
var copyBtn = document.getElementById("dacm-copy-btn");
var passwordText = document.getElementById("dacm-password-text");
var closebtn=document.getElementById("dacm-close-btn");

function dacmOpenModal(){
    modal.classList.remove("dacm-hidden");
}

function dacmCloseModal(){
    modal.classList.add("dacm-hidden");
}

function dacmCopyPassword(){

    const password = passwordText.innerText;

    navigator.clipboard.writeText(password).then(() => {

        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';

        setTimeout(()=>{
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
        },2000);

    });
}

closebtn.addEventListener('click',function(event){

    dacmCloseModal()
});

document.getElementById("dacm-copy-btn").addEventListener('click',function(event){
dacmCopyPassword();

});

modal.addEventListener("click",(e)=>{
    if(e.target === modal){
        dacmCloseModal();
    }
});


async function getUsers() {

    const patRef = collection(db, "Patients");
    const docRef = collection(db, "Doctors");
    const admRef = collection(db, "Admin");


    // Run queries in parallel
    const [patsnap, docsnap, admsnap] = await Promise.all([
        getDocs(patRef),
        getDocs(docRef),
        getDocs(admRef)
    ]);

    patientsMap = patsnap.docs.map(d => ({ id: d.id, ...d.data() }));
    doctorsMap = docsnap.docs.map(d => ({ id: d.id, ...d.data() }));
    adminsMap  = admsnap.docs.map(d => ({ id: d.id, ...d.data() }));

    document.getElementById("total-pat").innerText = patientsMap.length;
    document.getElementById("total-doc").innerText = doctorsMap.length;
    document.getElementById("total-doc2").innerText = doctorsMap.length;

    active = 0;

    console.log(patientsMap);
    tbody.innerHTML = "";

    for (let data of doctorsMap) {

        if (data.Status === "Active") active++;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${data.Name}</td>
            <td><span class="specialty-tag">${data.Speciality}</span></td>
            <td>${data.PhoneNumber}</td>
            <td>${data.Email}</td>
            <td>₹${data.ConsultFee}</td>

            <td>
                <label class="toggle-switch">
                    <input type="checkbox" ${data.Status === "Active" ? "checked" : ""} data-name="${data.Name}">
                    <span class="slider">
                        <span class="label-on">Active</span>
                        <span class="label-off">Deactivate</span>
                    </span>
                </label>
            </td>

            <td>
                <div class="action-buttons-cell">
                    <button class="btn-icon delete" data-name="${data.Name}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        fragment.appendChild(tr);
    }

    tbody.appendChild(fragment);

    document.getElementById("total-active").innerText = active;
    patientsMap.forEach(doc => {
        addPatientRow(doc);
    });
}
document.querySelector("#tbod").addEventListener("click", function(e) {

    const button = e.target.closest("button");

    if (button && button.classList.contains("delete")) {

        const doctorName = button.dataset.name;
        deleteDoctor(doctorName);

    }

});


document.querySelector("#tbod").addEventListener("change", function(e){

    if(e.target.matches(".toggle-switch input")){

        const checkbox = e.target;
        const doctorName = checkbox.dataset.name;

        if(checkbox.checked){
            console.log(doctorName + " Activated");
        }else{
            console.log(doctorName + " Deactivated");
        }

    }

});
async function deleteDoctor(dname) {

    Swal.fire({
        title: "Delete Doctor?",
        text: "This will permanently remove the doctor account.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel"
    }).then((result) => {

        if (result.isConfirmed) 
        {
            

            Swal.fire({
                title: "Deleted!",
                text: "Doctor account has been removed.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            let id=null;
            for(let docdata of doctorsMap)
            {
                console.log(docdata.id);
                if(docdata.Name === dname){
                    id=docdata.id;
                    break;
                }
            }
            console.log(id);
            deleteDoc(doc(db, "Doctors", id));
            deleteDoctorByName(dname);
            doctorsMap = doctorsMap.filter(d => d.Name !== dname);
            const button = document.querySelector(`button.delete[data-name="${dname}"]`);
            const row = button.closest("tr");
            row.remove();
        
        }

    });
}
async function deleteDoctorByName(name) {

    const q = query(
        collection(db, "Users"),
        where("Name", "==", name)
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (document) => {

        await deleteDoc(doc(db, "Users", document.id));

        console.log("Deleted doctor with ID:", document.id);

    });
    active = doctorsMap.filter(d => d.Status === "Active").length;
    document.getElementById("total-doc").innerText = doctorsMap.length;
    document.getElementById("total-doc2").innerText = doctorsMap.length;
     document.getElementById("total-active").innerText = active;

}

//Filter Doctors data by Specialities.
document.getElementById("special-tag").addEventListener("change", function() 
{

    let value = this.value;
    console.log(value);
    let filteredDocs=null;
    
    if(value == "All Specialties")
    {
        filteredDocs=doctorsMap;
    }
    else{
        filteredDocs = doctorsMap.filter(doc => doc.Speciality == value);
    }
    tbody.innerHTML="";
    console.log(filteredDocs);

    for (let data of filteredDocs) 
    {


        const tr = document.createElement("tr");

        tr.innerHTML = `
                <td>${data.Name}</td>
                <td><span class="specialty-tag">${data.Speciality}</span></td>
                <td>${data.PhoneNumber}</td>
                <td>${data.Email}</td>
                <td>₹${data.ConsultFee}</td>

                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" ${data.Status === "Active" ? "checked" : ""} data-name="${data.Name}">
                        <span class="slider">
                            <span class="label-on">Active</span>
                            <span class="label-off">Deactivate</span>
                        </span>
                    </label>
                </td>

                <td>
                    <div class="action-buttons-cell">
                        <button class="btn-icon delete" data-name="${data.Name}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
        `;

        fragment.appendChild(tr);


        tbody.appendChild(fragment);
    }

    

    

});

//Filter Doctors data by Status.
document.getElementById("status-tag").addEventListener("change", function() 
{

    let value = this.value;
    console.log(value);
    let filteredDocs=null;
    
    if(value == "All Status")
    {
        filteredDocs=doctorsMap;
    }
    else{
        filteredDocs = doctorsMap.filter(doc => doc.Status == value);
    }
    tbody.innerHTML="";
    console.log(filteredDocs);

    for (let data of filteredDocs) 
    {


        const tr = document.createElement("tr");

        tr.innerHTML = `
                <td>${data.Name}</td>
                <td><span class="specialty-tag">${data.Speciality}</span></td>
                <td>${data.PhoneNumber}</td>
                <td>${data.Email}</td>
                <td>₹${data.ConsultFee}</td>

                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" ${data.Status === "Active" ? "checked" : ""} data-name="${data.Name}">
                        <span class="slider">
                            <span class="label-on">Active</span>
                            <span class="label-off">Deactivate</span>
                        </span>
                    </label>
                </td>

                <td>
                    <div class="action-buttons-cell">
                        <button class="btn-icon delete" data-name="${data.Name}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
        `;

        fragment.appendChild(tr);


        tbody.appendChild(fragment);
    }

    

    

});

async function UpdateStatus(name, isChecked) 
{

    let user = doctorsMap.find(doc => doc.Name === name);
    if (!user) return;

    let newStatus = isChecked ? "Active" : "Inactive";
    if(newStatus == "Inactive")
        document.getElementById("total-active").innerText = active=active-1;
    else
        document.getElementById("total-active").innerText = active +=1;

    Swal.fire({
        title: `${newStatus} Doctor?`,
        text: `Are you sure you want to ${newStatus.toLowerCase()} this doctor account?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#00a8cc",
        cancelButtonColor: "#6c757d",
        confirmButtonText: `Yes, ${newStatus}`,
        cancelButtonText: "Cancel"
    }).then(
        async (result) => {

        if (result.isConfirmed) {

            const id = user.id;

            await updateDoc(doc(db, "Doctors", id), {
                Status: newStatus
            });

            // update local data
            user.Status = newStatus;

            Swal.fire({
                title: "Updated!",
                text: `Doctor is now ${newStatus}.`,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

        } else {

            // revert toggle if admin cancels
            const checkbox = document.querySelector(`input[data-name="${name}"]`);
            checkbox.checked = !isChecked;
        }

    });
}

document.addEventListener("change", function(e) {

    if (e.target.matches('.toggle-switch input')) {

        const name = e.target.dataset.name;
        const isChecked = e.target.checked;

        console.log("Doctor:", name);
        console.log("Checked:", isChecked);

        UpdateStatus(name, isChecked);
    }

});

// 🔥 PHOTO UPLOAD LOGIC


// Preview image
photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedImage = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            photoPreview.style.backgroundImage = `url(${e.target.result})`;
            photoPreview.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }
});

// Save photo (ImgBB + Firestore)
async function uploadAndGetURl(){
     try {
        // Upload to ImgBB
        imageUrl = await uploadToImgBB(selectedImage); 
        console.log("URL from UA ",imageUrl); 
          
        
    } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Try again.');
    } finally {
        // saveBtn.textContent = 'Save Photo';
        // saveBtn.disabled = false;
        photoInput.value = '';
        photoPreview.classList.remove('has-image');
        photoPreview.style.backgroundImage = '';
        selectedImage = null;
    }
}

// ImgBB upload function
async function uploadToImgBB(file) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', '7fe129613a33f5e3e2c36b65609632b7'); // Your free key
    
    const response = await fetch('https://api.imgbb.com/1/upload?expiration=0', {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    return data.data.url;
}

async function get_Appointments()
{
    const q = query(
            collection(db, "Appointments"),
        );
    
        const snap = await getDocs(q);
    
        // Convert all docs to JS objects
        appointmentsmap = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        for(let obj of appointmentsmap)
        {
            addAppointmentRow(obj);
        }
        renderAppointmentTable(appointmentsmap);
        
        document.getElementById("adm-ttlapt-count").innerText=appointmentsmap.length;
        document.getElementById("adm-ttlapt-count2").innerText=appointmentsmap.length;
    
        const pendingCount = appointmentsmap.filter(apt => 
        apt.Status === "Pending"
        ).length;
        document.getElementById("adm-pend").innerText=pendingCount;

        const progressCount = appointmentsmap.filter(apt => 
        apt.Status === "In-progress"
        ).length;
        document.getElementById("adm-inprog").innerText=progressCount;

        const canCount = appointmentsmap.filter(apt => 
        apt.Status === "Cancelled"
        ).length;
        document.getElementById("adm-can").innerText=canCount;

    


}

function addAppointmentRow(appointment) {
    const table = document.getElementById("bodyy");

    const row = document.createElement("tr");

    row.innerHTML = `
        <td style="font-weight : 600;">#${appointment.AppointmentID}</td>
        <td>${appointment.PatientName}</td>
        <td>${appointment.DoctorName}</td>
        <td>${formatAppointmentDateTime(appointment.AppointmentDate, appointment.AppointmentTime)}</td>
        <td><span class="status ${getStatusClass(appointment.Status)}">
            ${appointment.Status}
        </span></td>
    `;

    table.appendChild(row);
}
function formatAppointmentDateTime(dateStr, time24) {
    // Combine date + time
    const dateTime = new Date(`${dateStr}T${time24}`);

    const now = new Date();

    // Remove time for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const inputDateOnly = new Date(dateTime);
    inputDateOnly.setHours(0, 0, 0, 0);

    // Convert time to 12-hour format
    const formattedTime = dateTime.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    if (inputDateOnly.getTime() === today.getTime()) {
        return `Today, ${formattedTime}`;
    } 
    else if (inputDateOnly.getTime() === yesterday.getTime()) {
        return `Yesterday, ${formattedTime}`;
    } 
    else if (inputDateOnly.getTime() === tomorrow.getTime()) {
        return `Tomorrow, ${formattedTime}`;
    } 
    else {
        // fallback format
        return dateTime.toLocaleDateString() + `, ${formattedTime}`;
    }
}

function getStatusClass(status) {
    switch (status) {
        case "Completed":
            return "completed";
        case "In-progress":
            return "confirmed";
        case "Pending":
            return "pending";
        case "Cancelled":
            return "cancelled";
        default:
            return "pending"; // fallback
    }
}

document.getElementById("f1").addEventListener("click", function(e)
{
    if(appointmentsmap.length != 0)
        renderAppointmentTable(appointmentsmap);
});
document.getElementById("f2").addEventListener("click", function(e)
{
    if(appointmentsmap.length != 0){
        let map = appointmentsmap.filter(app =>
        app.Status === "Pending"
        );
            renderAppointmentTable(map);
    }



});
document.getElementById("f3").addEventListener("click", function(e){
    let map = appointmentsmap.filter(app =>
    app.Status === "In-progress"
    );
    
    renderAppointmentTable(map);

});
document.getElementById("f4").addEventListener("click", function(e){
    let map = appointmentsmap.filter(app =>
    app.Status === "Completed"
    );
    
    renderAppointmentTable(map);

});
document.getElementById("f5").addEventListener("click", function(e){
    let map = appointmentsmap.filter(app =>
    app.Status === "Cancelled"
    );
    
    renderAppointmentTable(map);

});



function renderAppointmentTable(appointmentMap) {

    const tbody = document.getElementById("bodddy");
    tbody.innerHTML = ""; 

    if(appointmentsmap.length == 0){
        tbody.innerHTML="";
        return;
    }
        

    // Only slice rows according to rowsToShow
    console.log(appointmentMap.length);
    const visibleRows = appointmentMap.slice(0, 50);

    visibleRows.forEach(app => {

        let statusClass = "";
        let statusLabel = app.Status;

        switch (app.Status) {
            case "Completed":
                statusClass = "completed";
                break;
            case "In-progress":
                statusClass = "active";
                statusLabel = "In Progress";
                break;
            case "Pending":
                statusClass = "pending";
                break;
            case "Cancelled":
                statusClass = "cancelled";
                break;
            case "Confirmed":
                statusClass = "confirmed";
                break;
            default:
                statusClass = "pending";
        }

        let actionButtons = "";

        if (app.Status === "Pending") {
            actionButtons = `
                <button class="btn-icon view" title="View" ><i class="fas fa-eye"></i></button>
               <div class="action-buttons-cell">
                    <button class="btn-icon delete" data-id="${app.AppointmentID}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        } 
        else if (app.Status === "In-progress" || app.Status === "Confirmed") {
            actionButtons = `
                <button class="btn-icon view" title="View"><i class="fas fa-eye"></i></button>
               <div class="action-buttons-cell">
                    <button class="btn-icon delete" data-id="${app.AppointmentID}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        } 
        else {
            actionButtons = `
                <button class="btn-icon view" title="View" ><i class="fas fa-eye"></i></button>

                `;
        }

        const formattedTimedate =formatAppointmentDateTime(app.AppointmentDate, app.AppointmentTime);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td style="font-weight: 700;">${app.AppointmentID}</td>
            <td>${app.PatientName}</td>
            <td>${app.DoctorName}</td>
            <td>${formattedTimedate}</td>
            <td>${app.AppointmentType.toUpperCase() || "Consultation"}</td>
            <td><span class="status ${statusClass}">${statusLabel}</span></td>

            <td>
                <div class="action-buttons-cell">
                    ${actionButtons}
                </div>
            </td>
        `;

        tbody.appendChild(tr);
        tr.dataset.app = JSON.stringify(app);
    });

    
}

document.querySelector("#bodddy").addEventListener("click", function(e) {

    const button = e.target.closest("button");

    if (button && button.classList.contains("delete")) {

        const aptID = button.dataset.id;
        deleteapt(aptID);

    }

    const viewBtn = e.target.closest(".btn-icon.view");
    if (viewBtn) {
        const row = viewBtn.closest("tr");
        const app = JSON.parse(row.dataset.app);

        showAppointmentDetails(app);    // your Swal popup
        return;
    }
    

});

async function deleteapt(aptid) {

    Swal.fire({
        title: "Delete Appointment?",
        text: "This will permanently remove the Appointment.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel"
    }).then((result) => {

        if (result.isConfirmed) 
        {

            
            Swal.fire({
                title: "Deleted!",
                text: "Appointment has been removed.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
           
            deleteAppointment(aptid);
            const button = document.querySelector(`button.delete[data-id="${aptid}"]`);
            const row = button.closest("tr");
            row.remove();
        
        }

    });
}

async function deleteAppointment(aptId) {
    try {
        // 🔹 1. Delete from Appointments collection
        const aptQuery = query(
            collection(db, "Appointments"),
            where("AppointmentID", "==", aptId)
        );

        const aptSnapshot = await getDocs(aptQuery);

        for (const docSnap of aptSnapshot.docs) {
            await deleteDoc(docSnap.ref);
        }

        // 🔹 2. Update Slots (mark as available again)
        let aptdata="";
        aptdata=appointmentsmap.find(apt => 
        apt.AppointmentID === aptId
        );
        const slotQuery = query(
            collection(db, "Slots"),
            where("AppointmentDate", "==", aptdata.AppointmentDate),
            where("AppointmentTime", "==", aptdata.AppointmentTime)
        );

        const slotSnapshot = await getDocs(slotQuery);

        for (const docSnap of slotSnapshot.docs) {
            await deleteDoc(docSnap.ref);
        }

        console.log("Appointment deleted successfully");

    } catch (error) {
        console.error("Error deleting appointment:", error);
    }
}

function showAppointmentDetails(apt) 
{
            console.log("Entered Pop functions");
            let sta=null;

          
        switch (apt.Status) {
            case "Completed":
                sta = "completed";
                break;
            case "In-progress":
                sta = "active";
                break;
            case "Pending":
                sta = "pending";
                break;
            case "Cancelled":
                sta = "cancelled";
                break;
            case "Confirmed":
                sta = "confirmed";
                break;
            default:
                sta = "pending";
        }


    Swal.fire({
        title: 'Appointment Details',
        width: '700px',
        html: `
            <div class="appointment-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h3 style="margin: 0; color: #274cb4; font-size: 22px;">📋 Patient Appointment</h3>
                    <span class="status ${sta} ">${apt.Status}</span>
                </div>
                
                <div class="patient-info">
                    <div class="info-item">
                        <div class="info-label">Patient Name</div>
                        <div class="info-value">${apt.PatientName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Age</div>
                        <div class="info-value">${apt.PatientAge}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone</div>
                        <div class="info-value" ></div>${apt.PatientPhone}
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${apt.PatientEmail}</div>
                    </div>
                </div>
                
                <div class="appointment-info">
                    <div class="info-item">
                        <div class="info-label">Doctor</div>
                        <div class="info-value doctor-name">${apt.DoctorName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Date</div>
                        <div class="info-value">${apt.AppointmentDate}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Time</div>
                        <div class="info-value">${apt.AppointmentTime}</div>
                    </div>
                </div>
                
                <div class="info-item symptoms-box">
                    <div class="info-label">Symptoms / Reason for Visit</div>
                    <div class="info-value" style="font-size: 15px; line-height: 1.6; color: #1b1b1b;">
                        ${apt.Symptoms}
                    </div>
                </div>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Close',
        confirmButtonColor: '#3b82f6',
        customClass: {
            confirmButton: 'swal2-confirm-custom'
        },
        buttonsStyling: false,
        allowOutsideClick: true,
        allowEscapeKey: true
    });
}


function searchAppointments(query) {
    query = query.trim().toLowerCase();

    return appointmentsmap.filter(apt => {
        return (
            apt.AppointmentID?.toLowerCase().includes(query) ||
            apt.PatientName?.toLowerCase().includes(query) ||
            apt.DoctorName?.toLowerCase().includes(query) ||
            apt.Date?.toLowerCase().includes(query) ||
            apt.Time?.toLowerCase().includes(query) ||
            apt.Status?.toLowerCase().includes(query)
        );
    });
}

// ===============================
// SEARCH EVENT (DEBOUNCE)
// ===============================
let timeout;

document.getElementById("Searchapt").addEventListener("input", function () {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        const query = this.value;

        if (!query) {
            renderAppointmentTable(appointmentsmap);
            return;
        }

        const filtered = searchAppointments(query);
        renderAppointmentTable(filtered);
    }, 300);
});

const patBody = document.getElementById("patbody");




function addPatientRow(patient) {
    const tr = document.createElement("tr");

    
    tr.innerHTML = `
        <td>${patient.Name}</td>
        <td>${patient.Age}</td>
        <td>${patient.PhoneNumber}</td>
        <td>${patient.Email}</td>
        <td><span class="blood-tag">${patient.BloodGroup}</span></td>
        <td>
            <div class="action-buttons-cell">
                <button class="btn-icon view" data-email="${patient.Email}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon delete" data-email="${patient.Email}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    patBody.appendChild(tr);
}

patBody.addEventListener("click", async (e) => {

    const viewBtn = e.target.closest(".view");
    const deleteBtn = e.target.closest(".delete");

    // VIEW BUTTON
    if (viewBtn) {
        const patientem = viewBtn.dataset.email;

    let pat= patientsMap.find(p => p.Email === patientem);
    showPatientsDetails(pat);
    }

    // DELETE BUTTON
    if (deleteBtn) 
        {
        const patientem = deleteBtn.dataset.email;

      
        Swal.fire({
    title: "Delete Patient?",
    text: "This action cannot be undone",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it"
    }).then(async (result) => {
    if (result.isConfirmed) 
        {
        // delete logic here
          try {
            // delete from Firebase
            const q = query(collection(db, "Patients"), where("Email", "==", patientem));
            const snapshot = await getDocs(q);

            snapshot.forEach(async (docItem) => {
                await deleteDoc(doc(db, "Patients", docItem.id));
            });

            const que = query(collection(db, "Users"), where("Email", "==", email));
            const snap = await getDocs(que);
            await deleteDoc(doc(db, "Users", snap.docs[0].id));



            

            // remove row from UI
            deleteBtn.closest("tr").remove();

            Swal.fire({
            title: "Deleted!",
            text: "Patient account has been deleted successfully.",
            icon: "success",
            confirmButtonText: "OK",
            timer: 2000,
            timerProgressBar: true
            });

        } catch (err) {
            console.error(err);
            alert("Error deleting patient");
        }


    }
    });

      
    }

});

function showPatientsDetails(pat) 
{

    Swal.fire({
        title: 'Patient Details',
        width: '700px',
        html: `
            <div class="appointment-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h3 style="margin: 0; color: #274cb4; font-size: 22px;">📋 Patient Appointment</h3>
                    <span class="status active ">Active</span>
                </div>
                
                <div class="patient-info">
                    <div class="info-item">
                        <div class="info-label">Patient Name</div>
                        <div class="info-value">${pat.Name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Age</div>
                        <div class="info-value">${pat.Age}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone</div>
                        <div class="info-value" ></div>${pat.PhoneNumber}
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${pat.Email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Gender</div>
                        <div class="info-value">${pat.Gender}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Blood Group</div>
                        <div class="info-value">${pat.BloodGroup}</div>
                    </div>
                </div>
            
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Close',
        confirmButtonColor: '#3b82f6',
        customClass: {
            confirmButton: 'swal2-confirm-custom'
        },
        buttonsStyling: false,
        allowOutsideClick: true,
        allowEscapeKey: true
    });
}


document.getElementById("g1").addEventListener("click", function(e){
    patBody.innerHTML="";
   patientsMap.forEach(doc => {
        addPatientRow(doc);
    });

});
document.getElementById("g2").addEventListener("click", function(e){
   patBody.innerHTML="";
    let map = patientsMap.filter(app =>
    app.Gender === "Male"
    );
    map.forEach(doc => {
        addPatientRow(doc);
    });
});
document.getElementById("g3").addEventListener("click", function(e){
   patBody.innerHTML="";
    let map = patientsMap.filter(app =>
    app.Gender === "Female"
    );
   map.forEach(doc => {
        addPatientRow(doc);
    });
});




var form1= document.getElementById("prof-form");

form1.addEventListener('submit', async(e)=>{

    e.preventDefault();
     const name = document.getElementById("admname").value;
    const email = document.getElementById("admemail").value;
    const phone = document.getElementById("admphone").value;

    // Extra validations
   

    if (phone.length < 10) {
        return Swal.fire("Invalid Phone Number");
    }

     try {
        // 🔍 Find doc using email
        const q = query(
            collection(db, "Admin"),
            where("Email", "==", email)
        );

        const snap = await getDocs(q);


        // ✅ Get first doc (only one assumed)
        const docId = snap.docs[0].id;

        // 🔄 Update
        await updateDoc(doc(db, "Admin", docId), {
            FullName: name,
            Phone: phone,
            Email: email
        });

        Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Admin updated successfully"
        });

    } catch (err) {
        console.error(err);
        Swal.fire("Error updating admin");
    }
   

});

var form2= document.getElementById("hosp-form");

form2.addEventListener('submit', async(e)=>{

    e.preventDefault();
     const hospname = document.getElementById("adm-hosp").value;
    const hospaddre = document.getElementById("hosp-address").value;
    const hosphone = document.getElementById("adm-phone").value;

    // Extra validations
   

    if(hospname.length == 0)
       return Swal.fire("Required Hospital Name"); 

    if (hosphone.length < 10) {
        return Swal.fire("Invalid Phone Number");
    }

    if(hospaddre.length == 0)
        return Swal.fire("Required Hospital Address");

     try {
        // 🔍 Find doc using email
        const q = query(
            collection(db, "Admin"),
            where("Email", "==", email)
        );

        const snap = await getDocs(q);


        // ✅ Get first doc (only one assumed)
        const docId = snap.docs[0].id;

        // 🔄 Update
        await updateDoc(doc(db, "Admin", docId), {
            "HospitalName" : hospname,
            "HospitalPhone" : hosphone,
            "HospitalAddress": hospaddre
        });

        Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Admin updated successfully"
        });

    } catch (err) {
        console.error(err);
        Swal.fire("Error updating admin");
    }
   

});

async function getAdminByEmail(email) {
    try {
        const q = query(
            collection(db, "Admin"),
            where("Email", "==", email)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("No admin found");
            return null;
        }

        // ✅ Get first matching doc
        const docSnap = snapshot.docs[0];

        // 🔹 All fields inside document
        const adminData = docSnap.data();

        // 🔹 Optional: include document ID
        admData= {
            id: docSnap.id,
            ...adminData
        };
    document.getElementById("adm-hosp").value=admData.HospitalName;
    document.getElementById("hosp-address").value=admData.HospitalAddress;
    document.getElementById("adm-phone").value=admData.HospitalPhone;
    document.getElementById("admname").value=admData.FullName;
    document.getElementById("admemail").value=admData.Email;
    document.getElementById("admphone").value=admData.Phone;




    } catch (error) {
        console.error("Error fetching admin:", error);
        return null;
    }
}