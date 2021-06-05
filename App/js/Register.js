const app_api_endpoint = GetAPIEndpoint();

document.addEventListener("DOMContentLoaded", function () {

    $("#divSignupDetails").show();
    $("#divVerifyUser").hide();
    $("#lblFullNameError,#lblEmailError,#lblPasswordError").hide();
    $("#divErrorMessage").hide();
    $("#btnSubmitRegister").click(fn_UserRegister);
    $("#register-with-facebook").click(facebookRegister);
    $("#register-with-google").click(goolgeRegister);
    $("#register-with-twitter").click(twitterRegister);
    $("#txtFullName").change(fn_FullNameChange);
    $("#txtEmail").change(fn_EmailChange);
    $("#txtPassword").change(fn_PasswordChange);
    $("#btnBacktoLogin").click(fn_BacktoLogin)

});

function fn_BacktoLogin() {
    location.href = "/Login.html";
}

function facebookRegister() {
    const button = $(this);
    buttonLoading(button, true);
    logInWithFB().then(data => {
        $("#txtFullName").attr("value", data.name);
        $("#txtPassword").attr("value", data.password);
        $("#txtEmail").attr("value", data.email);
        fn_UserRegister();
        buttonLoading(button, false);
    }).catch(err => {
        alert(err);
        buttonLoading(button, false);
    });
}

function goolgeRegister() {
    const button = $(this);
    buttonLoading(button, true);
    logInWithGoogle().then(data => {
        $("#txtFullName").attr("value", data.name.split("@")[0]);
        $("#txtPassword").attr("value", data.email);
        $("#txtEmail").attr("value", data.email);
        fn_UserRegister();
        buttonLoading(button, false);
    }).catch(err => {
        alert(err);
        buttonLoading(button, false);
    });
}


function twitterRegister() {
    const button = $(this);
    buttonLoading(button, true);
    logInWithTwitter().then(data => {
        console.log({data});
        // $("#txtFullName").attr("value", data.name.split("@")[0]);
        // $("#txtPassword").attr("value", data.email);
        // $("#txtEmail").attr("value", data.email);
        // fn_UserRegister();
        buttonLoading(button, false);
    }).catch(err => {
        alert(err);
        buttonLoading(button, false);
    });
}



function fn_UserRegister() {

    $("#lblFullNameError,#lblEmailError,#lblPasswordError").hide();
    $("#divErrorMessage").hide();
    var isValid = ValidateInputs();
    if (isValid) {

        var FullName = $("#txtFullName").val();
        var Email = $("#txtEmail").val();
        var Password = $("#txtPassword").val();

        $.ajax({
            type: "POST",
            url: app_api_endpoint + "account/register",
            dataType: "json",
            crossDomain: true,
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                "FirstName": FullName,
                "Email": Email,
                "Password": Password,
            }),
            beforeSend: function () {
                $("#btnSubmitRegister").attr("disabled", true);
                $("#btnSubmitRegister").val("Processing...");
            },
            complete: function () {
                $("#btnSubmitRegister").attr("disabled", false);
                $("#btnSubmitRegister").val("SIGN UP");
            },
            success: function (data) {

                $("#lblMessage").parent().removeClass("alert-success").removeClass("alert-danger");
                if (data != null && data != undefined) {
                    if (data.status) {
                        $("#divSignupDetails").hide();
                        $("#divVerifyUser").show();
                        $("#lblHeadMessage").text("Thank you! Account successfully created.");
                        //$("#divErrorMessage").show();
                        //$("#lblSuccessMessage").parent().addClass("alert-success");
                        //$("#lblSuccessMessage").html(data.message);
                        $("#txtFullName,#txtEmail,#txtPassword").val('');
                    }
                    else {
                        $("#divSignupDetails").show();
                        $("#divVerifyUser").hide();

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

    var FullName = $("#txtFullName").val();
    var Email = $("#txtEmail").val();
    var Password = $("#txtPassword").val();

    if (FullName == "" || FullName.trim() == "") {
        $("#lblFullNameError").text("Full Name field is required.");
        $("#lblFullNameError").show();
        isValid = false;
    }

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

    if (Password == "" || Password.trim() == "") {
        $("#lblPasswordError").text("Password field is required.");
        $("#lblPasswordError").show();
        isValid = false;
    }
    else {
        if (Password.length < 6) {
            $("#lblPasswordError").text("The Password must be at least 6 characters long, non alphanumeric, one lowercase and one uppercase");
            $("#lblPasswordError").show();
            isValid = false;
        }

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

function fn_FullNameChange() {

    var FullName = $("#txtFullName").val();
    $("#lblFullNameError").hide();

    if (FullName == "" || FullName.trim() == "") {
        $("#lblFullNameError").text("Full Name field is required.");
        $("#lblFullNameError").show();
    }

}

function fn_EmailChange() {

    var Email = $("#txtEmail").val();
    $("#lblEmailError").hide();

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

    var Password = $("#txtPassword").val();
    $("#lblPasswordError").hide();

    if (Password == "" || Password.trim() == "") {
        $("#lblPasswordError").text("Password field is required.");
        $("#lblPasswordError").show();
    }
}