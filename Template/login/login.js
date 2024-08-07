const baseURL = 'https://backend-five-wheat.vercel.app'
const form = document.querySelector("form");

const mailInp = document.querySelector("#email");
const passwordInp = document.querySelector("#password");
const roleInp = document.querySelector("#role");

const roles = {
	"monitor": "../vista_monitor/monitor.html",
	"administrador": "../vista_admin/admin.html",
	"bienestar": "../vista_bienestar/bienestar.html"
}

form.addEventListener('submit', (e) => {
	e.preventDefault();

	axios.get(baseURL + "/users").then((res) => {
		const users = res.data;
	
		users.forEach(({ name, lastName, email, password, role }) => {
			if (
				mailInp.value == email && 
				passwordInp.value == password && 
				roleInp.value == role
			) {
				alert("Login Exitoso!!");
				window.location.href = roles[role]
	
				localStorage.setItem('currentSession', JSON.stringify({"name": name, "lastName": lastName, "email": email, "pass": password, "role": role}) )
			}
		});
	});
}) 