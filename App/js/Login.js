//const app_api_endpoint = "https://localhost:44392/api/";
const app_api_endpoint = "https://lemoin.massmailcampaign.com/api/";

document.addEventListener("DOMContentLoaded", function () {

    chrome.storage.local.get('LemonInUser', function (result) {
        console.log(result);
        if (result != undefined && result.LemonInUser != undefined && result.LemonInUser.Id != undefined && result.LemonInUser.Id != null) {
            console.log(result.LemonInUser);
            window.location.href = '/Popup.html';
        }
        else {
            $("#lblEmailError,#lblPasswordError").hide();
            $("#btnSubmitLogin").click(fn_UserLogin);
            $("#login-with-facebook").click(facebookLogin);
            $("#login-with-google").click(googleLogin);
            $("#login-with-twitter").click(twitterLogin);
            $("#divErrorMessage").hide();
            $("#txtUserEmail").change(fn_EmailChange);
            $("#txtUserPassword").change(fn_PasswordChange);
        }
    });
});

function facebookLogin() {
    const button = $(this);
    buttonLoading(button, true);
    logInWithFB().then(data => {
        $("#txtUserPassword").attr("value", data.password);
        $("#txtUserEmail").attr("value", data.email);
        fn_UserLogin();
        buttonLoading(button, false);
    }).catch(err => {
        alert(err);
        buttonLoading(button, false);
    });
}

function googleLogin() {
    const button = $(this);
    buttonLoading(button, true);
    logInWithGoogle().then(data => {
        $("#txtUserPassword").attr("value", data.email);
        $("#txtUserEmail").attr("value", data.email);
        fn_UserLogin();
        buttonLoading(button, false);
    }).catch(err => {
        alert(err);
        buttonLoading(button, false);
    });
}

function twitterLogin() {
    const button = $(this);
    buttonLoading(button, true);
    logInWithTwitter().then(data => {
        console.log({data})
        // $("#txtUserPassword").attr("value", data.email);
        // $("#txtUserEmail").attr("value", data.email);
        // fn_UserLogin();
        buttonLoading(button, false);
    }).catch(err => {
        // alert(err);
        buttonLoading(button, false);
    });
}

function fn_UserLogin() {

    $("#lblEmailError,#lblPasswordError").hide();
    $("#divErrorMessage").hide();
    var isValid = ValidateInputs();

    if (isValid) {

        var Email = $("#txtUserEmail").val();
        var Password = $("#txtUserPassword").val();

        $.ajax({
            type: "POST",
            url: app_api_endpoint + "account/login",
            dataType: "json",
            crossDomain: true,
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify({
                "Email": Email,
                "Password": Password,
            }),
            beforeSend: function () {
                $("#btnSubmitLogin").attr("disabled", true);
                $("#btnSubmitLogin").val("Processing...");
            },
            complete: function () {
                $("#btnSubmitLogin").attr("disabled", false);
                $("#btnSubmitLogin").val("LOGIN");
            },
            success: function (data) {

                $("#lblMessage").parent().removeClass("alert-success").removeClass("alert-danger");
                if (data != null && data != undefined) {
                    if (data.status) {

                        var user = {
                            Name: data.fullName,
                            Email: data.email,
                            Id: data.id,
                            Token: data.token
                        }

                        chrome.storage.local.set({ 'LemonInUser': user });
                        window.location.href = '/Popup.html';

                    }
                    else {
                        $("#divErrorMessage").show();
                        $("#lblMessage").parent().addClass("alert-danger");
                        $("#lblMessage").html(data.message);
                    }
                }
            },
            error: function (data) {
            }
        });

    }

}

function ValidateInputs() {

    var isValid = true;

    var Email = $("#txtUserEmail").val();
    var Password = $("#txtUserPassword").val();

    if (Email == "" || Email.trim() == "") {
        $("#lblEmailError").text("Email field is required.");
        $("#lblEmailError").show();
        isValid = false;
    }
    else {
        if (!IsEmail(Email)) {
            $("#lblEmailError").text("Enter valid email.");
            $("#lblEmailError").show();
            isValid = false;
        }
    }

    if (Password == "") {
        $("#lblPasswordError").text("Password field is required.");
        $("#lblPasswordError").show();
        isValid = false;
    }

    return isValid;
}

function IsEmail(email) {
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!regex.test(email)) {
        return false;
    } else {
        return true;
    }
}

function fn_EmailChange() {

    $("#lblEmailError").hide();
    var Email = $("#txtUserEmail").val();
    if (Email == "" || Email.trim() == "") {
        $("#lblEmailError").text("Email field is required.");
        $("#lblEmailError").show();
    }
    else {
        if (!IsEmail(Email)) {
            $("#lblEmailError").text("Enter valid email.");
            $("#lblEmailError").show();
        }
    }

}

function fn_PasswordChange() {

    var Password = $("#txtUserPassword").val();
    $("#lblPasswordError").hide();

    if (Password == "") {
        $("#lblPasswordError").text("Password field is required.");
        $("#lblPasswordError").show();
    }

}