const nameInp = document.querySelector("#name");
const lnameInp = document.querySelector("#lname");
const emailInp = document.querySelector("#email");
const careerInp = document.querySelector("#program");
const cuatrimestreInp = document.querySelector("#current_level");
const promedioInp = document.querySelector("#average");
const typeInp = document.querySelector("#tutoring_type");
const areaInp = document.querySelector("#tutoring_area");
const adminAreaInp = document.querySelector("#admin_area");

const form = document.querySelector("form");
const baseURL = 'https://backend-five-wheat.vercel.app'

window.addEventListener("DOMContentLoaded", () => {
    displayCareers();
    displayAreas();
});
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const userProposal = {
        name: nameInp.value,
        lname: lnameInp.value,
        email: emailInp.value,
        tutoringType: typeInp.value,
        avg: parseFloat(promedioInp.value),
        cicle: parseInt(cuatrimestreInp.value),
        career: parseInt(careerInp.value),
        id_materia: parseInt(areaInp.value) || null,
        id_admin: parseInt(adminAreaInp.value) || null,
    };

    console.log(userProposal);

    axios
        .post(baseURL + "/add_postulacion", userProposal)
        .then((res) => {
            alert(res.data.msg);
			console.log(res.data.msg)
            window.location.href = '../index.html'
            document.querySelectorAll("form input").forEach((inp) => (inp.value = ""));
        })
        .catch(function (error) {
            console.log(error);
        });
});

function displayCareers() {
    const selectElement = document.getElementById("program");

    axios.get(baseURL + "/career").then((res) => {
        const career = res.data;
		
        career.forEach((program) => {
            const option = document.createElement("option");
            option.value = program.id;
            option.textContent = program.nombre;
            selectElement.appendChild(option);
        });
    });
}

function displayAreas() {
    typeInp.addEventListener("change", () => {
        const area = typeInp.value;

        Promise.all([
            axios.get(baseURL + "/subjects"),
            axios.get(baseURL + "/admin_areas"),
        ])
            .then((res) => {
                const [academic, administrative] = res;
				
				const defaultSelection = document.createElement("option");
				defaultSelection.selected = true;
                defaultSelection.textContent = 'Seleccione...';

                adminAreaInp.innerHTML = "";
                areaInp.innerHTML = "";
				
                if (area == "administrativa") {
                    areaInp.disabled = true;
                    adminAreaInp.disabled = false;
                    console.log("Mostrando las areas administrativas...");

					adminAreaInp.appendChild(defaultSelection);
                    administrative.data.forEach((program) => {
                        const option = document.createElement("option");
                        option.value = program.id;
                        option.textContent = program.nombre;
                        adminAreaInp.appendChild(option);
                    });
                } else {
                    adminAreaInp.disabled = true;
                    areaInp.disabled = false;
                    console.log("Mostrando las areas academicas...");

					areaInp.appendChild(defaultSelection);
                    academic.data.forEach((program) => {
                        const option = document.createElement("option");
                        option.value = program.id;
                        option.textContent = program.nombre;
                        areaInp.appendChild(option);
                    });
                }
            })
            .catch((e) => console.log(e));
    });
}

/* Verificar si el correo ya existe antes de añadir la postulacion 👍 */
/* Cambiar el input de promedio para que acepte decimales 👍 */
/* Cambiar el campo de tipo de monitoria para que acepte "administrativa" ó "academica" 👍 */
