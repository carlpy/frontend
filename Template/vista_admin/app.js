const form = document.querySelector("form");
const baseURL = 'https://backend-five-wheat.vercel.app'

const nameInp = document.querySelector("#name");
const lnameInp = document.querySelector("#lname");
const emailInp = document.querySelector("#mail");
const passInp = document.querySelector("#password");
const roleInp = document.querySelector("#role");

// for displaying the proper information
const btns = document.querySelectorAll("button[data-show]");
const content = document.querySelectorAll(".show-sect");

const showUsers = document.getElementById("show-users");
const addUsersForm = document.getElementById("add-users");
const addMonitor = document.getElementById("add-monitor");

// bootstrap modals (User creation)
const deleteBtn = document.querySelector(".delete-btn");
const editBtn = document.querySelector(".edit-btn");

// edit user form controls
const editNameInp = document.querySelector("#e_name");
const editLnameInp = document.querySelector("#e_lname");
const editEmailInp = document.querySelector("#e_mail");
const editPassInp = document.querySelector("#e_password");
const editRoleInp = document.querySelector("#e_role");

// bootstrap modals (Monitor creation)
const createBtn = document.querySelector(".create-btn");
const userInfo = document.querySelector("#showTheUserInfo .modal-body");

const table = document.getElementById("myTable")
const postulationsTable = document.getElementById("accepted-postulations")

let selected = 0;
let selectedEmail = "";

window.addEventListener("DOMContentLoaded", () => {
    loadUsers();
    loadAceptedPostulations();
    enableModalBtns();
    createMonitor();
});

function loadUsers() {
    axios.get(baseURL + "/users_admin").then((res) => {
        const users = res.data;
        const container = document.querySelector(".users-space");
        container.innerHTML = "";

        users.forEach(({ id, nombre, apellido, correo, contraseña, rol }) => {
            const row = document.createElement("tr");
            row.innerHTML = `
				<td class="data">${id}</td>
				<td>${nombre}</td>
				<td>${apellido}</td>
				<td>${correo}</td>
				<td>${contraseña}</td>
				<td>${rol}</td>
				<td class="d-flex">
					<button class="btn btn-warning btn-modal-edit" data-bs-toggle="modal" data-bs-target="#editUser"><img src="../../src/icons/edit.svg"></button>
					<button class="btn btn-danger btn-modal-delete" data-bs-toggle="modal" data-bs-target="#deleteUser"><img src="../../src/icons/delete.svg"></button>
				</td>`;

            container.append(row);
        });

		$(table).DataTable();

        document
            .querySelectorAll(".btn-modal-delete")
            .forEach((btn) => btn.addEventListener("click", setSelectedId));

        document.querySelectorAll(".btn-modal-edit").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                setSelectedId(e);
                let [currentUser] = users.filter((user) => {
                    if (user.id == selected) {
                        return user;
                    }
                });

                editNameInp.value = currentUser.nombre;
                editLnameInp.value = currentUser.apellido;
                editEmailInp.value = currentUser.correo;
                editPassInp.value = currentUser.contraseña;
                editRoleInp.value =
                    currentUser.rol == "monitor" ? 1 : currentUser.rol == "administrador" ? 2 : 3;
            })
        );

        function setSelectedId(e) {
            const id = e.target.closest("tr").querySelector("td:first-child").textContent;
            selected = id;
        }
    });
}

function loadAceptedPostulations() {
    axios
        .get(baseURL + "/postulations/aceptada")
        .then((res) => {
            const postulants = res.data;
            const container = document.querySelector(".postulations-space");
            container.innerHTML = "";

            postulants.forEach(({ nombre, correo, tipo }) => {
                const nombrel = nombre.split(" ")[0];
                const apellido = nombre.split(" ")[1];

                const row = document.createElement("tr");
                row.innerHTML = `
				<td>${nombrel}</td>
				<td>${apellido}</td>
				<td>${correo}</td>
				<td>${tipo}</td>
				<td>
					<button class="btn btn-primary btn-modal-create" data-bs-toggle="modal" data-bs-target="#createMonitor">Crear Monitor</button>
				</td>`;
                container.append(row);
            });

			
            document.querySelectorAll(".btn-modal-create").forEach((btn) =>
                btn.addEventListener("click", (e) => {
					const email = e.target
					.closest("tr")
					.querySelector("td:nth-child(3)").textContent;
                    selectedEmail = email;
                })
            );
			
			$(postulationsTable).DataTable();
        })
        .catch((e) => console.log(e));
}

function addUsers() {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const newUser = {
            name: nameInp.value,
            lname: lnameInp.value,
            email: emailInp.value,
            pass: passInp.value,
            role: parseInt(roleInp.value),
        };

        axios
            .post(baseURL + "/add_user", newUser)
            .then(function (response) {
                console.log(response);
				alert("usuario registrado exitosamente");
            })
            .catch(function (error) {
                console.log(error);
                alert("Error al registrar el usuario");
            });
    });
}

function showContent() {
    btns.forEach((btn) =>
        btn.addEventListener("click", () => {
            content.forEach((content) => content.classList.add("d-none"));
            const btnData = btn.dataset.show;
            if (btnData === "users") {
                showUsers.classList.remove("d-none");
                loadUsers();
            }
            if (btnData === "add-users") {
                addUsersForm.classList.remove("d-none");
            }
            if (btnData === "add-monitor") {
                addMonitor.classList.remove("d-none");
            } // got to have a method where render the postulations
        })
    );
}

function enableModalBtns() {
    deleteBtn.addEventListener("click", () => {
        axios
            .delete(`${baseURL}/deleteUser/${selected}`)
            .then((res) => {
                console.log(res);
                alert("Usuario eliminado de manera exitosa");
                loadUsers();
            })
            .catch((e) => console.log(e));
    });

    editBtn.addEventListener("click", () => {
        const updatedInfo = {
            name: editNameInp.value,
            lname: editLnameInp.value,
            email: editEmailInp.value,
            pass: editPassInp.value,
            role: parseInt(editRoleInp.value),
        };

        const isNullish = Object.values(updatedInfo).some((info) => !info);

        if (!isNullish) {
            axios
                .put(`${baseURL}/editUser/${selected}`, updatedInfo)
                .then((res) => {
                    console.log(res);
                    alert("Usuario acutalizado satisfactoriamente");
                    loadUsers();
                })
                .catch((e) => console.log(e));
        } else {
            alert("Tiene uno o mas campos vacios");
        }
    });
}

addUsers();
showContent();

function createMonitor() {
    createBtn.addEventListener("click", () => {
        // first pass the information to the monitor's table
        console.log(selectedEmail);
		const createMonitorRequest = axios.post(baseURL + "/createMonitor", { email: selectedEmail, });
        const updatePostulationStatusRequest = axios.put(`${baseURL}/setPostulationStatus/${selectedEmail}/completada`);

        // Execute all requests in parallel
        Promise.all([
            createMonitorRequest,
            updatePostulationStatusRequest,
        ])
            .then((responses) => {
                // Handle responses from all requests
                console.log("Create Monitor Response:", responses[0].data);
                console.log("Update Postulation Status Response:", responses[1].data);

                alert("Monitor creado, status actualizado y usuario creado exitosamente");
				alert(`Para entrar sus credenciales son: \nCorreo: ${selectedEmail}\nContraseña temporal: contraseña`)
                loadAceptedPostulations();
                loadUsers();
            })
            .catch((error) => {
                // Handle errors from any of the requests
                console.error("Error:", error);
                alert("Error al realizar una o más operaciones.");
            });
    });
}