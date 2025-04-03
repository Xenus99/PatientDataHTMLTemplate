
document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "https://fedskillstest.coalitiontechnologies.workers.dev";

    const username = "coalition";
    const password = "skills-test";

    const headers = new Headers();
    headers.set(
    "Authorization",
    "Basic " + btoa(`${username}:${password}`)
    );

    fetch(apiUrl, {
    method: "GET",
    headers: headers,
    })
    .then((response) => {
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        console.log("API Response:", data);

        // // Updating All Data
        document.getElementById('name').innerHTML = data[3].name;
        document.getElementById('prof-pic').setAttribute('src', data[3].profile_picture);
        document.getElementById('profile-gender').innerHTML = data[3].gender;
        document.getElementById('profile-emergency-contact').innerHTML = data[3].emergency_contact;
        document.getElementById('profile-phone-number').innerHTML = data[3].phone_number;
        document.getElementById('profile-insurance-type').innerHTML = data[3].insurance_type;
        document.getElementById('profile-dob').innerHTML = formatDate(data[3].date_of_birth);
    
        document.getElementById('resp-value').innerHTML = data[3].diagnosis_history[0].respiratory_rate.value;
        document.getElementById('temp-value').innerHTML = data[3].diagnosis_history[0].temperature.value+"&#8457";
        document.getElementById('heart-value').innerHTML = data[3].diagnosis_history[0].heart_rate.value;


        updatePatientList(data);

        updateLabResults(data);

        updateDiagnosticList(data);

        configureChart(data);
        
    })

    .catch((error) => {
        console.error("Error fetching data:", error);
    });
});





function formatDate(dateString) {
    const date = new Date(dateString);
  
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
  
    return `${month} ${day}, ${year}`;
  }


  function updatePatientList(data){
    for (let i = 0; i < data.length; i++) {
        const result = `
            <li class='${i == 3 ? 'patient-item active': 'patient-item'}'>
                <img src='${data[i].profile_picture}' alt='Profile Picture' class='patient-photo'>
                <div class='patient-info'>
                    <h3>${data[i].name}</h3>
                    <p>${data[i].gender}, ${data[i].age}</p>
                </div>
                <button class='more-options'>...</button>
            </li>
        `;
        document.getElementById('patient-items').innerHTML += result;
    }
  }

  function updateLabResults(data){
    for (let i = 0; i < data[3].lab_results.length; i++) {
        const result = `
            <div class="${i == 1 ? 'lab-item active' : 'lab-item'}">
                <p>${data[3].lab_results[i]}</p>
                <button class="download-button">
                <img src="img/download-icon.svg" alt="Download">
                </button>
            </div>
        `;
        document.getElementById('lab-results-list').innerHTML += result;
    }
  }


  function updateDiagnosticList(data){
    for (let i = 0; i < data[3].diagnostic_list.length; i++) {
        const result = `
            <tr>
                <td>${data[3].diagnostic_list[i].name}</td>
                <td>${data[3].diagnostic_list[i].description}</td>
                <td>${data[3].diagnostic_list[i].status}</td>
            </tr>
        `;
        document.getElementById('diagnostic-list').innerHTML += result;
    }
  }


function configureChart(jsonData) {
    const ctx = document.getElementById('bloodPressureChart').getContext('2d');

    // Data for the chart
    const data = {
        labels: ['Oct, 2023', 'Nov, 2023', 'Dec, 2023', 'Jan, 2024', 'Feb, 2024', 'Mar, 2024'],
        datasets: [
            {
                label: 'Systolic',
                data: getSystolicBloodPressure(jsonData[3]),
                borderColor: '#E66FD2',
                backgroundColor: '#E66FD2',
                borderWidth: 2,
                tension: 0.4,
                pointStyle: 'circle',
                pointRadius: 5,
                pointBackgroundColor: '#E66FD2',
                latestValue: jsonData[3].diagnosis_history[0].blood_pressure.systolic.value,
                status: jsonData[3].diagnosis_history[0].blood_pressure.systolic.levels,
                // arrow: '▲', // Up arrow
                arrow: jsonData[3].diagnosis_history[0].blood_pressure.systolic.levels == 'Lower than Average'? '▼' : '▲',
            },
            {
                label: 'Diastolic',
                data: getDiastolicBloodPressure(jsonData[3]),
                borderColor: '#8C6FE6',
                backgroundColor: '#8C6FE6',
                borderWidth: 2,
                tension: 0.4,
                pointStyle: 'circle',
                pointRadius: 5,
                pointBackgroundColor: '#8C6FE6',
                latestValue: jsonData[3].diagnosis_history[0].blood_pressure.diastolic.value,
                status: jsonData[3].diagnosis_history[0].blood_pressure.diastolic.levels,
                // arrow: '▼',
                arrow: jsonData[3].diagnosis_history[0].blood_pressure.diastolic.levels == 'Lower than Average'? '▼' : '▲'
            },
        ],
    };

    const customLegend = {
        id: 'customLegend',
        beforeDraw(chart) {
            const { ctx, chartArea } = chart;
            const datasets = chart.data.datasets;

            ctx.save();

            const legendWidth = 150; 
            const legendX = chartArea.right + 20; 
            let legendY = chartArea.top + 20;

            datasets.forEach((dataset) => {
                ctx.fillStyle = dataset.borderColor;
                ctx.beginPath();
                ctx.arc(legendX + 10, legendY, 6, 0, Math.PI * 2); 
                ctx.fill();

                ctx.font = '14px Arial';
                ctx.fillStyle = '#4A4A4A'; 
                ctx.textAlign = 'left';
                ctx.fillText(dataset.label, legendX + 25, legendY + 5);

                ctx.font = '20px Arial'; 
                ctx.fillStyle = '#000'; 
                ctx.fillText(dataset.latestValue, legendX + 25, legendY + 30);

                ctx.font = '14px Arial';
                ctx.fillStyle = '#4A4A4A'; 
                ctx.fillText(`${dataset.arrow} ${dataset.status}`, legendX + 25, legendY + 50);

                legendY += 80; 
            });

            ctx.restore();
        },
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
            layout: {
                padding: {
                    right: 200,
                    left: 20,
                },
            },
            scales: {
                x: {
                },
                y: {
                    title: {
                        display: true,
                        text: 'Blood Pressure',
                        font: {
                            size: 16,
                        },
                    },
                    min: 60,
                    max: 180,
                    ticks: {
                        stepSize: 20,
                    },
                },
            },
        },
        plugins: [customLegend],
    };

    const bloodPressureChart = new Chart(ctx, config);
}


function getDiastolicBloodPressure(userData){
    result = [
        userData.diagnosis_history[5].blood_pressure.diastolic.value,
        userData.diagnosis_history[4].blood_pressure.diastolic.value,
        userData.diagnosis_history[3].blood_pressure.diastolic.value,
        userData.diagnosis_history[2].blood_pressure.diastolic.value,
        userData.diagnosis_history[1].blood_pressure.diastolic.value,
        userData.diagnosis_history[0].blood_pressure.diastolic.value
    ];

    return result;
}

function getSystolicBloodPressure(userData){
    result = [
        userData.diagnosis_history[5].blood_pressure.systolic.value,
        userData.diagnosis_history[4].blood_pressure.systolic.value,
        userData.diagnosis_history[3].blood_pressure.systolic.value,
        userData.diagnosis_history[2].blood_pressure.systolic.value,
        userData.diagnosis_history[1].blood_pressure.systolic.value,
        userData.diagnosis_history[0].blood_pressure.systolic.value
    ];

    return result;
}