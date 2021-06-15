const app_api_endpoint = GetAPIEndpoint();

document.addEventListener("DOMContentLoaded", function () {

    $("#lblCopyMessage").hide();
    chrome.storage.local.get('LemonInUser', function (result) {

        if (result != undefined && result.LemonInUser != undefined) {

            if (result.LemonInUser.Name != "" && result.LemonInUser.Name != undefined) {
                $("#lblUserName").text("Hello, " + result.LemonInUser.Name);
            }
        }

    });

    $("#btnLogout").click(fn_UserLogout);
    $("#btnCopytoClipBoard").click(fn_CopyToClipBoard);
    $("#btnBackToList").click(function () {

        var backType = getUrlVars()["back"];
        var folderType = getUrlVars()["folderType"];
        var folderValue = getUrlVars()["folderValue"];
        var skillName = getUrlVars()["skillName"];

        if (folderType != "" && folderType != undefined && folderType != null)
            location.href = "/ViewExistingData.html?folderType=" + folderType + "&folderValue=" + decodeURI(folderValue) + "&skillName=" + skillName;
        else if (backType == undefined || backType == null)
            location.href = "/ViewExistingData.html";
        else
            location.href = "/Sharedwithyou.html";
    });

    $("#btnDeleteUser").click(function () {

        if (confirm('Are you sure you want to delete?')) {

            var ContactId = getUrlVars()["userid"];
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

});

$(document).ready(function () {

    var ContactId = getUrlVars()["userid"];
    var removeDetails = getUrlVars()["isremove"];

    if (removeDetails != undefined && removeDetails == 1) {
        chrome.storage.local.remove("ShowUserDetail", function () {
            console.log("delete");
        });
    }

    if (ContactId != undefined && ContactId != "") {

        var LeadData = {
            "ContactId": parseInt(ContactId)
        }

        $.ajax({
            type: "POST",
            url: app_api_endpoint + "User/GetLeadById",
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
                        var user = data.data.contact;

                        if (user.profileImageURL == "" || user.profileImageURL == null || user.profileImageURL == undefined)
                            $("#imgUserProfile").attr("src", "img/userDefault.png");
                        else
                            $("#imgUserProfile").attr("src", user.profileImageURL);

                        var fName = user.firstName == null ? "" : user.firstName;
                        var lName = user.lastName == null ? "" : user.lastName;
                        $("#lblScrapeUserName").text(fName + " " + lName);
                        $("#lblUserDesignation").text((user.designation == null ? "" : user.designation));
                        $("#lblUserCompnay").text((user.company == null ? "" : user.company));
                        if (user.email != undefined && user.email != "" && user.email != null && user.email.trim() != "") {
                            $("#lblUserEmail").html('<a href="mailto:' + user.email + '">' + user.email + '</a>');
                        }
                        else
                            $("#lblUserEmail").text("");

                        if (user.phoneNumber != undefined && user.phoneNumber != "" && user.phoneNumber != null && user.phoneNumber.trim() != "") {
                            $("#lblUserNumber").html('<a href="callto:' + user.phoneNumber + '">' + user.phoneNumber + '</a>');
                        }
                        else
                            $("#lblUserNumber").text("");

                        $("#lblUserAddress").text((user.address == null ? "" : user.address));
                        //$("#lblExperience").text((user.totalExperince == null ? "" : user.totalExperince));

                        if (data.data.skill != null && data.data.skill != undefined && data.data.skill.length > 0) {

                            var userSkill = data.data.skill;
                            var skillHTML = "";
                            for (var i = 0; i < userSkill.length; i++) {
                                skillHTML += '<span class="badge badge-pill custom-badge badge-primary p-2 pl-3 pr-3 mb-2 mr-2 badge-font-size">' + userSkill[i] + '</span>'
                            }
                            $("#divSkilss").html(skillHTML);
                        }

                        if (data.data.experince != null && data.data.experince != undefined && data.data.experince.length > 0) {

                            var userExperince = data.data.experince;
                            var experinceHTML = "";
                            for (var i = 0; i < userExperince.length; i++) {
                                experinceHTML += '<div class="row"><div class="col-7"><p class="mb-0 details-info">' + userExperince[i].companyName + '</p></div><div class="col-5"><p class="mb-0 details-info"> - ' + userExperince[i].experience + '</p></div></div>';
                            }
                            $("#divExperince").html(experinceHTML);
                        }

                    }
                    else {
                        $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
                    }
                }
                else {
                    $("#divUserData").html('<p class="text-danger">No Data Found.</p>');
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

function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

function RemoveObjectFromArray(UserData, id) {
    return UserData.filter(function (data) {
        if (data.UserId == id) {
            return false;
        }
        return true;
    });
}

function fn_UserLogout() {
    chrome.storage.local.remove("LemonInUser", function () {
        window.location.href = '/Login.html';
    });
}

function fn_CopyToClipBoard() {
    var address = $("#lblUserAddress").text();
    var email = $("#lblUserEmail").text();
    var phone = $("#lblUserNumber").text();

    var value = "Address : " + address + ", Email : " + email + ", Phone : " + phone;
    fncopyToClipboard(value);
}

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