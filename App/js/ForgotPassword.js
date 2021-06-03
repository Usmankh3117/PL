//const app_api_endpoint = "https://localhost:44392/api/";
const app_api_endpoint = "https://lemoin.massmailcampaign.com/api/";

document.addEventListener("DOMContentLoaded", function () {

    $("#lblEmailError").hide();
    $("#divErrorMessage").hide();
    $("#divSignupDetails").show();
    $("#divVerifyUser").hide();
    $("#btnSubmitForgot").click(fn_UserForGotPassword);
    $("#btnBacktoLogin").click(fn_BacktoLogin)

});

function fn_BacktoLogin() {
    location.href = "/Login.html";
}

function fn_UserForGotPassword() {

    $("#lblEmailError").hide();
    $("#divErrorMessage").hide();
    var isValid = ValidateInputs();
    if (isValid) {

        var Email = $("#txtUserEmail").val();

        $.ajax({
            type: "POST",
            url: app_api_endpoint + "account/ForgotPassword",
            dataType: "json",
            crossDomain: true,
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                "Email": Email
            }),
            beforeSend: function () {
                $("#btnSubmitForgot").attr("disabled", true);
                $("#btnSubmitForgot").val("Processing...");
            },
            complete: function () {
                $("#btnSubmitForgot").attr("disabled", false);
                $("#btnSubmitForgot").val("LOGIN");
            },
            success: function (data) {

                $("#lblMessage").parent().removeClass("alert-success").removeClass("alert-danger");
                if (data != null && data != undefined) {
                    if (data.status) {
                        $("#txtUserEmail").val('');
                        $("#divSignupDetails").hide();
                        $("#divVerifyUser").show();
                        $("#lblHeadMessage").text("Thank you.");
                        //$("#divErrorMessage").show();
                        //$("#lblMessage").parent().addClass("alert-success");
                        //$("#lblMessage").html(data.message);
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