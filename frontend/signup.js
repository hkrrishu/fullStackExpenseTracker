async function signup(e) {
    e.preventDefault();

    const signupDetails = {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value
    };

    try {
        const response = await axios.post(
            'http://localhost:3000/user/signup',
            signupDetails
        );

        if (response.status === 201) {
            window.location.href = '../Login/login.html';
        } else {
            throw new Error('Failed to signup');
        }
    } catch (err) {
        document.body.innerHTML += `<div style="color:red;">${err}</div>`;
    }
}