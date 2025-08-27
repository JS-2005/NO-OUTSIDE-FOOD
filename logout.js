$(document).ready(function () {
    userIdentity = localStorage.getItem("myAppLoggedInUser")
    $('#logoutButton').click(function () {
        let logoutConfirm = confirm("You are logged in as " + userIdentity + ". Are you sure to logged out? ")
        if (logoutConfirm == true) {
            localStorage.removeItem("myAppLoggedInUser");
            window.location.replace("../index.html");
        }
    })
})