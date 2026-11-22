async function login(e) {
    e.preventDefault();

    const loginDetails = {
        email: e.target.email.value,
        password: e.target.password.value
    };

    try {
        const response = await axios.post(
            'http://localhost:3000/user/login',
            loginDetails
        );

        alert(response.data.message);

    } catch (err) {
        document.body.innerHTML +=
            `<div style="color:red;">${err.response.data.message}</div>`;
    }
}