const userName = document.querySelector('#user-name')

window.addEventListener('DOMContentLoaded', () => {
	const currentSession = JSON.parse(localStorage.getItem('currentSession'));
	
	if(currentSession === null) {
		window.location.href = '../forbiden.html'
	}
	loadUserName();
}) 

const logOutBtn = document.querySelector('#logout-btn');

logOutBtn.addEventListener('click', () => {
	localStorage.setItem('currentSession', null)
}) 

function loadUserName() {
    const { name, lastName, role } = JSON.parse(localStorage.getItem("currentSession"));
    const virtualRole = role.charAt(0).toUpperCase() + role.slice(1);
    const virtualName = name.charAt(0).toUpperCase() + name.slice(1) + " " + lastName.charAt(0).toUpperCase() + lastName.slice(1);

    userName.textContent = `${virtualName} ( ${virtualRole} )`;
}

loadUserName();
