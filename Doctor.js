import { db } from "./Firebase.js";
import {collection, addDoc, doc,getDocs,deleteDoc,updateDoc, query, orderBy,serverTimestamp,where, limit} from  "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
  

var docname=sessionStorage.getItem("name");
var email=sessionStorage.getItem("email");
var curDate=null;
var appointmentMap=[], patientsMap=[];
let todaysAppointments={},todayPendingcount=0, cancelledCount=0,completedCount=0,completedTodaycount=0;

console.log(docname);
document.getElementById("doctname").innerText=docname;
document.getElementById("docnameh2").innerText=docname;
var doctor=null;
getDoctorByEmail(email);
curDate=getCurrentDate();
getAppointments();
getPatients();



document.getElementById("logoutBtn").addEventListener('click', function(e){
    sessionStorage.clear();
    localStorage.clear();
    window.location.replace("login.html");

});




async function getDoctorByEmail(email) 
{
    const q = query(collection(db, "Doctors"), where("Email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        doctor= { id: doc.id, ...doc.data() };
    }
    document.getElementById("docnamediv").value=doctor.Name;
document.getElementById("docspecdiv").value=doctor.Speciality;
document.getElementById("docemaildiv").value=doctor.Email;
document.getElementById("docphonediv").value=doctor.PhoneNumber;
document.getElementById("docqualdiv").value=doctor.education;
document.getElementById("docexpdiv").value=doctor.Experience;
document.getElementById("docbiodiv").value=doctor.Bio;
document.getElementById("cfeedocdiv").value=doctor.ConsultFee;

document.getElementById("mudi1").innerText=doctor.Name;
document.getElementById("mudi2").innerText=doctor.Speciality;
document.getElementById("mudidocimg").src=doctor.ImgUrl;
document.getElementById('startTime').value=doctor.Start_time;
document.getElementById('endTime').value=doctor.End_time;
document.getElementById('breakStart').value=doctor.Break_start;
document.getElementById('breakEnd').value=doctor.Break_end;



return doctor;
    
}
async function getPatients()
{
    const q=query(collection(db,"Patients"));
    const snap=await getDocs(q);
    
    
    patientsMap = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    console.log(patientsMap);
    document.getElementById("doc-pat-count").innerText=patientsMap.length;
    document.getElementById("doc-pat-count2").innerText=patientsMap.length;
    document.getElementById("doc-pat-count3").innerText=patientsMap.length;
    document.getElementById("doc-pat-count4").innerText=patientsMap.length;
    renderPatientTable(patientsMap);

}

async function getAppointments() 
{
    const q = query(
        collection(db, "Appointments"),
        where("DoctorName", "==", docname)
    );

    const snap = await getDocs(q);

    // Convert all docs to JS objects
    appointmentMap = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Sort by createdAt DESC (newest first)
    appointmentMap.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    // Filter separate today's appointments
    todaysAppointments = appointmentMap.filter(app => app.AppointmentDate === curDate);
    
    completedCount = appointmentMap.filter(app =>
    app.Status === "Completed"
    ).length;

    todayPendingcount = appointmentMap.filter(app =>
    app.Status === "Pending"
    ).length;

    cancelledCount = appointmentMap.filter(app =>
    app.Status === "Cancelled"
    ).length;
    document.getElementById("doc-comptd-count").innerText=completedCount;
    
    //console.log(completedCount);


    
    todaysAppointments.sort((a, b) =>
        a.createdAt.seconds - b.createdAt.seconds
    );


    console.log("ALL APPOINTMENTS:", appointmentMap);
    console.log("TODAY'S APPOINTMENTS:", todaysAppointments);
    document.getElementById("doc-apt-count").innerText=todaysAppointments.length;
    document.getElementById("doc-apt-count2").innerText=todaysAppointments.length;
    document.getElementById("doc-pending-count").innerText=todayPendingcount;
    document.getElementById("doc-pending-count2").innerText=todayPendingcount;
    document.getElementById("doc-totalapt-count").innerText=appointmentMap.length;
    document.getElementById("doc-cancelled-count").innerText=cancelledCount;
  

    completedTodaycount = appointmentMap.filter(app =>
    app.AppointmentDate === curDate &&
    app.Status === "Completed"
    ).length;

    document.getElementById("doc-comp-today").innerText=completedTodaycount;

    window.appointments = appointmentMap;
    renderTodaySchedule(todaysAppointments);
    renderAppointmentTable(appointmentMap);

}

document.getElementById("docprofsavebt").addEventListener("click", function () 
{

    let form=document.getElementById("profform");
    const doctorData = {
        Name: document.getElementById("docnamediv").value,
        Speciality: document.getElementById("docspecdiv").value,
        Email: document.getElementById("docemaildiv").value,
        PhoneNumber: document.getElementById("docphonediv").value,
        education: document.getElementById("docqualdiv").value,
        Experience: document.getElementById("docexpdiv").value,
        Bio: document.getElementById("docbiodiv").value,
        ConsultFee : document.getElementById("cfeedocdiv").value,
        Status : doctor.Status,
        ImgUrl : doctor.ImgUrl,
        clinic: "HeartCare Medical Center",
        languages: "English",
        rating: 4.5,
        Start_time : doctor.Start_time,
        End_time : doctor.End_time,
        Break_start : doctor.Break_start,
        Break_end : doctor.Break_end
    };

    

    console.log(doctorData);


   const q = query(
    collection(db, "Doctors"),
    where("Email", "==", doctorData.Email)
    );

getDocs(q)
.then(snapshot => {

    if (!snapshot.empty) {

        const docRef = snapshot.docs[0].ref;

        updateDoc(docRef, doctorData)
        .then(() => console.log("Document updated!"),
        Swal.fire({
  icon: 'success',
  title: 'Profile Updated',
  text: 'Your profile details have been successfully updated.',
  confirmButtonText: 'OK'
})
    )
        .catch(err => console.error("Update failed:", err));

    } else {
        console.log("No document found with this email.");
    }

})
.catch(err => console.error("Query failed:", err));

});


function getCurrentDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');  // add leading 0
    const day = String(today.getDate()).padStart(2, '0');         // add leading 0

    return `${year}-${month}-${day}`;
}



function renderTodaySchedule(appointmentMap) {

    const container = document.querySelector(".schedule-timeline");
    container.innerHTML = ""; // clear previous content

    appointmentMap.forEach(app => {

        let itemClass = "";      // schedule-item class (completed, current, upcoming)
        let statusClass = "";    // badge class (completed, pending, active, cancelled)
        let statusLabel = "";    // badge text

        switch(app.Status) {

            case "Completed":
                itemClass = "completed";    // green block
                statusClass = "completed";  // uses .status.completed
                statusLabel = "Completed";
                break;

            case "Inprogress":
                itemClass = "current";      // highlighted item
                statusClass = "active";     // uses .status.active
                statusLabel = "In Progress";
                break;

            case "Pending":
                itemClass = "pending";
                statusClass = "pending";    // uses .status.pending (yellow)
                statusLabel = "Pending";
                break;

            case "Cancelled":
                itemClass = "cancelled";
                statusClass = "cancelled";  // uses .status.cancelled (red)
                statusLabel = "Cancelled";
                break;

            default:
                itemClass = "upcoming";
                statusClass = "confirmed";
                statusLabel = app.Status;
        }

        // Build the schedule dom
        const item = document.createElement("div");
        item.className = `schedule-item ${itemClass}`;

        item.innerHTML = `
            <div class="time">${convertTo12Hour(app.AppointmentTime)}</div>
            <div class="details">
                <h4>${app.PatientName}</h4>
                <p>${app.AppointmentType .toUpperCase()|| "Consultation"}</p>
            </div>
            <span class="status ${statusClass}">${statusLabel}</span>
        `;

        container.appendChild(item);
    });
}

function convertTo12Hour(time) {
    if (!time) return "";
    let [h, m] = time.split(":");
    h = Number(h);
    const suffix = h >= 12 ? "PM" : "AM";
    h = (h % 12) || 12;
    return `${h}:${m} ${suffix}`;
}

let rowsToShow = 10; // initially show 10 rows

function renderAppointmentTable(appointmentMap) {

    const tbody = document.querySelector(".data-table tbody");
    tbody.innerHTML = ""; 

    if(appointmentMap.length == 0){
        tbody.innerHTML="";
        return;
    }
        

    // Only slice rows according to rowsToShow
    console.log(appointmentMap.length);
    const visibleRows = appointmentMap.slice(0, rowsToShow);

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
                <button class="btn-icon accept" title="Accept" id="accept-apt">
                    <i class="fas fa-check" ></i> <span>&nbsp; Accept</span>
                </button>
                <button class="btn-icon cancel" title="Cancel" id="cancel-apt">
                    <i class="fas fa-times"></i> <span> &nbsp;Cancel</span>
                </button>
            `;
        } 
        else if (app.Status === "In-progress" || app.Status === "Confirmed") {
            actionButtons = `
                <button class="btn-icon view" title="View"><i class="fas fa-eye"></i></button>
                <button class="btn-icon complete" title="Complete" id="complete-apt">
                    <i class="fas fa-check"></i>
                </button>
            `;
        } 
        else {
            actionButtons = `
                <button class="btn-icon view" title="View" ><i class="fas fa-eye"></i></button>
            `;
        }

        const formattedTime = convertTo12Hour(app.AppointmentTime);
        const formattedDate = formatDateText(app.AppointmentDate);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td style="font-weight: 700;">${app.AppointmentID}</td>
            <td>${app.PatientName}</td>
            <td>${formattedDate}, ${formattedTime}</td>
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

    // Hide button if all rows are displayed
    const btn = document.getElementById("viewMoreBtn");
    if (rowsToShow >= appointmentMap.length) {
        btn.style.display = "none";
    } else {
        btn.style.display = "inline-block";
    }
}


// View More functionality
document.getElementById("viewMoreBtn").addEventListener("click", () => {
    rowsToShow += 10;     // show 10 more rows
    renderAppointmentTable(appointmentMap);
});
function formatDateText(date) {
    const today = new Date().toISOString().split("T")[0];

    const tomorrow = new Date(Date.now() + 86400000)
        .toISOString()
        .split("T")[0];

    if (date === today) return "Today";
    if (date === tomorrow) return "Tomorrow";

    return date; // otherwise return YYYY-MM-DD
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

    document.querySelector(".data-table tbody").addEventListener("click", (e) => {

    const viewBtn = e.target.closest(".btn-icon.view");
    if (viewBtn) {
        const row = viewBtn.closest("tr");
        const app = JSON.parse(row.dataset.app);
        showAppointmentDetails(app);    // your Swal popup
        return;
    }
    
  // ACCEPT BUTTON
    if (e.target.closest(".btn-icon.accept")) {
        const row = e.target.closest("tr");
        const app = JSON.parse(row.dataset.app);
        handleAccept(app, row);
        return;
    }

    // CANCEL BUTTON
    if (e.target.closest(".btn-icon.cancel")) {
        const row = e.target.closest("tr");
        const app = JSON.parse(row.dataset.app);
        handleCancel(app, row);
        return;
    }

     if (e.target.closest(".btn-icon.complete")) {
        const row = e.target.closest("tr");
        const app = JSON.parse(row.dataset.app);
        completeAppointment(app, row);
        return;
    }


});

function handleAccept(app, row) 
{
    console.log("Lenght : ",appointmentMap);

    Swal.fire({
        icon: "question",
        title: "Accept Appointment?",
        showCancelButton: true,
        confirmButtonText: "Accept"
    }).then((result) => 
    {

        if (!result.isConfirmed) return;

        // 1️⃣ Update Status Text
        row.querySelector(".status").innerText = "In Progress";
        row.querySelector(".status").className = "status active";

        // 2️⃣ Remove ONLY the cancel button
        row.querySelector(".btn-icon.cancel")?.remove();
        row.querySelector(".btn-icon.accept")?.replaceWith(createCompleteButton());

        // 4️⃣ Update Data Object
        app.Status = "In-progress";
        row.dataset.app = JSON.stringify(app);

        console.log(appointmentMap, todaysAppointments);
        appointmentMap = appointmentMap.map(apt => 
        apt.id === apt.id
        ? { ...app, Status: "In-progress" }  // <-- update only one field
        : app
        );

        if(curDate == app.AppointmentDate)
        {
            todaysAppointments = todaysAppointments.map(apt => 
            apt.id === apt.id
            ? { ...app, Status: "In-progress" }  // <-- update only one field
            : app
        );
        }
        todayPendingcount-=1;
        document.getElementById("doc-pending-count").innerText=todayPendingcount;
        document.getElementById("doc-pending-count2").innerText=todayPendingcount;
        updateOneField(app.id,"Status","In-progress");

    });
}

async function updateOneField(appId, fieldName, newValue) {
    const ref = doc(db, "Appointments", appId);

    await updateDoc(ref, {
       [fieldName]: newValue
    });

    console.log("Updated:", fieldName, "=", newValue);
}

function createCompleteButton() {
    const btn = document.createElement("button");
    btn.className = "btn-icon complete";
    btn.title = "Complete";

    btn.innerHTML = `
        <i class="fas fa-check"></i>
    `;

    return btn;
}


function handleCancel(app, row) 
{
    //console.log("Lenght : ",appointmentMap);

    Swal.fire({
        icon: "question",
        title: "Cancel Appointment?",
        showCancelButton: true,
        confirmButtonText: "Reject"
    }).then((result) => 
    {

        if (!result.isConfirmed) return;

        // 1️⃣ Update Status Text
        row.querySelector(".status").innerText = "Cancelled";
        row.querySelector(".status").className = "status cancelled";

        // 2️⃣ Remove ONLY the cancel button
        row.querySelector(".btn-icon.cancel")?.remove();
        row.querySelector(".btn-icon.accept")?.remove();

        // 4️⃣ Update Data Object
        app.Status = "Cancelled";
        row.dataset.app = JSON.stringify(app);

        console.log(appointmentMap, todaysAppointments);
        appointmentMap = appointmentMap.map(apt => 
        apt.id === apt.id
        ? { ...app, Status: "Cancelled" }  // <-- update only one field
        : app
        );

        if(curDate == app.AppointmentDate)
        {
            todaysAppointments = todaysAppointments.map(apt => 
            apt.id === apt.id
            ? { ...app, Status: "Cancelled" }  // <-- update only one field
            : app
        );
        }
        todayPendingcount-=1;
        cancelledCount+=1;
        document.getElementById("doc-pending-count").innerText=todayPendingcount;
        document.getElementById("doc-pending-count2").innerText=todayPendingcount;
        document.getElementById("doc-cancelled-count").innerText=cancelledCount;

        updateOneField(app.id,"Status","Cancelled");
        deleteDoc(doc(db, "Slots", app.DoctorName+"_"+app.AppointmentDate+"_"+app.AppointmentTime));

    });
}

function completeAppointment(app, row)
{
    Swal.fire({
        icon: "question",
        title: "Completed Appointment?",
        showCancelButton: true,
        confirmButtonText: "Completed"
    }).then((result) => 
    {

        if (!result.isConfirmed) return;

        // 1️⃣ Update Status Text
        row.querySelector(".status").innerText = "Completed";
        row.querySelector(".status").className = "status completed";

        // 2️⃣ Remove ONLY the cancel button
        //row.querySelector(".btn-icon.cancel")?.remove();
        row.querySelector(".btn-icon.complete")?.remove();

        // 4️⃣ Update Data Object
        app.Status = "Completed";
        row.dataset.app = JSON.stringify(app);

        console.log(appointmentMap, todaysAppointments);
       
        appointmentMap = appointmentMap.map(apt =>
        apt.id === app.id
        ? { ...apt, Status: "Completed" }
        : apt
        );


        if (curDate === app.AppointmentDate) {
    todaysAppointments = todaysAppointments.map(apt =>
        apt.id === app.id
            ? { ...apt, Status: "Completed" }
            : apt
    );
        }
        completedCount+=1;
        completedTodaycount+=1;
        document.getElementById("doc-comptd-count").innerText=completedCount;
         document.getElementById("doc-comp-today").innerText=completedTodaycount;

        updateOneField(app.id,"Status","Completed");

    });

}

document.getElementById("all").addEventListener("click", function(e)
{
    if(appointmentMap.length != 0)
        renderAppointmentTable(appointmentMap);
});
document.getElementById("today").addEventListener("click", function(e)
{
    if(todaysAppointments.length != 0)
    renderAppointmentTable(todaysAppointments);

});
document.getElementById("inprog").addEventListener("click", function(e){
    let map = appointmentMap.filter(app =>
    app.Status === "In-progress"
    );
    
    renderAppointmentTable(map);

});
document.getElementById("comp").addEventListener("click", function(e){
    let map = appointmentMap.filter(app =>
    app.Status === "Completed"
    );
    
    renderAppointmentTable(map);

});
document.getElementById("canc").addEventListener("click", function(e){
    let map = appointmentMap.filter(app =>
    app.Status === "Cancelled"
    );
    
    renderAppointmentTable(map);

});

document.getElementById("pen").addEventListener("click", function(e){
    let map = appointmentMap.filter(app =>
    app.Status === "Pending"
    );
    
    renderAppointmentTable(map);

});


function renderPatientTable(patientsMap) 
{
    const tbody = document.querySelector("#patientTable tbody");
    tbody.innerHTML = "";  // clear old rows

    console.log("Patients List ",patientsMap)
    patientsMap.forEach(patient => {

        const tr = document.createElement("tr");


        tr.innerHTML = `
            <td>${patient.Name}</td>
            <td>${patient.Age}</td>
            <td>${patient.PhoneNumber}</td>
            <td><span class="blood-tag">${patient.BloodGroup}</span></td>
            <td>${getLastVisit(getLatestAppointmentByEmail(patient.Email))}</td>
            <td>
                <div class="action-buttons-cell">
                    <button class="btn-icon view" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;

        // Store the FULL PATIENT OBJECT inside the row
        tr.dataset.patient = JSON.stringify(patient);

        tbody.appendChild(tr);
    });
}

document.querySelector("#patientTable tbody").addEventListener("click", (e) => {

    const btn = e.target.closest(".btn-icon.view");

    if (btn) {
        const row = btn.closest("tr");
        const patient = JSON.parse(row.dataset.patient);
        showPatientPopup(patient);  // your Swal function
    }
});

function getLastVisit(dateString) {
    if (!dateString) return "N/A";

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const visitDate = new Date(dateString);

    const todayStr = today.toISOString().split("T")[0];
    const yestStr  = yesterday.toISOString().split("T")[0];
    const visitStr = visitDate.toISOString().split("T")[0];

    if (visitStr === todayStr) return "Today";
    if (visitStr === yestStr) return "Yesterday";

    return dateString;   // keep original YYYY-MM-DD
}

function getLatestAppointmentByEmail(email) {

    const filtered = appointmentMap.filter(app =>
        app.PatientEmail === email
    );

    if (filtered.length === 0) {
        return null;
    }

    // Sort by date DESC → newest first
    filtered.sort((a, b) =>
        toDateObject(b.AppointmentDate) - toDateObject(a.AppointmentDate)
    );

    return filtered[0].AppointmentDate;  // newest appointment
}

function toDateObject(dateStr) {
    return new Date(dateStr);  // works 100% for YYYY-MM-DD
}

function showPatientPopup(p) {

    Swal.fire({
        title: "Patient Details",
        width: "600px",
        html: `
            <div style="text-align:left; font-size:15px; line-height:1.8; padding:5px 10px;">
                
                <p><strong>Patient Name:</strong> ${p.Name}</p>
                <p><strong>Age:</strong> ${p.Age}</p>
                <p><strong>Gender:</strong> ${p.Gender || "N/A"}</p>
                <p><strong>Phone Number:</strong> ${p.PhoneNumber}</p>
                <p><strong>Email:</strong> ${p.Email}</p>
                <p><strong>Blood Group:</strong> ${p.BloodGroup}</p>
                <p><strong>Last Visit:</strong> ${ getLastVisit(getLatestAppointmentByEmail(p.Email))|| "No Visits"}</p>

            </div>
        `,
        confirmButtonText: "Close",
        confirmButtonColor: "#3b82f6",
        showCloseButton: true,
        backdrop: true,
    });
}

document.getElementById("patientSearch").addEventListener("input", function (e) {
    const text = e.target.value.toLowerCase().trim();
    console.log(text);
    // Filter patientsMap based on ANY match
    const filtered = patientsMap.filter(p =>
        p.Name.toLowerCase().includes(text) ||
        String(p.Age).includes(text) ||
        p.PhoneNumber.toLowerCase().includes(text) ||
        (p.Email && p.Email.toLowerCase().includes(text)) ||
        (p.BloodGroup && p.BloodGroup.toLowerCase().includes(text)) ||
        (p.Gender && p.Gender.toLowerCase().includes(text))
    );

    // Render filtered results
    renderPatientTable(filtered);
});



//Doctor's Active hours and break time.

 // Preset buttons functionality
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', function() 
            {
                // Remove active class from all presets
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Set time inputs
                document.getElementById('startTime').value = this.dataset.start;
                document.getElementById('endTime').value = this.dataset.end;
            });
        });

        // No break checkbox functionality
        document.getElementById('noBreak').addEventListener('change', function() {
            const breakStart = document.getElementById('breakStart');
            const breakEnd = document.getElementById('breakEnd');
            
            if (this.checked) {
                breakStart.disabled = true;
                breakEnd.disabled = true;
                breakStart.value = '';
                breakEnd.value = '';
            } else {
                breakStart.disabled = false;
                breakEnd.disabled = false;
            }
        });

        // Save button functionality
        // Add this to your existing <script> section
document.getElementById('saveAvailability').addEventListener('click', async function() {
    const saveBtn = this;
    
    try {
        // Get form values
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const breakStart = document.getElementById('breakStart').value;
        const breakEnd = document.getElementById('breakEnd').value;
        const noBreak = document.getElementById('noBreak').checked;

        // Validation
        if (!startTime || !endTime) {
            alert('Please select start and end times');
            return;
        }

        // Show loading
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        saveBtn.style.background = 'var(--text-light)';

        // Prepare data
        const availabilityData = {
            Start_time: startTime,
            End_time: endTime,
            Break_start: noBreak ? null : breakStart,
            Break_end: noBreak ? null : breakEnd  // Bonus: Timestamp
        };

        // 🔥 FIRESTORE UPDATE - Replace 'DOCTOR_DOC_ID' with actual doc ID
        const doctorDocId = doctor.id;  // ← GET THIS FROM YOUR APP
        
      const doctorRef = doc(collection(db, "Doctors"), doctorDocId);
        
        await updateDoc(doctorRef, {
            Start_time: startTime,
            End_time: endTime,
            Break_start: noBreak ? null : breakStart,
            Break_end: noBreak ? null : breakEnd
        });

        // Success feedback
        saveBtn.textContent = 'Saved!';
        saveBtn.style.background = 'var(--success-color)';
        
        console.log('✅ Availability updated:', availabilityData);

    } catch (error) {
        console.error('❌ Error updating availability:', error);
        alert('Failed to save availability. Please try again.');
        
        // Reset button
        saveBtn.textContent = 'Save Availability';
        saveBtn.style.background = 'var(--primary-color)';
        saveBtn.disabled = false;
    }

    // Reset button after 2 seconds
    setTimeout(() => {
        saveBtn.textContent = 'Save Availability';
        saveBtn.style.background = 'var(--primary-color)';
        saveBtn.disabled = false;
    }, 2000);
});
        // Disable break inputs initially
        document.getElementById('breakStart').disabled = true;
        document.getElementById('breakEnd').disabled = true;
