const app_api_endpoint = GetAPIEndpoint();
var LoogedIn_UserId = "";

$(document).ready(function () {

    $("#divShareDetails,#lblCopyMessage").hide();

    chrome.storage.local.get('LemonInUser', function (result) {

        if (result != undefined && result.LemonInUser != undefined) {

            if (result.LemonInUser.Name != "" && result.LemonInUser.Name != undefined) {
                $("#lblUserName").text("Hello, " + result.LemonInUser.Name);
            }

            if (result.LemonInUser.Id != "" && result.LemonInUser.Id != undefined) {

                LoogedIn_UserId = result.LemonInUser.Id;

                LoadAllSharedFolders();
            }
        }
    });

    $("#btnBackToList").click(function () {
        location.href = "Popup.html?isFirst=false";
    });

    $("#btnLogout").click(fn_UserLogout);

    $("#btnRemoveAll").click(function () {

        if (confirm('Are you sure you want to remove all?')) {

            var LeadData = {
                "UserId": LoogedIn_UserId
            }

            $.ajax({
                type: "POST",
                url: app_api_endpoint + "User/DeleteSharedLeadByUser",
                dataType: "json",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(LeadData),
                beforeSend: function () {
                    $('#lemoin-overlay').show();
                },
                success: function (data) {
                    if (data != null && data != undefined) {
                        if (data.status != undefined && data.status == true) {
                            $("#divUserData").html('<p class="text-danger ml-5">No Data Found.</p>');
                            $("#btnRemoveAll").hide();
                        }
                    }
                },
                error: function (data) {
                },
                complete: function () {
                    $('#lemoin-overlay').hide();
                }
            });
        }
    });
});

function fn_UserLogout() {
    chrome.storage.local.remove("LemonInUser", function () {
        window.location.href = '/Login.html';
    });
}

function LoadAllSharedFolders() {
    $.ajax({
        type: "POST",
        url: app_api_endpoint + "Folder/GetSharedFolders",
        dataType: "json",
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify({
            "UserId": LoogedIn_UserId
        }),
        beforeSend: function () {
            $('#lemoin-overlay').show();
        },
        success: function (data) {
            if (data != null && data != undefined) {

                $("#accordinDesingation,#accordinSkill").html('');
                if (data.status != undefined && data.status == true) {
                    var allSharedData = data.data;

                    if (allSharedData != null && allSharedData != undefined) {

                        if (allSharedData.sharedDesignation != null && allSharedData.sharedDesignation.length > 0) {

                            var DesignationHTML = "";
                            var desingation = allSharedData.sharedDesignation;

                            for (var i = 0; i < desingation.length; i++) {

                                var designationClear = desingation[i].designation.replace(/ /g, "");
                                var allContacts = desingation[i].designationContact;

                                var alluserHTML = "";
                                for (var j = 0; j < allContacts.length; j++) {

                                    if (allContacts[j] != undefined) {
                                        var userName = allContacts[j].firstName + " " + allContacts[j].lastName;
                                        var userCompany = allContacts[j].company == null ? "" : allContacts[j].company;
                                        var contactId = allContacts[j].id;
                                        var userDesignation = allContacts[j].designation == null ? "" : allContacts[j].designation;
                                        var userProfileURL = allContacts[j].profileImageURL;
                                        var userEmail = allContacts[j].email;
                                        var userPhone = allContacts[j].phoneNumber;
                                        var userAddress = allContacts[j].address;

                                        if (userProfileURL == "" || userProfileURL == undefined || userProfileURL == null || userProfileURL.trim() == "") {
                                            userProfileURL = "img/userDefault.png";
                                        }

                                        var emailHTML = "", phoneHTML = "";
                                        if (userEmail != "" && userEmail != null && userEmail.trim() != "") {
                                            emailHTML = '<a style="color: #000;" href="mailto:' + userEmail + '"><i class="far fa-envelope mr-3 customtooltip">' + (userEmail != "" && userEmail.trim() != "" ? '<span class="classic">' + userEmail + '</span>' : "") + '</i></a>';
                                        }
                                        else {
                                            emailHTML = '<i class="far fa-envelope mr-3 customtooltip">' + (userEmail != "" && userEmail != null && userEmail.trim() != "" ? '<span class="classic">' + userEmail + '</span>' : "") + '</i>';
                                        }
                                        if (userPhone != "" && userPhone != null && userPhone.trim() != "") {
                                            phoneHTML = '<a style="color: #000;" href="callto:' + userPhone + '"><i class="fas fa-phone-alt mr-3 customtooltip">' + (userPhone != "" && userPhone.trim() != "" ? '<span class="classicphone">' + userPhone + '</span>' : "") + '</i></a>';
                                        }
                                        else {
                                            phoneHTML = '<i class="fas fa-phone-alt mr-3 customtooltip">' + (userPhone != "" && userPhone != null && userPhone.trim() != "" ? '<span class="classic">' + userPhone + '</span>' : "") + '</i>';
                                        }

                                        alluserHTML += '<div class="row mt-2 user-data-list">' +
                                            '<div class="col-1 pl-3"><img class="user-profile-img" src="' + userProfileURL + '" /><input type="hidden" value="' + contactId + '" /></div>' +
                                            '<div class="col-7"><p class="mb-0 user-name"><a href="UserDetails.html?back=shared&userid=' + contactId + '">' + userName + '</a></p><label class="user-company-info">' + userDesignation + ' | ' + userCompany + '</label></div>' +
                                            '<div class="col-4 text-right"><i class="far fa-map mr-3 customtooltip">' + (userAddress != "" && userAddress != null && userAddress.trim() != "" ? '<span class="classic">' + userAddress + '</span>' : "") + '</i>' +
                                            emailHTML + phoneHTML +
                                            '<i class="far fa-copy mr-3 copytoclipboard"></i>' +
                                            '<i class="far fa-trash-alt btnDeleteSingleUser" style="color:red" data-id="' + contactId + '"></i>' +
                                            '<input type="hidden" id="hdnAddress" value="' + (userAddress == null ? "" : userAddress) + '" /><input type="hidden" id="hdnEmail" value="' + (userEmail == null ? "" : userEmail) + '" /><input type="hidden" id="hdnPhone" value="' + (userPhone == null ? "" : userPhone) + '" /> </div>' +
                                            '</div>';
                                    }
                                }

                                var buttonHTMl = '<div class="col-12 mb-2 ml-4">' +
                                    '<button class="btn btn-primary custom-button" data-toggle="collapse" data-target="#collapse' + designationClear + '" aria-expanded="true" aria-controls="collapse' + designationClear + '">' + desingation[i].designation + '<i class="fa ml-3" aria-hidden="true"></i></button>' +
                                    '<div id="collapse' + designationClear + '" class="collapse" aria-labelledby="headingOne" data-parent="#accordinDesingation">' + alluserHTML + '</div>' +
                                    '</div>';

                                DesignationHTML += buttonHTMl;
                            }
                            $("#accordinDesingation").append(DesignationHTML);
                        }

                        if (allSharedData.sharedSkill != null && allSharedData.sharedSkill.length > 0) {

                            var SkillHTML = "";
                            var skills = allSharedData.sharedSkill;

                            for (var i = 0; i < skills.length; i++) {

                                var skillsClear = skills[i].skill.replace(/ /g, "");
                                var allContacts = skills[i].skillContact;

                                var alluserHTML = "";
                                for (var j = 0; j < allContacts.length; j++) {

                                    if (allContacts[j] != undefined) {
                                        var userName = allContacts[j].firstName + " " + allContacts[j].lastName;
                                        var userCompany = allContacts[j].company == null ? "" : allContacts[j].company;
                                        var contactId = allContacts[j].id;
                                        var userDesignation = allContacts[j].designation == null ? "" : allContacts[j].designation;
                                        var userProfileURL = allContacts[j].profileImageURL;
                                        var userEmail = allContacts[j].email;
                                        var userPhone = allContacts[j].phoneNumber;
                                        var userAddress = allContacts[j].address;

                                        if (userProfileURL == "" || userProfileURL == undefined || userProfileURL == null || userProfileURL.trim() == "") {
                                            userProfileURL = "img/userDefault.png";
                                        }

                                        var emailHTML = "", phoneHTML = "";
                                        if (userEmail != "" && userEmail != null && userEmail.trim() != "") {
                                            emailHTML = '<a style="color: #000;" href="mailto:' + userEmail + '"><i class="far fa-envelope mr-3 customtooltip">' + (userEmail != "" && userEmail.trim() != "" ? '<span class="classic">' + userEmail + '</span>' : "") + '</i></a>';
                                        }
                                        else {
                                            emailHTML = '<i class="far fa-envelope mr-3 customtooltip">' + (userEmail != "" && userEmail != null && userEmail.trim() != "" ? '<span class="classic">' + userEmail + '</span>' : "") + '</i>';
                                        }
                                        if (userPhone != "" && userPhone != null && userPhone.trim() != "") {
                                            phoneHTML = '<a style="color: #000;" href="callto:' + userPhone + '"><i class="fas fa-phone-alt mr-3 customtooltip">' + (userPhone != "" && userPhone.trim() != "" ? '<span class="classicphone">' + userPhone + '</span>' : "") + '</i></a>';
                                        }
                                        else {
                                            phoneHTML = '<i class="fas fa-phone-alt mr-3 customtooltip">' + (userPhone != "" && userPhone != null && userPhone.trim() != "" ? '<span class="classic">' + userPhone + '</span>' : "") + '</i>';
                                        }

                                        alluserHTML += '<div class="row mt-2 user-data-list">' +
                                            '<div class="col-1 pl-3"><img class="user-profile-img" src="' + userProfileURL + '" /><input type="hidden" value="' + contactId + '" /></div>' +
                                            '<div class="col-7"><p class="mb-0 user-name"><a href="UserDetails.html?back=shared&userid=' + contactId + '">' + userName + '</a></p><label class="user-company-info">' + userDesignation + ' | ' + userCompany + '</label></div>' +
                                            '<div class="col-4 text-right"><i class="far fa-map mr-3 customtooltip">' + (userAddress != "" && userAddress != null && userAddress.trim() != "" ? '<span class="classic">' + userAddress + '</span>' : "") + '</i>' +
                                            emailHTML + phoneHTML +
                                            '<i class="far fa-copy mr-3 copytoclipboard"></i>' +
                                            '<i class="far fa-trash-alt btnDeleteSingleUser" style="color:red" data-id="' + contactId + '"></i>' +
                                            '<input type="hidden" id="hdnAddress" value="' + (userAddress == null ? "" : userAddress) + '" /><input type="hidden" id="hdnEmail" value="' + (userEmail == null ? "" : userEmail) + '" /><input type="hidden" id="hdnPhone" value="' + (userPhone == null ? "" : userPhone) + '" /> </div>' +
                                            '</div>';
                                    }
                                }

                                var buttonHTMl = '<div class="col-12 mb-2 ml-4">' +
                                    '<button class="btn btn-primary custom-button" data-toggle="collapse" data-target="#collapse' + skillsClear + '" aria-expanded="true" aria-controls="collapse' + skillsClear + '">' + skills[i].skill + '<i class="fa ml-3" aria-hidden="true"></i></button>' +
                                    '<div id="collapse' + skillsClear + '" class="collapse" aria-labelledby="headingOne" data-parent="#accordinSkill">' + alluserHTML + '</div>' +
                                    '</div>';

                                SkillHTML += buttonHTMl;
                            }
                            $("#accordinSkill").append(SkillHTML);
                        }

                        if (allSharedData.sharedSkill.length == 0 && allSharedData.sharedDesignation.length == 0) {
                            $("#divUserData").html('<p class="text-danger ml-5">No Data Found.</p>');
                            $("#btnRemoveAll").hide();
                        }
                            
                    }
                    else {
                        $("#divUserData").html('<p class="text-danger ml-5">No Data Found.</p>');
                    }
                }
                else {
                    $("#divUserData").html('<p class="text-danger ml-5">No Data Found.</p>');
                }
            }
            else {
                $("#divUserData").html('<p class="text-danger ml-5">No Data Found.</p>');
            }
        },
        error: function (data) {
        },
        complete: function () {
            $('#lemoin-overlay').hide();
        }
    });
}

$(document).on("click", ".btnDeleteSingleUser", function () {
    if (confirm('Are you sure you want to delete?')) {

        var ContactId = $(this).attr('data-id');
        if (ContactId != undefined && ContactId != "") {

            var LeadData = {
                "ContactId": parseInt(ContactId)
            }

            $.ajax({
                type: "POST",
                url: app_api_endpoint + "User/DeleteLeadById",
                dataType: "json",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(LeadData),
                beforeSend: function () {
                    $('#lemoin-overlay').show();
                },
                success: function (data) {
                    if (data != null && data != undefined) {
                        if (data.status != undefined && data.status == true) {
                            LoadAllSharedFolders();
                        }
                    }
                },
                error: function (data) {
                },
                complete: function () {
                    $('#lemoin-overlay').hide();
                }
            });
        }
    }
});

$(document).on("click", ".copytoclipboard", function () {
    var currentUser = $(this);
    var address = currentUser.parent().find("#hdnAddress").val();
    var email = currentUser.parent().find("#hdnEmail").val();
    var phone = currentUser.parent().find("#hdnPhone").val();

    var value = "Address : " + address + ", Email : " + email + ", Phone : " + phone;
    fncopyToClipboard(value);
});

function fncopyToClipboard(value) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(value).select();
    document.execCommand("copy");
    $temp.remove();
    $("#lblCopyMessage").show();
    setTimeout(function () {
        $("#lblCopyMessage").hide();
    }, 3000);
}

