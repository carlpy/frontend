const showApplies = document.querySelectorAll("button[data-show]");
const baseURL = 'https://backend-five-wheat.vercel.app'

/* Content DOM elements */
const showZones = document.querySelectorAll(".show-sect");

/* modal buttons */
const acceptPostulationBtn = document.querySelector(".accept-postulation-btn");
const declinedPostulationBtn = document.querySelector(".decline-postulation-btn");

/* display */
const academicMonitors = document.querySelector('#academic')
const adminMonitors = document.querySelector('#administrative')
const appliesContent = document.querySelector("#apply");
const statsContainer = document.querySelector('#stats')

/* monitor information field */
const monitorInfoContainer = document.querySelector('#showMonitorInfo .modal-body');
const email = document.querySelector('.email')
const cycle = document.querySelector('.cycle')
const average = document.querySelector('.average')
const area = document.querySelector('.area')
const scheduleTable = document.querySelector('.schedule-table')

const academicRender = document.querySelector('.academic-container');
const adminRender = document.querySelector('.administrative-container');

let administrativeData;
let academicData;

let selected = 0;
let selectedEmail = '';

window.addEventListener("DOMContentLoaded", () => {
    loadPostulations();
    loadContent();
	handlePostulation();
	renderMonitors();
	setFeedbackForm();
	setStadistics();
});

function loadContent() {
	
	showApplies.forEach((btn) =>
        btn.addEventListener("click", () => {
			showZones.forEach((zone) => zone.classList.add("d-none"));
            if (btn.dataset.show === "applications") { 
				appliesContent.classList.remove("d-none");
				loadPostulations();
            }
            if (btn.dataset.show === "modules") { academicMonitors.classList.remove("d-none"); }
            if (btn.dataset.show === "areas") { adminMonitors.classList.remove("d-none"); }
			if (btn.dataset.show === "stadistics") { statsContainer.classList.remove("d-none"); setStadistics() } 
        })
    );
}

function loadPostulations() {
    axios.get(baseURL + `/postulations/en-espera`)
        .then((res) => {
            console.log(res.data);
            const postulations = res.data;
            const postulationContainer = document.querySelector(".postulation-space");
            postulationContainer.innerHTML = "";

            postulations.forEach(
                ({ nombre, correo, carrera, cuatrimestre, promedio, tipo, area }) => {
                    const container = document.createElement("tr");
                    container.innerHTML = `
					<td>${nombre}</td>
					<td>${correo}</td>
					<td>${carrera}</td>
					<td>${cuatrimestre}</td>
					<td>${promedio}</td>
					<td>${tipo}</td>
					<td>${area}</td>
					
					<td>
						<button class="btn btn-success btn-modal-accept" data-bs-toggle="modal" data-bs-target="#accept">Aceptar</button>
						<button class="btn btn-danger btn-modal-decline" data-bs-toggle="modal" data-bs-target="#decline">Rechazar</button>
					</td>`;

                    postulationContainer.append(container);

                    document
                        .querySelectorAll(".btn-modal-accept")
                        .forEach((btn) => btn.addEventListener("click", setSelectedId));
                    document
                        .querySelectorAll(".btn-modal-decline")
                        .forEach((btn) => btn.addEventListener("click", setSelectedId));

                    function setSelectedId(e) {
                        const id = e.target.closest("tr").querySelector("td:nth-child(2)").textContent;
                        selected = id;
                    }
                }
            );
        })
        .catch((e) => console.log(e));
}

function setPostulationStatus(email, status) {
    axios.put(`${baseURL}/setPostulationStatus/${email}/${status}`)
        .then((res) => {
            // console.log(res);
            alert("Cambio exitoso exitosamente");
            loadPostulations();
        })
        .catch((e) => console.log(e));
}

function handlePostulation() {
	acceptPostulationBtn.addEventListener('click', () => {
		const newStatus = "aceptada"
		// console.log("usuario acceptado", selected)
		setPostulationStatus(selected, newStatus)
	})
	declinedPostulationBtn.addEventListener('click', () => {
		const newStatus = "rechazada"
		// console.log("usuario declinado", selected)
		setPostulationStatus(selected, newStatus)
	})
}

function renderMonitors() {
	Promise.all([
		axios.get(`${baseURL}/postulationsByArea/academica`),
		axios.get(`${baseURL}/postulationsByArea/administrativa`)
	]).then(([academic, administrative]) => {
		academicData = academic.data;
		administrativeData = administrative.data;

		academicData.forEach((monitor) => createMonitorELements(monitor, academicRender))
		administrativeData.forEach((monitor) => createMonitorELements(monitor, adminRender));

		function createMonitorELements({nombre, correo, area}, container) {
			const virtualContainer = document.createElement("div");
			const formattedArea = area.charAt(0).toUpperCase() + area.slice(1);

            virtualContainer.innerHTML += `
				<div class="p-3 d-flex justify-content-between align-items-center border border-1 border-black-50">
					<div class="module-content">
						<h3 class="mb-3">${nombre}</h3>
						<p class="fw-bolder">correo: <span class="fw-medium">${correo}</span></p>
						<p class="fw-bolder">Area: <span class="fw-medium">${formattedArea}</span></p>
					</div>
					<div class="d-grid gap-2 ">
						<button type="button" class="btn btn-primary mon-info" data-bs-toggle="modal" data-bs-target="#showMonitorInfo">Ver Monitor</button>
						<button type="button" class="btn btn-secondary mon-feedback" data-bs-toggle="modal" data-bs-target="#feedbackMenu">Retroalimentacion</button>
					</div>
				</div>`;
			
			container.appendChild(virtualContainer)	
		}

		document.querySelectorAll('.mon-info').forEach(btn => btn.addEventListener('click', (e) => { 
			selectedEmail = e.target.parentElement.parentElement.querySelector('span').textContent;
			// console.log(selectedEmail)
			Promise.all([
				axios.get(`${baseURL}/getMonitors/${selectedEmail}`),
				axios.get(`${baseURL}/schedules/${selectedEmail}`)
			]).then(res => {
				const [monitorInfo, schedule] = res;
				console.log(monitorInfo, schedule)

				email.textContent =  monitorInfo.data.correo
				cycle.textContent =  monitorInfo.data.cuatrimestre
				average.textContent = monitorInfo.data.promedio
				area.textContent =  monitorInfo.data.area
				
				/* Schedule -------------------------------------- */

				scheduleTable.innerHTML = ''
				schedule.data.forEach(({day, start, end}) => {
					scheduleTable.innerHTML += `
						<tr>
							<td>${day}</td>
							<td>${start}</td>
							<td>${end}</td>
						</tr>`;
				})
				console.log(schedule.data)
			})
		}))

		document.querySelectorAll('.mon-feedback').forEach(btn => btn.addEventListener('click', (e) => { selectedEmail = e.target.parentElement.parentElement.querySelector('span') }))
	})
}

function setFeedbackForm() {	
	const updateButton = document.getElementById('updateButton');
    const scheduleForm = document.getElementById('scheduleForm');
	const textFeedback = scheduleForm.querySelector('textarea')
    updateButton.addEventListener('click', () => {
    	scheduleForm.requestSubmit();
    });

	scheduleForm.addEventListener('submit', (event) => {
		event.preventDefault();
		if (scheduleForm.checkValidity()) {
			const currentSession = JSON.parse(localStorage.getItem('currentSession'))

			const feedbackObj = {
				nombre: currentSession.name,
				correo: selectedEmail.textContent,
				texto:  textFeedback.value
			}

			axios.post(baseURL + '/giveFeedback', feedbackObj)
				.then(res => {
					alert('Retroalimentacion enviada con exito')
				})
				.catch(e => console.log(e))
		} else {
			event.preventDefault();
			event.stopPropagation();
		}
    });
}	

function setStadistics() {
	const roles = document.getElementById("roles_ch");
	const type = document.getElementById("monitors_type");
	const career = document.getElementById("monitors_career");
	const subjects = document.getElementById("monitor_subjects");
	const areas = document.getElementById("monitor_areas");

	Promise.all([
		axios.get(`${baseURL}/getUsersRoles`),
		axios.get(`${baseURL}/getMonitorsType`),
		axios.get(`${baseURL}/getMonitorsCareer`),
	]).then(([rolesResponse, typeResponse, careerResponse]) => {
		/* debugger */

		const rolesNums = processRolesData(rolesResponse.data);
        const monitorCounts = processMonitorTypeData(typeResponse.data);
        const { careerNames, careerCounts } = processCareerData(careerResponse.data);

        // Create charts
        createChart(roles, 'doughnut', ['Monitores', 'Binestar', 'Administradores'], rolesNums, '# of usuarios por rol');
        createChart(type, 'doughnut', ['Administrativa', 'Academica'], monitorCounts, '# monitor por tipo de monitoria');
        createChart(career, 'doughnut', careerNames, careerCounts, '# Carrera por monitor');
	})
}

function createChart(element, chartType, labels, data, label) {
    new Chart(element, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderWidth: 1
            }]
        }
    });
}

function processRolesData(rolesData) {
    return rolesData.map(count => count.conteo);
}

function processMonitorTypeData(typeData) {
    return typeData.map(count => count.conteo);
}

function processCareerData(careerData) {
    const careerNames = careerData.map(c => c.carrera);
    const careerCounts = careerData.map(c => c.conteo);
    return { careerNames, careerCounts };
}