// Function to start the process
function startProcess() {
    window.location.href = './pages/form-name.html';
}

// Handle form submissions
document.addEventListener('DOMContentLoaded', () => {
    const nameForm = document.getElementById('nameForm');
    const ageForm = document.getElementById('ageForm');
    const genderForm = document.getElementById('genderForm');

    if (nameForm) {
        nameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            localStorage.setItem('name', name);
            window.location.href = './form-age.html';
        });
    }

    if (ageForm) {
        ageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const age = document.getElementById('age').value;
            localStorage.setItem('age', age);
            window.location.href = './form-gender.html';
        });
    }

    if (genderForm) {
        genderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const gender = document.getElementById('gender').value;
            localStorage.setItem('gender', gender);
            window.location.href = './report.html';
        });
    }

    // Display report data
    const nameDisplay = document.getElementById('nameDisplay');
    const ageDisplay = document.getElementById('ageDisplay');
    const genderDisplay = document.getElementById('genderDisplay');

    if (nameDisplay && ageDisplay && genderDisplay) {
        nameDisplay.textContent = `Name: ${localStorage.getItem('name')}`;
        ageDisplay.textContent = `Age: ${localStorage.getItem('age')}`;
        genderDisplay.textContent = `Gender: ${localStorage.getItem('gender')}`;

        // Add WHO results and visuals here based on the calculated data.
    }
});

// Generate PDF
function downloadPDF() {
    const reportContent = document.getElementById('reportContent').innerHTML;
    const doc = new jsPDF();
    doc.fromHTML(reportContent);
    doc.save('Health_Report.pdf');
}
