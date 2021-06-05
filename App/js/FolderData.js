const app_api_endpoint = GetAPIEndpoint();
var LoogedIn_UserId = "";

document.addEventListener("DOMContentLoaded", function () {

    $("#divDesignationDataSelect").hide();
    $("#divSkillDataSelect").hide();
    $("#btnRemoveSelected").hide();
    $("#btnSelectFolderCancel").hide();
    $("#divShareDetails").hide();

    $("#divDeleteMessage").hide();

    $("#btnSelectFolder").click(fn_selectFolder);
    $("#btnSelectFolderCancel").click(fn_selectFolderCancel);
    $("#btnRemoveSelected").click(fn_RemoveSelected);
    $("#btnShareFolder").click(fn_ShareFolders);

    LoadFolderList();

    $("#btnLogout").click(fn_UserLogout);
    $("#btnBackToList").click(function () {
        location.href = "Popup.html?isFirst=false";
    });


    $("#btnRemoveAll").click(function () {

        if (confirm('Are you sure you want to remove all?')) {

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
                            $("#divDesignationData").html('<p class="text-danger ml-3">No Data Found.</p>');
                            $("#divSkillData").html('<p class="text-danger ml-3">No Data Found.</p>');
                            $("#btnRemoveAll").hide();
                            $("#btnSelectFolder").hide();
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

function LoadFolderList() {

    chrome.storage.local.get('LemonInUser', function (result) {

        if (result != undefined && result.LemonInUser != undefined) {

            if (result.LemonInUser.Name != "" && result.LemonInUser.Name != undefined) {
                $("#lblUserName").text("Hello, " + result.LemonInUser.Name);
            }

            if (result.LemonInUser.Id != "" && result.LemonInUser.Id != undefined) {

                LoogedIn_UserId = result.LemonInUser.Id;

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
                                        var allfolderSelectHTML = "";
                                        for (var i = 0; i < Designation.length; i++) {
                                            var html = '<div class="folder"><a href="ViewExistingData.html?folderType=designation&folderValue=' + Designation[i] + '">' + Designation[i] + '</a></div>';
                                            allfolderHTML += html;

                                            var selecthtml = '<label class="btn btn-default"><input type="checkbox" name="options" class="desi-skill-chk chkDesignation" data-name="' + Designation[i] + '"><div>' + Designation[i] + '</div></label>';
                                            allfolderSelectHTML += selecthtml;
                                        }
                                        $("#divDesignationData").html(allfolderHTML);
                                        $("#divDesignationDataSelect").html(allfolderSelectHTML);
                                        $("#btnRemoveAll,#btnSelectFolder").show();
                                    }
                                    else {
                                        $("#divDesignationData").html('<p class="text-danger ml-3">No Data Found.</p>');
                                        $("#btnRemoveAll,#btnSelectFolder").hide();
                                    }

                                }
                                if (FolderData.skill != undefined) {

                                    var Skill = FolderData.skill;

                                    if (Skill.length > 0) {
                                        var allfolderHTML = "";
                                        var allfolderSelectHTML = "";
                                        for (var i = 0; i < Skill.length; i++) {
                                            var html = '<div class="folder"><a href="ViewExistingData.html?folderType=skill&folderValue=' + Skill[i].skillId + '&skillName=' + Skill[i].skillName + '">' + Skill[i].skillName + '</a></div>';
                                            allfolderHTML += html;

                                            var selecthtml = '<label class="btn btn-default"><input type="checkbox" name="options" class="desi-skill-chk chkSkills" data-id="' + Skill[i].skillId + '"><div>' + Skill[i].skillName + '</div></label>';
                                            allfolderSelectHTML += selecthtml;
                                        }
                                        $("#divSkillData").html(allfolderHTML);
                                        $("#divSkillDataSelect").html(allfolderSelectHTML);
                                        $("#btnRemoveAll,#btnSelectFolder").show();
                                    }
                                    else {
                                        $("#divSkillData").html('<p class="text-danger ml-3">No Data Found.</p>');
                                        $("#btnRemoveAll,#btnSelectFolder").hide();
                                    }
                                }

                            }
                            else {
                                $("#divDesignationData").html('<p class="text-danger ml-3">No Data Found.</p>');
                                $("#divSkillData").html('<p class="text-danger ml-3">No Data Found.</p>');
                                $("#btnRemoveAll,#btnSelectFolder").hide();
                            }
                        }
                        else {
                            $("#divDesignationData").html('<p class="text-danger ml-3">No Data Found.</p>');
                            $("#divSkillData").html('<p class="text-danger ml-3">No Data Found.</p>');
                            $("#btnRemoveAll,#btnSelectFolder").hide();
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

}

function fn_UserLogout() {
    chrome.storage.local.remove("LemonInUser", function () {
        window.location.href = '/Login.html';
    });
}

function fn_selectFolder() {
    $("#divDesignationDataSelect").show();
    $("#divSkillDataSelect").show();

    $("#divDesignationData").hide();
    $("#divSkillData").hide();

    $("#btnRemoveAll").hide();
    $("#btnRemoveSelected").show();
    $("#btnSelectFolderCancel").show();
    $("#btnSelectFolder").attr("disabled", true);

    $("#divShareDetails").show();
}

function fn_selectFolderCancel() {
    $("#divDesignationDataSelect").hide();
    $("#divSkillDataSelect").hide();

    $("#divDesignationData").show();
    $("#divSkillData").show();

    $("#btnRemoveAll").show();
    $("#btnRemoveSelected").hide();
    $("#btnSelectFolderCancel").hide();
    $("#btnSelectFolder").html("Select");

    $(".chkSkills").each(function (index) {
        $(this).prop("checked", false);
        $(this).parent().removeClass("active");
    });

    $(".chkDesignation").each(function (index) {
        $(this).prop("checked", false);
        $(this).parent().removeClass("active");
    });
    $("#btnSelectFolder").attr("disabled", false);
    $("#divShareDetails").hide();
}

$(document).on("change", ".chkSkills", function () {

    var count = 0;
    $(".chkSkills").each(function (index) {
        if ($(this).prop("checked"))
            count++;
    });

    $(".chkDesignation").each(function (index) {
        if ($(this).prop("checked"))
            count++;
    });
    $("#btnSelectFolder").html(count + " Selected");
});

function fn_RemoveSelected() {

    if (confirm('Are you sure you want to remove all?')) {

        $("#divDeleteMessage").hide();
        $("#lblMessageDetele").removeClass("text-danger");
        if (ValidateCheckedFolder()) {

            var Designationlist = [];
            var Skillslist = [];

            $(".chkSkills").each(function (index) {
                if ($(this).prop("checked"))
                    Skillslist.push(parseInt($(this).attr("data-id")));
            });

            $(".chkDesignation").each(function (index) {
                if ($(this).prop("checked"))
                    Designationlist.push($(this).attr("data-name"));
            });

            if (Designationlist.length > 0 || Skillslist.length > 0) {

                var LeadData = {
                    "UserId": LoogedIn_UserId,
                    "Designations": Designationlist,
                    "Skills": Skillslist
                }

                $.ajax({
                    type: "POST",
                    url: app_api_endpoint + "Folder/DeleteFolders",
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
                                LoadFolderList();

                                $("#divDesignationDataSelect").hide();
                                $("#divSkillDataSelect").hide();

                                $("#divDesignationData").show();
                                $("#divSkillData").show();

                                $("#btnRemoveAll").show();
                                $("#btnRemoveSelected").hide();
                                $("#btnSelectFolderCancel").hide();
                                $("#btnSelectFolder").html("Select");
                                $("#divShareDetails").hide();
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
        else {
            $("#divDeleteMessage").show();
            $("#lblMessageDetele").text("Please select folder");
            $("#lblMessageDetele").addClass("text-danger");
        }
    }
}

function ValidateCheckedFolder() {

    var isChecked = false;
    $(".chkSkills").each(function (index) {
        if ($(this).prop("checked"))
            isChecked = true;
    });

    $(".chkDesignation").each(function (index) {
        if ($(this).prop("checked"))
            isChecked = true;
    });

    return isChecked;
}

function fn_ShareFolders() {

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

    if (!ValidateCheckedFolder()) {
        $("#lblShareEmail").text("Please select folder.");
        $("#lblShareEmail").show();
        $("#lblShareEmail").addClass("text-danger");
        isValid = false;
    }

    if (isValid) {

        var Designationlist = [];
        var Skillslist = [];

        $(".chkSkills").each(function (index) {
            if ($(this).prop("checked"))
                Skillslist.push(parseInt($(this).attr("data-id")));
        });

        $(".chkDesignation").each(function (index) {
            if ($(this).prop("checked"))
                Designationlist.push($(this).attr("data-name"));
        });

        $.ajax({
            type: "POST",
            url: app_api_endpoint + "Folder/ShareFolders",
            dataType: "json",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                "UserId": LoogedIn_UserId,
                "Email": Email,
                "Designations": Designationlist,
                "Skills": Skillslist,
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

                            $("#divDesignationDataSelect").hide();
                            $("#divSkillDataSelect").hide();

                            $("#divDesignationData").show();
                            $("#divSkillData").show();

                            $("#btnRemoveAll").show();
                            $("#btnRemoveSelected").hide();
                            $("#btnSelectFolderCancel").hide();
                            $("#btnSelectFolder").html("Select");
                            //$("#divShareDetails").hide();
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

}

function IsEmail(email) {
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!regex.test(email)) {
        return false;
    } else {
        return true;
    }
}