document.addEventListener("DOMContentLoaded", function() {
    console.log("Records page loaded");
    loadRecords();
    
    document.getElementById("search-btn").addEventListener("click", function() {
        const searchDate = document.getElementById("date-search").value;
        filterRecordsByDate(searchDate);
    });
    
    document.getElementById("reset-btn").addEventListener("click", function() {
        document.getElementById("date-search").value = "";
        loadRecords();
    });
});

function loadRecords() {
    console.log("Loading records...");
    fetch('http://localhost:3000/api/jobs')
        .then(response => response.json())
        .then(jobs => {
            console.log("Jobs found:", jobs.length);
            const tbody = document.getElementById("records-body");
            if (!tbody) {
                console.error("tbody with id 'records-body' not found");
                return;
            }
            tbody.innerHTML = "";
            
            if (jobs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No records found</td></tr>';
                return;
            }
            
            for (let i = 0; i < jobs.length; i++) {
                const job = jobs[i];
                const row = `<tr>
                    <td>${job.date || ''}</td>
                    <td>${job.regPlate || ''}</td>
                    <td>${job.owner || ''}</td>
                    <td>${job.jobDescription || ''}</td>
                    <td>${job.comments || ''}</td>
                    <td>${job.parts || ''}</td>
                    <td>${job.price || ''}</td>
                </tr>`;
                tbody.innerHTML += row;
            }
            console.log("Table updated with", jobs.length, "rows");
        })
        .catch(error => {
            console.error("Fetch error:", error);
            const tbody = document.getElementById("records-body");
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">Error loading records</td></tr>';
            }
        });
}

function filterRecordsByDate(searchDate) {
    if (!searchDate) {
        loadRecords();
        return;
    }
    
    const parts = searchDate.split('-');
    const formattedDate = parts[2] + '/' + parts[1] + '/' + parts[0];
    
    fetch('http://localhost:3000/api/jobs')
        .then(response => response.json())
        .then(jobs => {
            const filtered = jobs.filter(job => job.date === formattedDate);
            const tbody = document.getElementById("records-body");
            if (!tbody) return;
            tbody.innerHTML = "";
            
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No records for this date</td></tr>';
                return;
            }
            
            for (let i = 0; i < filtered.length; i++) {
                const job = filtered[i];
                const row = `<tr>
                    <td>${job.date || ''}</td>
                    <td>${job.regPlate || ''}</td>
                    <td>${job.owner || ''}</td>
                    <td>${job.jobDescription || ''}</td>
                    <td>${job.comments || ''}</td>
                    <td>${job.parts || ''}</td>
                    <td>${job.price || ''}</td>
                </tr>`;
                tbody.innerHTML += row;
            }
        })
        .catch(error => console.error("Filter error:", error));
}