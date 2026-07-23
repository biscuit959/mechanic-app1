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
    fetch('http://localhost:3000/api/jobs')
        .then(response => response.json())
        .then(savedData => {
            if (savedData && savedData.length > 0) {
                tableBody.innerHTML = "";
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
            } else {
                for (let i = 0; i < 5; i++) {
                    tableBody.appendChild(createNewRow());
                }
            }
        })
        .catch(error => {
            console.error("Error loading jobs:", error);
            for (let i = 0; i < 5; i++) {
                tableBody.appendChild(createNewRow());
            }
        });
}

// Check if buttons exist before adding listeners
const addRowBtn = document.getElementById("add-row-btn");
const saveAllBtn = document.getElementById("save-all-btn");

// Add Row button
if (addRowBtn) {
    addRowBtn.addEventListener("click", function() {
        tableBody.appendChild(createNewRow());
    });
} else {
    console.error("Add Row button not found - check ID 'add-row-btn' in HTML");
}

// Save All button
// Manual Save button (individual save)
const manualSaveBtn = document.getElementById("manual-save");
if (manualSaveBtn) {
    manualSaveBtn.addEventListener("click", function() {
        const rows = document.querySelectorAll("#table tbody tr");
        const allData = [];
        
        rows.forEach(row => {
            const inputs = row.querySelectorAll("input");
            // Check if any field except date has content
            const hasContent = inputs[1].value.trim() !== "" || 
                              inputs[2].value.trim() !== "" || 
                              inputs[3].value.trim() !== "" || 
                              inputs[4].value.trim() !== "" || 
                              inputs[5].value.trim() !== "" || 
                              inputs[6].value.trim() !== "";
            
            if (hasContent) {
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
            }
        });
        
        if (allData.length === 0) {
            alert("No data to save. Please fill in at least one row.");
            return;
        }
        
        fetch('http://localhost:3000/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allData)
        })
        .then(response => response.json())
        .then(data => {
            alert(`Saved ${allData.length} jobs successfully!`);
            console.log("Manual save:", data);
            // Clear table and reload saved data
            document.querySelector("#table tbody").innerHTML = "";
            location.reload();
        })
        .catch(error => {
            console.error("Manual save error:", error);
            alert("Save failed. Check console.");
        });
    });
} else {
    console.error("Manual save button not found - check ID 'manual-save' in HTML");
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
