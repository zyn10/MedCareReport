// JavaScript code to handle form steps and memoization
let current_fs, next_fs, previous_fs; // fieldsets
let animating = false; // flag to prevent quick multi-click glitches

document.querySelectorAll(".next").forEach(function (button) {
  button.addEventListener("click", function () {
    if (animating) return false;
    animating = true;

    current_fs = this.parentElement;
    next_fs = current_fs.nextElementSibling;

    // Activate next step on progress bar
    const progressbarItems = document.querySelectorAll("#progressbar li");
    progressbarItems[
      Array.from(document.querySelectorAll("fieldset")).indexOf(next_fs)
    ].classList.add("active");

    // Show the next fieldset
    next_fs.classList.add("active");
    current_fs.classList.remove("active");

    setTimeout(function () {
      animating = false;
    }, 500); // matches the CSS transition duration
  });
});

document.querySelectorAll(".previous").forEach(function (button) {
  button.addEventListener("click", function () {
    if (animating) return false;
    animating = true;

    current_fs = this.parentElement;
    previous_fs = current_fs.previousElementSibling;

    // De-activate current step on progress bar
    const progressbarItems = document.querySelectorAll("#progressbar li");
    progressbarItems[
      Array.from(document.querySelectorAll("fieldset")).indexOf(current_fs)
    ].classList.remove("active");

    // Show the previous fieldset
    previous_fs.classList.add("active");
    current_fs.classList.remove("active");

    setTimeout(function () {
      animating = false;
    }, 500); // matches the CSS transition duration
  });
});

// To handle form submission and display summary and report
document.querySelector("#msform").addEventListener("submit", function (event) {
  event.preventDefault();

  // Hide the submit button after clicking
  document.querySelector('.submit').style.display = 'none';

  // Show the Generate PDF button
  document.querySelector('#generate-pdf').style.display = 'block';

  const summaryDiv = document.getElementById("summary");
  const inputs = document.querySelectorAll(
    "input[type='text'], input[type='number']"
  );

  // Display summary
  summaryDiv.innerHTML = "<h2>Patient Basic Information</h2>";
  inputs.forEach((input) => {
    summaryDiv.innerHTML += `<p><strong>${input.placeholder}:</strong> ${input.value}</p>`;
  });

  // Populate Report Table
  populateReportTable();
});

// Normal reference ranges for Hematology Report based on age and gender
const referenceRanges = {
  rbc: {
    newborn: { both: [4.8, 7.2] },
    "1month-1year": { both: [3.8, 5.4] },
    "1-6years": { both: [4.1, 5.3] },
    "7-12years": { both: [4.5, 5.1] },
    "adult": { male: [4.7, 6.1], female: [4.2, 5.4] }
  },
  wbc: {
    newborn: { both: [9.0, 30.0] },
    "1month-1year": { both: [6.0, 17.5] },
    "1-6years": { both: [5.0, 15.5] },
    "7-12years": { both: [4.5, 13.5] },
    "adult": { both: [4.0, 11.0] }
  },
  platelets: {
    newborn: { both: [150, 450] },
    "1month-1year": { both: [150, 450] },
    "1-6years": { both: [150, 450] },
    "7-12years": { both: [150, 450] },
    "adult": { both: [150, 400] }
  },
  hemoglobin: {
    newborn: { both: [14.0, 24.0] },
    "1month-1year": { both: [11.0, 14.0] },
    "1-6years": { both: [11.5, 13.5] },
    "7-12years": { both: [11.5, 15.5] },
    "adult": { male: [13.8, 17.2], female: [12.1, 15.1] }
  }
};

// Function to determine the age group
function getAgeGroup(age) {
  if (age < 1) return "newborn";
  if (age >= 1 && age <= 12) {
    if (age >= 1 && age < 7) return "1-6years";
    if (age >= 7 && age <= 12) return "7-12years";
  }
  if (age >= 13) return "adult";
  return "";
}

// Function to generate a row for the report table
function generateRow(test, normalRange, unit, result) {
  const row = document.createElement('tr');

  // Test Name
  const testCell = document.createElement('td');
  testCell.textContent = test;
  row.appendChild(testCell);

  // Normal Range
  const rangeCell = document.createElement('td');
  rangeCell.textContent = `${normalRange[0]} - ${normalRange[1]}`;
  row.appendChild(rangeCell);

  // Unit
  const unitCell = document.createElement('td');
  unitCell.textContent = unit;
  row.appendChild(unitCell);

  // Result
  const resultCell = document.createElement('td');
  resultCell.textContent = result.value;
  row.appendChild(resultCell);

  // Scale (Slider) - Displayed on both Web Page and PDF
  const scaleCell = document.createElement('td');
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = normalRange[0];
  slider.max = normalRange[1];
  slider.value = result.value;
  slider.className = 'slider';
  slider.disabled = true; // Make the slider read-only

  // Create slider labels
  const sliderLabels = document.createElement('div');
  sliderLabels.className = 'slider-labels';
  sliderLabels.innerHTML = '<span>Low</span><span>Normal</span><span>High</span>';

  // Set slider color based on range
  if (result.value >= normalRange[0] && result.value <= normalRange[1]) {
    slider.style.background = '#4CAF50'; // Green
  } else {
    slider.style.background = '#f44336'; // Red
  }

  scaleCell.appendChild(slider);
  scaleCell.appendChild(sliderLabels);
  row.appendChild(scaleCell);

  return row;
}

// Function to populate the report table
function populateReportTable() {
  const reportTable = document.getElementById('reportTable');
  reportTable.innerHTML = ""; // Clear existing rows to avoid duplication

  // Get patient data from inputs
  const age = parseInt(document.getElementById('age').value);
  const gender = document.getElementById('gender').value.toLowerCase();
  const ageGroup = getAgeGroup(age);

  const hemoglobinValue = document.getElementById('haemoglobin').value;
  const wbcValue = document.getElementById('wbc').value;
  const rbcValue = document.getElementById('rbc').value;
  const plateletsValue = document.getElementById('platelets').value;

  // Hemoglobin
  const hbRange = referenceRanges.hemoglobin[ageGroup][gender === "not specified" ? "both" : gender];
  reportTable.appendChild(generateRow('Hemoglobin', hbRange, 'g/dl', { value: parseFloat(hemoglobinValue) }));

  // WBC
  const wbcRange = referenceRanges.wbc[ageGroup]["both"];
  reportTable.appendChild(generateRow('WBC (TLC)', wbcRange, 'x10³/µL', { value: parseFloat(wbcValue) }));

  // RBC
  const rbcRange = referenceRanges.rbc[ageGroup][gender === "not specified" ? "both" : gender];
  reportTable.appendChild(generateRow('Total RBC', rbcRange, 'x10⁶/µL', { value: parseFloat(rbcValue) }));

  // Platelets
  const plateletRange = referenceRanges.platelets[ageGroup]["both"];
  reportTable.appendChild(generateRow('Platelets', plateletRange, 'x10³/µL', { value: parseFloat(plateletsValue) }));
}

// Function to generate PDF
document.getElementById("generate-pdf").addEventListener("click", function () {
  const { jsPDF } = window.jspdf;

  // Create a clone of the summary and report content including scales
  const contentToPrint = document.createElement('div');
  contentToPrint.style.padding = "20px"; // Add some padding for better appearance in PDF

  // Clone the content to avoid manipulating the original
  const summaryClone = document.querySelector('#summary').cloneNode(true);
  const tableClone = document.querySelector('#hematologyReport').cloneNode(true);

  contentToPrint.appendChild(summaryClone);
  contentToPrint.appendChild(tableClone);

  document.body.appendChild(contentToPrint); // Temporarily append to body for rendering

  html2canvas(contentToPrint, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Adding the image to the PDF
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0); // Adjusted to fit the content nicely on A4 page
    pdf.save('Patient_Report.pdf');
  }).finally(() => {
    document.body.removeChild(contentToPrint); // Remove temporary content from body
  });
});
