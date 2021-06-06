﻿const app_api_endpoint = GetAPIEndpoint();

document.addEventListener("DOMContentLoaded", function () {

    $("#UserloadingScreen").hide();
    chrome.storage.local.get('LemonInUser', function (result) {
        console.log(result);
        if (result != undefined && result.LemonInUser != undefined && result.LemonInUser.Id != undefined && result.LemonInUser.Id != null) {
            console.log(result.LemonInUser);
            window.location.href = '/Popup.html';
        }
        else {
            $("#lblEmailError,#lblPasswordError").hide();
            $("#btnSubmitLogin").click(fn_UserLogin);
            $("#divErrorMessage").hide();
            $("#txtUserEmail").change(fn_EmailChange);
            $("#txtUserPassword").change(fn_PasswordChange);
        }
    });
});


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

                        $("#lblName").text(data.fullName);
                        $("#loginscreen").hide();
                        $("#UserloadingScreen").show();
                        setTimeout(function () {
                            window.location.href = '/Popup.html';
                        }, 1000);

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