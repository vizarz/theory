const password = document.getElementById('password')
const confirmPassword = document.getElementById('confirmPassword')
const passwordError = document.getElementById('password-error')
const submitButton = document.querySelector('.auth-btn')

function validatePasswords() {
	if (confirmPassword.value && password.value !== confirmPassword.value) {
		confirmPassword.classList.add('password-mismatch')
		passwordError.style.display = 'block'
		submitButton.classList.add('password-mismatch-btn')
		return false
	} else {
		confirmPassword.classList.remove('password-mismatch')
		passwordError.style.display = 'none'
		submitButton.classList.remove('password-mismatch-btn')
		return true
	}
}

confirmPassword.addEventListener('input', validatePasswords)
password.addEventListener('input', function () {
	if (confirmPassword.value) {
		validatePasswords()
	}
})
