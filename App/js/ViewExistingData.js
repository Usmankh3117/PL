const app_api_endpoint = GetAPIEndpoint();

var LoogedIn_UserId = "";
var PageNumber = 1;
var PageSize = 5;
var AllLeadsData = [];

$(document).ready(function () {

    $("#lblCopyMessage").hide();
    $("#divShareDetails").hide();
    $("#lblShareEmail").hide();
    $("#btnRemoveAll").hide();
    $(".pagination-content").hide();

    chrome.storage.local.get('LemonInUser', function (result) {

        if (result != undefined && result.LemonInUser != undefined) {

            if (result.LemonInUser.Name != "" && result.LemonInUser.Name != undefined) {
                $("#lblUserName").text("Hello, " + result.LemonInUser.Name);
            }

            if (result.LemonInUser.Id != "" && result.LemonInUser.Id != undefined) {

                LoogedIn_UserId = result.LemonInUser.Id;
                var folderType = getUrlVars()["folderType"];
                var folderValue = getUrlVars()["folderValue"];
                var skillName = getUrlVars()["skillName"];

                if (folderType == undefined || folderType == null) {

                    var shared = getUrlVars()["isshared"];
                    if (shared == undefined || shared == null) {
                        $("#btnRemoveAll").show();
                        DefaluAllData(result.LemonInUser.Id);
                    }
                    else if (shared == 1) {
                        $("#btnRemoveAll").hide();
                        SharedAllData(result.LemonInUser.Id);
                    }

                    $("#lblPageHead").text("Existing Data");
                    $("#divDefaultDownload").show();
                    $("#divFolderDownload").hide();

                    $("#divShareDetails").hide();
                    $("#hdnFolderType").val('');
                    $("#hdnFolderValue").val('');
                }
                else if (folderType == "designation") {

                    $("#lblPageHead").text(decodeURI(folderValue));
                    $("#divDefaultDownload").hide();
                    $("#divFolderDownload").show();

                    UserDataByDesignationFolder(result.LemonInUser.Id, folderValue);
                    $("#divShareDetails").show();
                    $("#hdnFolderType").val(folderType);
                    $("#hdnFolderValue").val(folderValue);
                    $("#btnRemoveAll").show();
                }
                else if (folderType == "skill") {
                    $("#lblPageHead").text(decodeURI(skillName));
                    $("#divDefaultDownload").hide();
                    $("#divFolderDownload").show();

                    UserDataBySkillFolder(result.LemonInUser.Id, folderValue);
                    $("#divShareDetails").show();
                    $("#hdnFolderType").val(folderType);
                    $("#hdnFolderValue").val(folderValue);
                    $("#btnRemoveAll").show();
                }
            }
        }
    });

    $("#btnBackToList").click(function () {

        var folderType = getUrlVars()["folderType"];
        if (folderType == undefined || folderType == null)
            location.href = "Popup.html?isFirst=false";
        else
            location.href = "FolderData.html";

    });
    $("#btnLogout").click(fn_UserLogout);

    $("#btnPreviuos").click(function () {

        if (AllLeadsData != null && AllLeadsData != undefined && AllLeadsData.length > 0) {
            PageNumber--;
            ShowDataBasedonPage(PageNumber, AllLeadsData);
            ShowPrevNext(PageNumber, AllLeadsData);
        }

    });

    $("#btnNext").click(function () {

        if (AllLeadsData != undefined && AllLeadsData != null && AllLeadsData.length > 0) {
            PageNumber++;
            ShowDataBasedonPage(PageNumber, AllLeadsData);
            ShowPrevNext(PageNumber, AllLeadsData);
        }

    });

    $("#btnRemoveAll").click(function () {

        if (confirm('Are you sure you want to remove all?')) {

            var folderType = getUrlVars()["folderType"];
            var folderValue = getUrlVars()["folderValue"];

            if (folderType == undefined || folderType == null) {

                var LeadData = {
                    "UserId": LoogedIn_UserId
                }
                $.ajax({
                    type: "POST",
                    url: app_api_endpoint + "User/DeleteLeadByUser",
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
                                $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                                $("#btnPreviuos,#btnNext").hide();
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
            else {

                var LeadData = {
                    "UserId": LoogedIn_UserId,
                    "FolderType": folderType,
                    "FolderValue": folderValue,
                }
                $.ajax({
                    type: "POST",
                    url: app_api_endpoint + "Folder/DeleteFolderByType",
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
                                $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                                $("#btnPreviuos,#btnNext").hide();
                                $(".pagination-content").hide();
                                $("#lblCurrentPage,#lblTotalPage").text('');
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

    $("#btnShareFolder").click(function () {

        $("#lblShareEmail").removeClass("text-success").removeClass("text-danger");
        $("#lblShareEmail").hide();
        var Email = $("#txtShareEmail").val();
        var isValid = true;

        if (Email == "" || Email.trim() == "") {
            $("#lblShareEmail").text("Email field is required.");
            $("#lblShareEmail").show();
            $("#lblShareEmail").addClass("text-danger");
            isValid = false;
        }
        else {
            if (!IsEmail(Email)) {
                $("#lblShareEmail").text("Enter valid email.");
                $("#lblShareEmail").show();
                $("#lblShareEmail").addClass("text-danger");
                isValid = false;
            }
        }

        if (isValid) {

            var folderType = $("#hdnFolderType").val();
            var folderValue = $("#hdnFolderValue").val();

            $.ajax({
                type: "POST",
                url: app_api_endpoint + "Folder/ShareUserFolder",
                dataType: "json",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({
                    "UserId": LoogedIn_UserId,
                    "Email": Email,
                    "FolderType": folderType,
                    "FolderValue": folderValue,
                }),
                beforeSend: function () {
                    $('#lemoin-overlay').show();
                },
                success: function (data) {
                    if (data != null && data != undefined) {

                        $("#lblShareEmail").removeClass("text-success").removeClass("text-danger");
                        if (data.status != undefined) {
                            if (data.status == true) {
                                $("#txtShareEmail").val('');
                                $("#lblShareEmail").text(data.message);
                                $("#lblShareEmail").show();
                                $("#lblShareEmail").addClass("text-success");
                            }
                            else {
                                $("#lblShareEmail").text(data.message);
                                $("#lblShareEmail").show();
                                $("#lblShareEmail").addClass("text-danger");
                            }
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

function DefaluAllData(userID) {
    $.ajax({
        type: "POST",
        url: app_api_endpoint + "User/GetAllLeadByUser",
        dataType: "json",
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify({
            "UserId": userID
        }),
        beforeSend: function () {
            $('#lemoin-overlay').show();
        },
        success: function (data) {
            if (data != null && data != undefined) {

                if (data.status != undefined && data.status == true) {
                    AllLeadsData = data.data;

                    if (AllLeadsData != null && AllLeadsData.length > 0) {
                        GenerateCSVData(AllLeadsData);
                        ShowDataBasedonPage(PageNumber, AllLeadsData);
                        ShowPrevNext(PageNumber, AllLeadsData);
                    }
                    else {
                        $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                        $("#btnPreviuos,#btnNext").hide();
                    }
                }
                else {
                    $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                    $("#btnPreviuos,#btnNext").hide();
                }
            }
            else {
                $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                $("#btnPreviuos,#btnNext").hide();
            }
        },
        error: function (data) {
        },
        complete: function () {
            $('#lemoin-overlay').hide();
        }
    });
}

function SharedAllData(userID) {
    $.ajax({
        type: "POST",
        url: app_api_endpoint + "User/GetAllSharedLeadByUser",
        dataType: "json",
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify({
            "UserId": userID
        }),
        beforeSend: function () {
            $('#lemoin-overlay').show();
        },
        success: function (data) {
            if (data != null && data != undefined) {

                if (data.status != undefined && data.status == true) {
                    AllLeadsData = data.data;

                    if (AllLeadsData != null && AllLeadsData.length > 0) {
                        GenerateCSVData(AllLeadsData);
                        ShowDataBasedonPage(PageNumber, AllLeadsData);
                        ShowPrevNext(PageNumber, AllLeadsData);
                    }
                    else {
                        $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                        $("#btnPreviuos,#btnNext").hide();
                    }
                }
                else {
                    $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                    $("#btnPreviuos,#btnNext").hide();
                }
            }
            else {
                $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                $("#btnPreviuos,#btnNext").hide();
            }
        },
        error: function (data) {
        },
        complete: function () {
            $('#lemoin-overlay').hide();
        }
    });
}

function UserDataByDesignationFolder(userID, designation) {

    $.ajax({
        type: "POST",
        url: app_api_endpoint + "Folder/GetuserByDesignation",
        dataType: "json",
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify({
            "UserId": userID,
            "Designation": designation
        }),
        beforeSend: function () {
            $('#lemoin-overlay').show();
        },
        success: function (data) {
            if (data != null && data != undefined) {

                if (data.status != undefined && data.status == true) {
                    AllLeadsData = data.data;

                    if (AllLeadsData != null && AllLeadsData.length > 0) {
                        GenerateCSVData(AllLeadsData);
                        ShowDataBasedonPage(PageNumber, AllLeadsData);
                        ShowPrevNext(PageNumber, AllLeadsData);
                    }
                    else {
                        $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                        $("#btnPreviuos,#btnNext").hide();
                    }
                }
                else {
                    $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                    $("#btnPreviuos,#btnNext").hide();
                }
            }
            else {
                $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                $("#btnPreviuos,#btnNext").hide();
            }
        },
        error: function (data) {
        },
        complete: function () {
            $('#lemoin-overlay').hide();
        }
    });
}

function UserDataBySkillFolder(userID, skillId) {
    $.ajax({
        type: "POST",
        url: app_api_endpoint + "Folder/GetuserBySkill",
        dataType: "json",
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify({
            "UserId": userID,
            "SkillId": parseInt(skillId)
        }),
        beforeSend: function () {
            $('#lemoin-overlay').show();
        },
        success: function (data) {
            if (data != null && data != undefined) {

                if (data.status != undefined && data.status == true) {
                    AllLeadsData = data.data;

                    if (AllLeadsData != null && AllLeadsData.length > 0) {
                        GenerateCSVData(AllLeadsData);
                        ShowDataBasedonPage(PageNumber, AllLeadsData);
                        ShowPrevNext(PageNumber, AllLeadsData);
                    }
                    else {
                        $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                        $("#btnPreviuos,#btnNext").hide();
                    }
                }
                else {
                    $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                    $("#btnPreviuos,#btnNext").hide();
                }
            }
            else {
                $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                $("#btnPreviuos,#btnNext").hide();
            }
        },
        error: function (data) {
        },
        complete: function () {
            $('#lemoin-overlay').hide();
        }
    });
}


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


function ShowDataBasedonPage(pageNumber, allUserData) {

    var start = (pageNumber - 1) * PageSize;
    var end = start + PageSize;

    var alluserHTML = "";
    for (var i = start; i < end; i++) {

        if (allUserData[i] != undefined) {
            var userName = allUserData[i].firstName + " " + allUserData[i].lastName;
            var userCompany = allUserData[i].company == null ? "" : allUserData[i].company;
            var contactId = allUserData[i].id;
            var userId = allUserData[i].userId;
            var userDesignation = allUserData[i].designation == null ? "" : allUserData[i].designation;
            var userProfileURL = allUserData[i].profileImageURL;
            var userEmail = allUserData[i].email;
            var userPhone = allUserData[i].phoneNumber;
            var userAddress = allUserData[i].address;

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

            alluserHTML += '<div class="row mb-3 user-data-list">' +
                '<div class="col-1"></div><div class="col-1 pl-0"><img class="user-profile-img" src="' + userProfileURL + '" /><input type="hidden" value="' + contactId + '" /></div>' +
                '<div class="col-6"><p class="mb-0 user-name"><a href="UserDetails.html?userid=' + contactId + '">' + userName + '</a></p><label class="user-company-info">' + userDesignation + ' | ' + userCompany + '</label></div>' +
                '<div class="col-4 text-right"><i class="far fa-map mr-3 customtooltip">' + (userAddress != "" && userAddress != null && userAddress.trim() != "" ? '<span class="classic">' + userAddress + '</span>' : "") + '</i>' +
                emailHTML + phoneHTML +
                '<i class="far fa-copy mr-3 copytoclipboard"></i>' +
                '<i class="far fa-trash-alt btnDeleteSingleUser" style="color:red" data-id="' + contactId + '"></i>' +
                '<input type="hidden" id="hdnAddress" value="' + (userAddress == null ? "" : userAddress) + '" /><input type="hidden" id="hdnEmail" value="' + (userEmail == null ? "" : userEmail) + '" /><input type="hidden" id="hdnPhone" value="' + (userPhone == null ? "" : userPhone) + '" /> </div>' +
                '</div>';
        }

    }
    $("#divUserData").html(alluserHTML);

}

function ShowPrevNext(pageNumber, allUserData) {

    $("#btnPreviuos,#btnNext").show();
    $(".pagination-content").show();

    var totalPages = Math.ceil(allUserData.length / PageSize);
    if (totalPages == 1) {
        $("#btnPreviuos,#btnNext").hide();
    }
    else if (pageNumber == 1) {
        $("#btnPreviuos").hide();
        $("#btnNext").show();
    }
    else if (pageNumber == totalPages) {
        $("#btnPreviuos").show();
        $("#btnNext").hide();
    }

    $("#lblCurrentPage").text(pageNumber);
    $("#lblTotalPage").text(totalPages);

    console.log(totalPages);
    if (totalPages == 0) {
        $(".pagination-content").hide();
    }
}


function GenerateCSVData(allLinkedinData) {

    if (allLinkedinData.length > 0) {

        var csvData = "";
        for (var i = 0; i < allLinkedinData.length; i++) {
            var singleUser = allLinkedinData[i];
            var socialLinks = singleUser.socialLinks;

            csvData += singleUser["firstName"] + "," + singleUser["lastName"] + "," + singleUser["phoneNumber"] + "," + singleUser["email"] + "," + singleUser["address"] + "," + socialLinks + "\n";
        }
        $("#btnLinkedinDownloadCSVUp,#btnLinkedinDownloadCSVDown").attr("download", "Linkedin Data.csv");
        $("#btnLinkedinDownloadCSVUp,#btnLinkedinDownloadCSVDown").attr("href", "data:text/csv,First Name,Last Name,Phone Number,Email,Address,Social Links\n" + csvData);
    }
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function IsEmail(email) {
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!regex.test(email)) {
        return false;
    } else {
        return true;
    }
}

function fn_UserLogout() {
    chrome.storage.local.remove("LemonInUser", function () {
        window.location.href = '/Login.html';
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
                            location.href = "/ViewExistingData.html";
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