import { db } from "./Firebase.js";
import {collection, addDoc, getDocs,doc,updateDoc, query, where,runTransaction,serverTimestamp, limit} from  "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
  

var email=sessionStorage.getItem("email");
var name=sessionStorage.getItem("name");
check_for_Credentials();
getDoctors();
var userData=null, doct=null;
var doctorsList=null;
var appointmentsList=null;
// DOM Elements
const docList = document.getElementById('doctors-list');
const doctorSearch = document.getElementById('doctorSearch');
const filterBtns = document.querySelectorAll('.filter-btn');
const profilePanel = document.getElementById('doctorProfilePanel');
const backBtn = document.getElementById('backBtn');
const panelOverlay = document.getElementById('panelOverlay');
const profilePlaceholder = document.getElementById('profilePlaceholder');
const doctorProfile = document.getElementById('doctorProfile');

document.getElementById("appointmentDate")
    .addEventListener("change", handleDateChange);

// var grid = document.getElementById('doctors-grid');
// grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
document.addEventListener('DOMContentLoaded',function(){

    console.log('DOM ready');
    initCompactCalendar();

});

document.getElementById("logoutn").addEventListener('click', function(e){
    sessionStorage.clear();
    localStorage.clear();
    window.location.replace("login.html");

});





document.addEventListener("dblclick", function(event) {
    event.preventDefault();
});



// When profile icon is clicked
document.getElementById("propic").onclick = function () {
    const panel = document.getElementById("profilePanel");
    panel.classList.add("show");    

    // Load sessionStorage data

    console.log(userData.Name, userData.Gender, userData.Email);
    document.getElementById("pName").value = userData.Name;
    document.getElementById("pEmail").value = userData.Email;
    document.getElementById("pAge").value = userData.Age;
    document.getElementById("pBlood").value = userData.BloodGroup;
    document.getElementById("pPhone").value = userData.PhoneNumber;
    document.getElementById("pGender").value = userData.Gender;
    document.getElementById("pPassword").value = userData.Password  ;
};

// Close panel
document.getElementById("closePanel").onclick = function () {
    document.getElementById("profilePanel").classList.remove("show");
};



function check_for_Credentials()
{
    console.log("Name : ",name);
    if(email !=null && name !=null)
    {
        getUserbyEmail(email);
        document.getElementById('nametag').style.display='block';
        document.getElementById('profile').style.display='block';
        document.getElementById('prole').style.display='block';
        document.getElementById('logbt').style.display='none';
        document.getElementById('regbt').style.display='none';
        document.getElementById('nametag').innerHTML=name;
        document.getElementById('alert-wrapper').style.display='block';
        
    }
    else{
         document.getElementById('nametag').style.display='none'
        document.getElementById('profile').style.display='none';
        document.getElementById('prole').style.display='none';
        document.getElementById('logbt').style.display='block';
        document.getElementById('regbt').style.display='block';
         document.getElementById('alert-wrapper').style.display='none';
    }
}

async function getDoctors(){

    const ref = collection(db, "Doctors");

    const q = query(ref, where("Status", "==", "Active"));

    const snap = await getDocs(q);

    const result = snap.docs.map(doc => {
        const data = doc.data();

        return {
            Name : data.Name,
            Email : data.Email,
            PhoneNumber : data.PhoneNumber,
            Password : data.Password,
            Speciality : data.Speciality,
            ConsultFee : data.ConsultFee,
            Status : status,
            Experience : data.Experience,
            Bio : data.Bio,
            ImgUrl : data.ImgUrl,
            clinic: "HeartCare Medical Center",
            languages: "English",
            rating: 4.5,
            education : data.education,
            Start_time: data.Start_time,
            End_time: data.End_time,
            Break_start:data.Break_start ,
            Break_end: data.Break_end
        };
    });

    console.log("Active Doctors :", result);

    doctorsList = result;
    renderDoctors(doctorsList);
    setupEventListeners();
    

}


async function getUserbyEmail(email)
{
    const dab=collection(db,"Patients");
    const q=query(dab, where("Email","==",email));
    const snap=await getDocs(q);

    console.log(snap.docs.length);
    if(snap.empty)
    {
        console.log("No data found for this Profile");
        return null;
    }
    const docsnap=snap.docs[0];
    const doc=docsnap.data();
    console.log( "Patients : ",doc);
    userData= {
        Name : doc.Name,
        Email : doc.Email,
        PhoneNumber : doc.PhoneNumber,
        Password : doc.Password,
        Age : doc.Age,
        Gender: doc.Gender,
        BloodGroup : doc.BloodGroup,
        EmergencyPH : doc.EmergencyPH
    };

    //Auto-Filling patient's details in Appointment Form
    document.getElementById("patientName").value=doc.Name;
    document.getElementById("patientEmail").value=doc.Email;
    document.getElementById("patientAge").value=doc.Age;
    document.getElementById("patientPhone").value=doc.PhoneNumber;

    //Initializing Calendar with data.
    getAppointmentsByEmail(doc.Email);





}

function showLoginAlert() {

    Swal.fire({
        title: "Login Required",
        text: "Please login before booking an appointment or viewing Doctor's.",
        icon: "warning",
        confirmButtonColor: "#00a8cc",
        confirmButtonText: "Login",
        showCancelButton: true,
        cancelButtonText: "Cancel"
    }).then((result) => {

        if (result.isConfirmed) {
            window.location.href = "Login.html";
        }

    });
}

document.addEventListener("click", function(e) 
{
    //console.log(e.target.name,"Yes");

    if (e.target.matches('#bookbt') || e.target.matches('#viewdocbt') || e.target.matches("#commonBookBT")
         || e.target.matches("#PatientAptbt")) {

        //const email = e.target.dataset.name;
        if(!email || !name)
            showLoginAlert();

    }

   const btn = e.target.closest("#doc-pro-show-apt-bt");

    if(btn)
        {
            closeProfilePanel();
            const email = btn.dataset.email;
            const name = btn.dataset.name;
            document.getElementById("pat-apt-form-docname").value=name;
            document.getElementById("pat-apt-form-docname").style.backgroundColor='rgba(192, 189, 189, 0.7)';
            document.getElementById("appointments").scrollIntoView({
                behavior: "smooth"  
                });
            document.getElementById("appointmentDate").disabled=false;
            document.getElementById("appointmentTime").disabled=false;
           

    }

});

let currentFilter = 'all';


    
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    console.log("Search : ",query);
    const filtered = doctorsList.filter(doctor => 
        doctor.Name.toLowerCase().includes(query) ||
        doctor.Speciality.toLowerCase().includes(query)
    );
    renderDoctors(filtered);
}

function handleFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    currentFilter = filter;
    
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    let filtered = doctorsList;
    if (filter !== 'all') {
        filtered = doctorsList.filter(doctor => 
            doctor.Speciality.toLowerCase().includes(filter.toLowerCase())
        );
    }
    
    renderDoctors(filtered);
}

function setupEventListeners() {
    doctorSearch.addEventListener('input', handleSearch);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
    
    backBtn.addEventListener('click', closeProfilePanel);
    panelOverlay.addEventListener('click', closeProfilePanel);
    
    docList.addEventListener('click', handleDoctorSelect);
}

function renderDoctors(doctors) 
{
    console.log("Doctors List : ",doctors);
    docList.innerHTML = '';
    
    if (doctors.length == 0) {
        console.log("EMpty List");
        docList.innerHTML = `
            <div class="no-results" style="text-align: center; padding: 60px 20px; color: var(--text-light);">
                <i class="fas fa-search" style="font-size: 64px; margin-bottom: 25px; ;"></i>
                <h4>No doctors found</h4>
                <p style="max-width: 400px; margin: 0 auto;">Try adjusting your search terms or use different filters to find the right specialist.</p>
            </div>
        `;
        return;
    }
    
    doctors.forEach(doctor => {
        const doctorItem = createDoctorListItem(doctor);
        docList.appendChild(doctorItem);
    }); 
}

function createDoctorListItem(doctor) {
    const div = document.createElement('div');
    div.className = 'doctor-list-item';
    div.dataset.Email = doctor.Email;
    
    const stars = generateStars(doctor.rating);
    
    div.innerHTML = `
        <div class="doctor-avatar">
            <img id="docimg" src="${doctor.ImgUrl}"></img>
        </div>
        <div class="doctor-list-info" data-email="${doctor.Email}">
            <h4>${doctor.Name}</h4>
            <p class="specialty">${doctor.Speciality}</p>
            <div class="rating">
                ${stars}
                <span style="font-weight: 600; margin-left: 8px;">${doctor.rating}</span>
            </div>
        </div>
    `;
    
    return div;
}

function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalf) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function handleDoctorSelect(e) {
    const doctorItem = e.target.closest('.doctor-list-item');
    if (!doctorItem) return;

    document.querySelectorAll('.doctor-list-item').forEach(item => {
        item.classList.remove('active');
    });

    doctorItem.classList.add('active');

    const email = doctorItem.dataset.Email;

    const doctor = doctorsList.find(d => d.Email === email);

    console.log("Doctor:", doctor);

    showDoctorProfile(doctor);
}

function showDoctorProfile(doctor) {
    profilePlaceholder.style.display = 'none';
    let doctorAvail="NA";
    if(doctor.Start_time != null)
        doctorAvail=`${doctor.Start_time} - ${doctor.End_time}`
    doctorProfile.innerHTML = `
        <div class="profile-header-content">
            <div class="profile-avatar-large">
                <img id="showprodoc" src=${doctor.ImgUrl}></img>
            </div>
            <h2>${doctor.Name}</h2>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                <span class="specialty-badge">${doctor.Speciality}</span>
                <div class="profile-rating-small">
                    ${generateStars(doctor.rating)}
                    <span style="font-weight: 600;">${doctor.rating}</span>
                </div>
            </div>
        </div>
        </div>
            <div class="about-section">
            <h4>About ${doctor.Name}</h4>
            <p style=" line-height: 1.7; margin-top: 15px;">
                ${doctor.Bio}
            </p>
        </div>
        
        <div class="profile-details-grid">
            <div class="detail-card">
                <i class="fas fa-briefcase-medical"></i>
                <div>
                    <h4>Experience</h4>
                    <p>${doctor.Experience}</p>
                </div>
            </div>
            <div class="detail-card">
                <i class="fas fa-graduation-cap"></i>
                <div>
                    <h4>Education</h4>
                    <p>${doctor.education}</p>
                </div>
            </div>
            <div class="detail-card">
                <i class="fas fa-clock"></i>
                <div>
                    <h4>Availability</h4>
                    <p>${doctorAvail}</p>
                </div>
            </div>
            <div class="detail-card">
                <i class="fas fa-globe"></i>
                <div>
                    <h4>Languages</h4>
                    <p>${doctor.languages}</p>
                </div>
            </div>
        </div>
        
        <div class="contact-section">
            <h4 style="margin-bottom: 20px;">Contact Information</h4>
            <div class="contact-item">
                <i class="fas fa-phone"></i>
                <span>${doctor.PhoneNumber}</span>
            </div>
            <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <span>${doctor.Email}</span>
            </div>
            <div class="contact-item">
                <i class="fas fa-hospital"></i>
                <span>${doctor.clinic}</span>
            </div>
        </div>
        
        <div class="profile-actions">
            <button class="btn btn-primary btn-large" id="doc-pro-show-apt-bt" data-email ="${doctor.Email}" data-name ="${doctor.Name}">
                <i class="fas fa-calendar-check"></i> Book Appointment
            </button>
            
        
    `;

    doctorProfile.classList.add('active');
    openProfilePanel();
   
}



function openProfilePanel() {
    profilePanel.classList.add('active');
    panelOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeProfilePanel() {
    profilePanel.classList.remove('active');
    panelOverlay.classList.remove('active');
    document.querySelectorAll('.doctor-list-item').forEach(item => {
        item.classList.remove('active');
    });
    profilePlaceholder.style.display = 'block';
    doctorProfile.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
}

// Close panel with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && profilePanel.classList.contains('active')) {
        closeProfilePanel();
    }
});

// ============================================================================
// FIXED COMPACT PATIENT CALENDAR - March 2026 Demo Data
// ============================================================================

// March 2026 Demo Data - Fixed dates that actually work!
// ============================================================================
// COMPACT PATIENT CALENDAR - FIXED VERSION
// ============================================================================

// ============================================================================
// GLOBAL DATA
// ============================================================================

let appointmentsMap = new Map();

let currentMonth = 2;
let currentYear = 2026;
let selectedDate = null;

const dayHeaders = ['S','M','T','W','T','F','S'];


// ============================================================================
// LOAD APPOINTMENTS
// ============================================================================

async function getAppointmentsByEmail(email) {

    const q = query(
        collection(db, "Appointments"),
        where("PatientEmail", "==", email)
    );

    const snapshot = await getDocs(q);

    appointmentsList = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
    }));

    // Faster lookup map
    appointmentsMap = new Map(
        appointmentsList.map(a => [a.AppointmentDate, a])
    );

    console.log("Appointments Loaded:", appointmentsList);

    renderCompactCalendar();
}




// ============================================================================
// CALENDAR INIT
// ============================================================================

function initCompactCalendar() {
    console.log('Initializing calendar...');
    renderHeaders();
    renderCompactCalendar();
}

function renderHeaders() {

    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    grid.innerHTML = '';

    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        grid.appendChild(header);
    });
}


// ============================================================================
// CALENDAR RENDER
// ============================================================================

function renderCompactCalendar() {

    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);

    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const currentDateEl = document.getElementById('currentDate');

    if (currentDateEl) {
        currentDateEl.textContent =
            firstDay.toLocaleDateString('en-US',{
                month:'short',
                year:'numeric'
            });
    }

    while (grid.children.length > 7) {
        grid.removeChild(grid.lastChild);
    }

    for (let i = 0; i < 42; i++) {

        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const dayCell = createDayCell(date);
        grid.appendChild(dayCell);
    }
}


// ============================================================================
// CREATE DAY CELL
// ============================================================================

function createDayCell(date) {

    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = date.getDate();

    dayCell.appendChild(dayNumber);

    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        dayCell.classList.add('today');
    }

    const dateStr = date.toLocaleDateString('en-CA');

    const appointment = appointmentsMap.get(dateStr);

    if (appointment) {

        switch(appointment.Status){

            case 'In-progress':
                dayCell.classList.add('in-progress');
                break;

            case 'Pending':
                dayCell.classList.add('pending');
                break;
               
            case 'Completed':
                dayCell.classList.add('completed');    

            default:
                dayCell.classList.add('cancelled');
        }

        dayCell.title =
`${appointment.Status}
${appointment.AppointmentTime}
${appointment.DoctorName}`;
    }

    dayCell.addEventListener('click', function(e){

        e.stopPropagation();

        document.querySelectorAll('.day-cell')
        .forEach(c => c.classList.remove('selected'));

        dayCell.classList.add('selected');

        selectDate(date, appointment);
    });

    return dayCell;
}


// ============================================================================
// SELECT DATE
// ============================================================================

function selectDate(date, appointment) {

    selectedDate = date;

    const infoDiv = document.getElementById('selectedInfo');
    if (!infoDiv) return;

    if (appointment) {

        let statusColor;
        let statusText;
        let statusBg;
        let statusBadgeBg;

        switch(appointment.Status){

            case "In-progress":
                statusColor = "#51cf66";
                statusText = "In-Progress";
                statusBg = "rgba(81,207,102,0.15)";
                statusBadgeBg = "rgba(81,207,102,0.25)";
                break;

            case "Pending":
                statusColor = "#ffd43b";
                statusText = "Pending";
                statusBg = "rgba(255,212,59,0.15)";
                statusBadgeBg = "rgba(255,212,59,0.25)";
                break;

             case "Completed":
                statusColor = "#51cf66";
                statusText = "Completed";
                statusBg = "rgba(81,207,102,0.15)";
                statusBadgeBg = "rgba(81,207,102,0.25)";
                break;

            default:
                statusColor = "#ff6b6b";
                statusText = "Cancelled";
                statusBg = "rgba(255,107,107,0.15)";
                statusBadgeBg = "rgba(255,107,107,0.25)";
        }

        infoDiv.innerHTML = `
        <div class="appointment-details">

            <div class="appointment-date">
                ${date.toLocaleDateString('en-US',{
                    weekday:'short',
                    month:'short',
                    day:'numeric'
                })}
            </div>

            <div class="appointment-row"
                 style="background:${statusBg}">

                <div style="
                    width:10px;
                    height:10px;
                    border-radius:50%;
                    background:${statusColor}">
                </div>

                <span>
                    ${appointment.AppointmentTime} - ${appointment.DoctorName}
                </span>

                <span style="
                    margin-left:auto;
                    background:${statusBadgeBg};
                    color:${statusColor};
                    padding:4px 8px;
                    border-radius:12px;
                    font-size:0.75em;
                    font-weight:600">
                    ${statusText}
                </span>

            </div>

            <div class="notes">
                ${appointment.Symptoms || ""}
            </div>

        </div>`;
    }
    else{

        infoDiv.innerHTML = `
        <div style="text-align:center;padding:20px 0">

            No appointment

            <br>

            <small>
            ${date.toLocaleDateString('en-US',{
                weekday:'short',
                month:'short',
                day:'numeric'
            })}
            <br>
            Available for booking
            </small>

        </div>`;
    }
}


// ============================================================================
// MONTH NAVIGATION
// ============================================================================

function previousMonth(){

    currentMonth--;

    if(currentMonth < 0){
        currentMonth = 11;
        currentYear--;
    }

    renderCompactCalendar();
}

function nextMonth(){

    currentMonth++;

    if(currentMonth > 11){
        currentMonth = 0;
        currentYear++;
    }

    renderCompactCalendar();
}


// ============================================================================
// PUBLIC API
// ============================================================================

window.CompactCalendarAPI = {

    init: initCompactCalendar,
    previousMonth: previousMonth,
    nextMonth: nextMonth,

    goToToday: function(){
        currentMonth = new Date().getMonth();
        currentYear = new Date().getFullYear();
        renderCompactCalendar();
    }
};

window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.initCompactCalendar = initCompactCalendar;


// ============================================================================
// FORM SUBMIT
// ============================================================================

var aptform=document.getElementById("appointmentForm");
var submitBtn=document.getElementById("PatientAptbt");

let isSubmitting = false;

aptform.addEventListener("submit", async function(e) 
{

    e.preventDefault();

    if (isSubmitting) return;

     

    isSubmitting = true;

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const formData = {
    AppointmentID : generateAppointmentID(),
    PatientName : document.getElementById("patientName").value.trim(),
    PatientEmail : document.getElementById("patientEmail").value.trim(),
    PatientPhone : document.getElementById("patientPhone").value.trim(),
    PatientAge : document.getElementById("patientAge").value.trim(),
    DoctorName : document.getElementById("pat-apt-form-docname").value.trim(),
    AppointmentType : document.getElementById("appointmentType").value,
    AppointmentDate : document.getElementById("appointmentDate").value,
    AppointmentTime : document.getElementById("appointmentTime").value,
    Symptoms : document.getElementById("symptoms").value.trim(),
    Status : "Pending",
    createdAt : serverTimestamp()
    };

    function generateAppointmentID() {
        const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
        const rand = Math.floor(1000 + Math.random() * 9000); // 4 digit random
        return `APT-${date}-${rand}`;
    }

    console.log(formData);

    try{

    await addAppointment(formData);

    aptform.reset();

    Swal.fire({
        icon: "success",
        title: "Appointment Submitted",
        text: "Your appointment request has been submitted successfully. Kindly wait until your request as be Confirmed by the Doctor.",
        confirmButtonText: "Got it"
    });

    getAppointmentsByEmail(formData.PatientEmail);
    document.getElementById("appointmentDate").disabled=true;
    document.getElementById("appointmentTime").disabled=true;
    }
    catch(error){

    Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "This slot is already booked. Please choose another time."
    });

}

    isSubmitting = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Book Appointment";

    

});


function validateAppointmentDate(selectedDate) {

    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove time

    const selected = new Date(selectedDate);

    // Max date = today + 1 month
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);

    // ❌ Past date
    if (selected < today) {
        return {
            valid: false,
            message: "You cannot select a past date."
        };
    }

    // ❌ Beyond 1 month
    if (selected > maxDate) {
        return {
            valid: false,
            message: "You can only book within 1 month from today."
        };
    }

    // ✅ Valid
    return {
        valid: true
    };
}

function handleDateChange() {

    const dateInput = document.getElementById("appointmentDate");
    const selectedDate = dateInput.value;

    if (!selectedDate) return;

    // ✅ Validate date
    const result = validateAppointmentDate(selectedDate);

    if (!result.valid) {

        Swal.fire({
            icon: "warning",
            title: "Invalid Date",
            text: result.message
        });

        dateInput.value = ""; // reset invalid selection
        document.getElementById("appointmentTime").innerHTML = "";

        return;
    }

    // ✅ Generate time slots (only if valid)
    let doctnm=document.getElementById("pat-apt-form-docname").value;
    doct = doctorsList.find(doc => 
    doc.Name?.trim().toLowerCase() === doctnm.trim().toLowerCase()
    );
    console.log(doct);
    generateTimeSlots(
        "appointmentTime",
        doct.Start_time,
        doct.End_time,
        selectedDate,
        doct.Break_start,
        doct.Break_end
    );
}

function generateTimeSlots(selectId, startTime, endTime, selectedDate, breakStart = null, breakEnd = null) {

    startTime=doct.Start_time;
    endTime=doct.End_time;
    breakStart=doct.Break_start;
    breakEnd=doct.Break_end;

    const select = document.getElementById(selectId);
    select.innerHTML = "";

    console.log(doct.Start_time,doct.End_time);
    if (!doct.Start_time || !doct.End_time) {
        console.error("Start or End time missing");
        return;
    }

    function toMinutes(time) {
        const parts = time.split(":");
        if (parts.length !== 2) return null;

        const h = parseInt(parts[0]);
        const m = parseInt(parts[1]);

        return h * 60 + m;
    }

    function toHHMM(minutes) {
        let h = Math.floor(minutes / 60).toString().padStart(2, "0");
        let m = (minutes % 60).toString().padStart(2, "0");
        return `${h}:${m}`;
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const start = toMinutes(doct.Start_time);
    const end = toMinutes(doct.End_time);

    const breakS = doct.Break_start ? toMinutes(doct.Break_start) : null;
    const breakE = doct.Break_end ? toMinutes(doct.Break_end) : null;

    // Default option
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Select Time";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    for (let time = start; time < end; time += 60) {

        // ❌ Skip invalid conversion
        if (time === null) continue;

        // ❌ Skip break
        if (breakS !== null && breakE !== null) {
            if (time >= breakS && time < breakE) continue;
        }

        // ❌ Skip past time if today
        if (selectedDate === todayStr && time <= currentMinutes) {
            continue;
        }

        const option = document.createElement("option");

        const displayTime = toHHMM(time); // stays in 24-hour format

        option.value = displayTime;
        option.textContent = displayTime;

        select.appendChild(option);
    }
}

// ============================================================================
// ADD APPOINTMENT
// ============================================================================



// async function addAppointment(aptobj) {
//     try {
//         const docRef = await addDoc(collection(db, "Appointments"), aptobj);
//         console.log("Appointment added with ID:", docRef.id);
//         return true;
//     } catch (error) {
//         console.error("Error adding appointment:", error);
//         return false;
//     }
// }

async function addAppointment(aptobj) {
    try {

        const slotId = `${aptobj.DoctorName}_${aptobj.AppointmentDate}_${aptobj.AppointmentTime}`;

        const slotRef = doc(db, "Slots", slotId);
        const appointmentRef = doc(collection(db, "Appointments"));

        await runTransaction(db, async (transaction) => {

            const slotDoc = await transaction.get(slotRef);

            // ❌ If slot already booked
            if (slotDoc.exists()) {
                console.log("Slot Present");
                throw new Error("This slot is already booked. Please choose another time.");
            }

            // ✅ Lock the slot
            transaction.set(slotRef, {
                DoctorName: aptobj.DoctorName,
                AppointmentDate: aptobj.AppointmentDate,
                AppointmentTime: aptobj.AppointmentTime,
                lockedAt: serverTimestamp(),
                status: "locked"
            });

            // ✅ Create appointment
            transaction.set(appointmentRef, {
                ...aptobj,
                createdAt: serverTimestamp()
            });

        });

        console.log("Appointment booked successfully");
        return true;

    } catch (error) {
        console.error("Error adding appointment:", error);
        throw error; // keep this
    }
}



