const contentBtns = document.querySelectorAll("button[data-show]");
const showZones = document.querySelectorAll(".show-sect");
const baseURL = 'https://backend-five-wheat.vercel.app'

/* content display */
const personalSection = document.querySelector("#personal-data");
const feedbackSection = document.querySelector("#feedback");
const scheduleSection = document.querySelector("#schedule");

/* form dom controls */
const scheduleForm = document.getElementById("scheduleForm");
const weekdays = document.querySelectorAll('.weekdays span');
const weekStartDate = document.querySelectorAll('.weekdays .start_time');
const weekEndDate = document.querySelectorAll('.weekdays .end_time');

/* schedule DOM */
const scheduleTable = document.querySelector('.schedule-table');
const feedbackContainer = document.querySelector('.feedbacks-container');

/* session data */
const session = JSON.parse(localStorage.getItem('currentSession'))

window.addEventListener("DOMContentLoaded", () => {
	loadContent();
	renderSchedules();
	submitScheduleData();
	renderPersonalInfo()
});

function loadContent() {
    contentBtns.forEach((btn) =>
        btn.addEventListener("click", () => {
            showZones.forEach((zone) => zone.classList.add("d-none"));
            if (btn.dataset.show === "personal-info") {
                personalSection.classList.remove("d-none");
            }
            if (btn.dataset.show === "feedback") {
                feedbackSection.classList.remove("d-none");
            }
            if (btn.dataset.show === "schedule") {
                scheduleSection.classList.remove("d-none");
            }
        })
    );
}

function submitScheduleData() {
	const form = document.getElementById("scheduleForm");
	const updateButton = document.getElementById("updateButton"); 

	updateButton.addEventListener("click", function (event) {
		event.preventDefault();
		const horarios = [{email: session.email },]

 		if (form.checkValidity()) { /* this is after you filled up the form */
			for(let i = 0; i < weekdays.length; i++) {
				horarios.push({
					day: weekdays[i].textContent,
					start: weekStartDate[i].value,
					end: weekEndDate[i].value,
				})
			}

			console.log(horarios)
			axios.post(baseURL + '/createSchedule', horarios)
				.then(res => {
					console.log(res.data)
					renderSchedules();
				})
				.catch(e => console.log(e))
		} else {
			form.reportValidity();
		}
	});
}

function renderSchedules() {
	axios.get(baseURL + `/schedules/${session.email}`)
		.then(res => {
			const data = res.data
			const vcontainer = document.createElement('tbody')
			scheduleTable.innerHTML = "" 
			data.forEach(({day,start, end}) => {
				vcontainer.innerHTML += `
					<tr>
						<td>${day}</td>
						<td>${start}</td>
						<td>${end}</td>
					</tr>`;
			})
			scheduleTable.appendChild(vcontainer)
		}).catch(e => console.log(e))
}

function renderPersonalInfo() {
	Promise.all([
		axios.get(`${baseURL}/getMonitors/${session.email}`),
		axios.get(`${baseURL}/feedback/${session.email}`)
	]).then((res) => {
		const [monInfo, feedbacks] = res;
		/* Mon info */
		document.querySelector('.email').textContent = monInfo.data.correo;
		document.querySelector('.cycle').textContent = monInfo.data.cuatrimestre;
		document.querySelector('.average').textContent = monInfo.data.promedio;
		document.querySelector('.area').textContent = monInfo.data.area;

		/* Feedbacks */
		console.log(feedbacks.data)
		feedbacks.data.forEach(({nombre_bienestar, fecha, mensaje}) => {
			const card = document.createElement('div')
			card.className = 'card mb-2'
			card.innerHTML = `
				<div class="card-body">
					<h6 class="card-subtitle mb-2 text-body-secondary">${nombre_bienestar}</h6>
					<h5 class="card-title">${fecha}</h5>
					<p class="card-text">${mensaje}</p>
				</div>`;
				feedbackContainer.appendChild(card)
		})
	})
}