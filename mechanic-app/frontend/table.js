// Wait for HTML to load first
document.addEventListener("DOMContentLoaded", function() {

// Get table body
const tableBody = document.querySelector("#table tbody");

// Get current user
let currentUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

// If no user is logged in, redirect to login page
if (!currentUser) {
    window.location.href = "login.html";
    return;
}

// Add mechanic or admin class to body
if (currentUser && currentUser.role === "mechanic") {
    document.body.classList.add("mechanic-view");
} else if (currentUser && currentUser.role === "admin") {
    document.body.classList.add("admin-view");
}

// Function to generate unique ID
function generateId() {
    return Date.now() + Math.random();
}

// Function to get today's date
function getTodaysDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
}

// Function to create a new blank row
function createNewRow() {
    const row = document.createElement("tr");
    const uniqueId = generateId();
    row.setAttribute("data-mechanic-id", currentUser.id);
    row.setAttribute("data-job-id", uniqueId);
    row.innerHTML = `
        <td><input type="text" value="${getTodaysDate()}" readonly></td>
        <td><input type="text" placeholder="Reg Plate"></td>
        <td><input type="text" placeholder="Owner"></td>
        <td><input type="text" placeholder="Job Description"></td>
        <td><input type="text" placeholder="Comments"></td>
        <td><input type="text" placeholder="Parts"></td>
        <td><input type="text" placeholder="Price"></td>
    `;
    return row;
}

// Global variables for popup editing
let currentEditingJobId = null;
let currentEditingColumn = null;
let currentEditingRow = null;
let currentEditingInput = null;

// Function to load jobs from database

function loadJobs() {
    console.log("Before clear, rows:", document.querySelectorAll("#table tbody tr").length);
    document.querySelector("#table tbody").innerHTML = "";
    console.log("After clear, rows:", document.querySelectorAll("#table tbody tr").length);
    
    fetch('http://localhost:3000/api/jobs')
        .then(response => response.json())
        .then(savedData => {
            console.log("Data received, adding", savedData.length, "jobs");
            console.log("loadJobs: received", savedData.length, "jobs");
            console.log("loadJobs: data:", savedData);
            tableBody.innerHTML = "";
            console.log("loadJobs: table cleared");
            if (savedData && savedData.length > 0) {
                savedData.forEach(job => {
                    const row = document.createElement("tr");
                    row.setAttribute("data-mechanic-id", job.mechanicId);
                    row.setAttribute("data-job-id", job.id);
                    const canEdit = currentUser.role === "admin" || (currentUser.id === job.mechanicId);
                    
                    row.innerHTML = `
                        <td><input type="text" value="${job.date || ''}" readonly></td>
                        ${canEdit ? `<td><input type="text" value="${job.regPlate || ''}"></td>` : `<td><input type="text" value="${job.regPlate || ''}" readonly></td>`}
                        ${canEdit ? `<td><input type="text" value="${job.owner || ''}"></td>` : `<td><input type="text" value="${job.owner || ''}" readonly></td>`}
                        ${canEdit ? `<td><input type="text" value="${job.jobDescription || ''}"></td>` : `<td><input type="text" value="${job.jobDescription || ''}" readonly></td>`}
                        ${canEdit ? `<td><input type="text" value="${job.comments || ''}"></td>` : `<td><input type="text" value="${job.comments || ''}" readonly></td>`}
                        ${canEdit ? `<td><input type="text" value="${job.parts || ''}"></td>` : `<td><input type="text" value="${job.parts || ''}" readonly></td>`}
                        <td><input type="text" value="${job.price || ''}"></td>
                    `;
                    tableBody.appendChild(row);
                });
                console.log("loadJobs: added", savedData.length, "rows");
            } else {
                for (let i = 0; i < 1; i++) {
                    tableBody.appendChild(createNewRow());
                }
                console.log("loadJobs: no data, added 1 blank row");
            }
        })
        .catch(error => {
            console.error("loadJobs: fetch error:", error);
            tableBody.innerHTML = "";
            for (let i = 0; i < 1; i++) {
                tableBody.appendChild(createNewRow());
            }
        });
}
// Add Row button
const addRowBtn = document.getElementById("add-row-btn");
if (addRowBtn) {
    addRowBtn.addEventListener("click", function() {
        tableBody.appendChild(createNewRow());
    });
}

// Manual Save button
const manualSaveBtn = document.getElementById("manual-save");
if (manualSaveBtn) {
    manualSaveBtn.addEventListener("click", function() {
        const rows = document.querySelectorAll("#table tbody tr");
        const allData = [];
        
        rows.forEach(row => {
            const inputs = row.querySelectorAll("input");
            const jobId = row.getAttribute("data-job-id");
            allData.push({
                id: jobId,
                date: inputs[0].value,
                regPlate: inputs[1].value,
                owner: inputs[2].value,
                jobDescription: inputs[3].value,
                comments: inputs[4].value,
                parts: inputs[5].value,
                price: inputs[6].value,
                mechanicId: row.getAttribute("data-mechanic-id")
            });
        });
        
        fetch('http://localhost:3000/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allData)
        })
        .then(response => response.json())
        .then(data => {
            alert(`Saved ${rows.length} jobs successfully!`);
            tableBody.innerHTML = "";
            loadJobs(); // This calls your existing loadJobs function
        })
        .catch(error => {
            console.error("Manual save error:", error);
            alert("Save failed. Check console.");
        });
    });
}

// Popup click listener
function clickListener() {
    const tableBodyElement = document.getElementById("table-body");
    
    if (!tableBodyElement) {
        console.error("Table body not found");
        return;
    }
    
    tableBodyElement.addEventListener("click", function(event) {
        const target = event.target;
        
        if (target.tagName === "INPUT" && !target.readOnly) {
            const cell = target.parentElement;
            const row = cell.parentElement;
            const cells = Array.from(row.children);
            const columnIndex = cells.indexOf(cell);
            
            if (columnIndex === 3 || columnIndex === 4 || columnIndex === 5) {
                currentEditingJobId = row.getAttribute("data-job-id");
                currentEditingColumn = columnIndex;
                currentEditingRow = row;
                currentEditingInput = target;
                
                const textarea = document.getElementById("popup-text");
                if (textarea) {
                    textarea.value = target.value;
                }
                
                const overlay = document.getElementById("popup-overlay");
                const popup = document.getElementById("popup");
                if (overlay && popup) {
                    overlay.style.display = "block";
                    popup.style.display = "block";
                    if (textarea) textarea.focus();
                }
            }
        }
    });
    
    const closeButton = document.getElementById("close-popup");
    if (closeButton) {
        closeButton.addEventListener("click", function() {
            const newText = document.getElementById("popup-text");
            if (newText && currentEditingInput) {
                currentEditingInput.value = newText.value;
            }
            
            const overlay = document.getElementById("popup-overlay");
            const popup = document.getElementById("popup");
            if (overlay) overlay.style.display = "none";
            if (popup) popup.style.display = "none";
            
            currentEditingJobId = null;
            currentEditingColumn = null;
            currentEditingRow = null;
            currentEditingInput = null;
        });
    }
    
    const overlay = document.getElementById("popup-overlay");
    if (overlay) {
        overlay.addEventListener("click", function() {
            const overlayEl = document.getElementById("popup-overlay");
            const popup = document.getElementById("popup");
            if (overlayEl) overlayEl.style.display = "none";
            if (popup) popup.style.display = "none";
            
            currentEditingJobId = null;
            currentEditingColumn = null;
            currentEditingRow = null;
            currentEditingInput = null;
        });
    }
}

// Initialize
loadJobs();
clickListener();

}); // End DOMContentLoaded