document.addEventListener('DOMContentLoaded', () => {

    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    const showLoginLink = document.getElementById('showLogin');
    const showSignupLink = document.getElementById('showSignup');

    const signupFormElement = document.getElementById('signup');
    const loginFormElement = document.getElementById('login');

    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');

    const USERS_KEY = 'myAppUsers';
    const LOGGED_IN_USER_KEY = 'myAppLoggedInUser';

    /* Shows a message to the user by displaying at the bottom center. */
    const showMessage = (message, isError = true) => {
        messageText.textContent = message;

        // Reset classes and apply Bootstrap utilities to show at bottom
        messageBox.className = ''; // clear any previous classes
        messageBox.classList.add(
            'alert',
            isError ? 'alert-danger' : 'alert-success',
            'position-fixed',
            'start-50',
            'translate-middle-x',
            'bottom-0',
            'mb-3',
            'd-block'
        );

        // Make sure it displays above other content
        messageBox.style.zIndex = '1080';

        // Show and auto-hide after 3 seconds; clear any previous timer
        messageBox.classList.remove('d-none');
        if (messageBox._hideTimeout) clearTimeout(messageBox._hideTimeout);
        messageBox._hideTimeout = setTimeout(() => {
            messageBox.classList.add('d-none');
        }, 3000);
    };


    /* Gets users from localStorage. */
    const getUsers = () => {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    };

    /* Saves users to localStorage. */
    const saveUsers = (users) => {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    };

    /* Toggles between the login and signup forms. */
    const switchForm = (formToShow) => {
        if (formToShow === 'login') {
            loginForm.classList.remove('form-hidden');
            signupForm.classList.add('form-hidden');
        } else {
            signupForm.classList.remove('form-hidden');
            loginForm.classList.add('form-hidden');
        }
    };

    /* Handles the signup form submission. */
    const handleSignup = (event) => {
        event.preventDefault();
        const form = event.target;

        // trigger browser's validation.
        if (!form.checkValidity()) {
            for (const element of form.elements) {
                if (element.willValidate && !element.validity.valid) {
                    showMessage(element.validationMessage);
                    return;
                }
            }
        }

        const email = event.target.email.value.trim();
        const password = event.target.password.value.trim();

        const users = getUsers();
        const userExists = users.some(user => user.email === email);

        if (userExists) {
            showMessage('An account with this email already exists.');
        } else {
            users.push({ email, password });
            saveUsers(users);
            showMessage('Account created successfully! Please log in.', false);
            switchForm('login');
            event.target.reset();
        }
    };

    // Handles the login form submission.
    const handleLogin = (event) => {
        event.preventDefault();
        const form = event.target;

        if (!form.checkValidity()) {
            for (const element of form.elements) {
                if (element.willValidate && !element.validity.valid) {
                    showMessage(element.validationMessage);
                    return; 
                }
            }
        }

        const email = event.target.email.value.trim();
        const password = event.target.password.value.trim();

        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem(LOGGED_IN_USER_KEY, email);
            window.location.replace('../userMain/userMain.html');
        } else {
            showMessage('Invalid email or password.');
        }
    };

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchForm('login');
    });

    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchForm('signup');
    });

    signupFormElement.addEventListener('submit', handleSignup);
    loginFormElement.addEventListener('submit', handleLogin);

    // Check for a logged-in user on page load
    const loggedInUser = localStorage.getItem(LOGGED_IN_USER_KEY);
    if (loggedInUser) {
        window.location.replace('userMain/userMain.html');
    } else {
        switchForm('signup');
        // Start with signup form if no one is logged in
    }
});

const back_btn = document.querySelector("button");
back_btn.addEventListener("click", function (e) {
    e.preventDefault();
    history.back();
});