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

let selected = 0;
let selectedEmail = '';

window.addEventListener("DOMContentLoaded", () => {
    loadPostulations();
    loadContent();
	handlePostulation();
	renderMonitors();
	setFeedbackForm();
	/* setStadistics(); to fix stadistics */
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
			if (btn.dataset.show === "stadistics") { statsContainer.classList.remove("d-none") } 
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
		axios.get(baseURL + '/postulationsByArea/academica'),
		axios.get(baseURL + '/postulationsByArea/administrativa')
	]).then(responses => {
		const [academic, administrative] = responses;
		
		academic.data.forEach((monitor) => createMonitorELements(monitor, academicRender))
		administrative.data.forEach((monitor) => createMonitorELements(monitor, adminRender));

		// console.log(academic.data, administrative.data)

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
		axios.get(baseURL + "/getUsersRoles"),
		axios.get(baseURL + "/getMonitorsType"),
		axios.get(baseURL + "/getMonitorsCareer"),
		axios.get(baseURL + "/getMonitorsArea/academica"),
		axios.get(baseURL + "/getMonitorsArea/administrativa"),
	]).then(res => {
		const [countedRoles, monitorTypes, monitorCareer, academicMons, administrativeMons] = res

		// roles counter
		const rolesChart = countedRoles.data
		const rolesNums = rolesChart.map(count => count.conteo)

		new Chart(roles, {
			type: 'doughnut',
			data: {
				labels: ['Monitores', 'Binestar', 'Administradores'],
				datasets: [{
					label: '# of usuarios por rol',
					data: rolesNums,
					borderWidth: 1
				}]
			}
		})

		// monitors per type
		const monitorType = monitorTypes.data
		const monitorCounts = monitorType.map(count => count.conteo)

		new Chart(type, {
			type: 'doughnut',
			data: {
				labels: ['Academica', 'Administrativa'],
				datasets: [{
					label: '# monitor por tipo de monitoria',
					data: monitorCounts,
					borderWidth: 1
				}]
			}
		})

		// career per monitor
		const mCareer = monitorCareer.data
		const careerNames = mCareer.map(c => c.carrera)
		const careerCounts = mCareer.map(c => c.conteo)

		new Chart(career, {
			type: 'bar',
			data: {
				labels: careerNames,
				datasets: [{
					label: '# Carrera por monitor',
					data: careerCounts,
					borderWidth: 1
				}]
			}
		})

		// area per academic monitor
		const acam_area = academicMons.data
		const acamNames = acam_area.map(c => c.area)
		const acamrCounts = acam_area.map(c => c.conteo)

		new Chart(subjects, {
			type: 'bar',
			data: {
				labels: acamNames,
				datasets: [{
					label: '# Area por monitor academico',
					data: acamrCounts,
					borderWidth: 1
				}]
			}
		})

		// area per administrative monitor
		const admins_area = administrativeMons.data
		const adminsNames = admins_area.map(c => c.area)
		const adminsCounts = admins_area.map(c => c.conteo)

		new Chart(areas, {
			type: 'bar',
			data: {
				labels: adminsNames,
				datasets: [{
					label: '# Area por monitor administrativo',
					data: adminsCounts,
					borderWidth: 1
				}]
			}
		})
	})

}