//const app_api_endpoint = "https://localhost:44392/api/";
const app_api_endpoint = "https://lemoin.massmailcampaign.com/api/";

document.addEventListener("DOMContentLoaded", function () {

    chrome.storage.local.get('LemonInUser', function (result) {

        if (result != undefined && result.LemonInUser != undefined) {

            if (result.LemonInUser.Name != "" && result.LemonInUser.Name != undefined) {
                $("#lblUserName").text("Hello, " + result.LemonInUser.Name);
            }

            if (result.LemonInUser.Id != "" && result.LemonInUser.Id != undefined) {

                $.ajax({
                    type: "POST",
                    url: app_api_endpoint + "Folder/GetFolderList",
                    dataType: "json",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify({
                        "UserId": result.LemonInUser.Id
                    }),
                    beforeSend: function () {
                        $('#lemoin-overlay').show();
                    },
                    success: function (data) {
                        if (data != null && data != undefined) {

                            if (data.status) {

                                var FolderData = data.data;

                                if (FolderData.designation != undefined) {

                                    var Designation = FolderData.designation;
                                    if (Designation.length > 0) {
                                        var allfolderHTML = "";
                                        for (var i = 0; i < Designation.length; i++) {
                                            var html = '<div class="col-3 mb-2 folder-main"><div class="folder"><a href="ViewExistingData.html?folderType=designation&folderValue=' + Designation[i] + '">' + Designation[i] + '</a></div></div>';
                                            allfolderHTML += html;
                                        }
                                        $("#divDesignationData").html(allfolderHTML);
                                    }
                                    else {
                                        $("#divDesignationData").html('<p class="text-danger ml-3">No Data Found.</p>');
                                    }

                                }
                                if (FolderData.skill != undefined) {

                                    var Skill = FolderData.skill;

                                    if (Skill.length > 0) {
                                        var allfolderHTML = "";
                                        for (var i = 0; i < Skill.length; i++) {
                                            var html = '<div class="col-3 mb-2 folder-main"><div class="folder"><a href="ViewExistingData.html?folderType=skill&folderValue=' + Skill[i].skillId + '">' + Skill[i].skillName + '</a></div></div>';
                                            allfolderHTML += html;
                                        }
                                        $("#divSkillData").html(allfolderHTML);
                                    }
                                    else {
                                        $("#divSkillData").html('<p class="text-danger ml-3">No Data Found.</p>');
                                    }
                                }

                            }
                            else {
                                $("#divDesignationData").html('<p class="text-danger ml-3">No Data Found.</p>');
                                $("#divSkillData").html('<p class="text-danger ml-3">No Data Found.</p>');
                            }
                        }
                        else {
                            $("#divDesignationData").html('<p class="text-danger ml-3">No Data Found.</p>');
                            $("#divSkillData").html('<p class="text-danger ml-3">No Data Found.</p>');
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

    $("#btnLogout").click(fn_UserLogout);
    $("#btnBackToList").click(function () {
        location.href = "Popup.html?isFirst=false";
    });

});

function fn_UserLogout() {
    chrome.storage.local.remove("LemonInUser", function () {
        window.location.href = '/Login.html';
    });
}