var Current_TabId;
var isFirstTime = true;

document.addEventListener("DOMContentLoaded", function () {

    chrome.storage.local.get('ShowUserDetail', function (result) {

        if (result != undefined && result.ShowUserDetail != undefined) {

            if (result.ShowUserDetail.Show == true) {
                location.href = "/UserDetails.html?isremove=1&userid=" + result.ShowUserDetail.UserId;
            }
        }

    });

    chrome.storage.local.get('LemonInUser', function (result) {

        if (result != undefined && result.LemonInUser != undefined) {

            if (result.LemonInUser.Name != "" && result.LemonInUser.Name != undefined) {
                $("#lblUserName").text("Hello, " + result.LemonInUser.Name);
            }
        }

    });

    //$("#btnScrapeEmails").click(ScrapeEmailsFromPage);
    $("#btnLogout").click(fn_UserLogout);
    $("#btnViewExistingData").click(function () {
        location.href = "/ViewExistingData.html";
    });

    $("#btnFoldersData").click(function () {
        location.href = "/FolderData.html";
    });

    $("#btnSharedWithYou").click(function () {
        location.href = "/Sharedwithyou.html";
    });

    $("#lblMessage").hide();
    if ($("#btnDownloadCSV").length > 0) {

        chrome.storage.local.get('ScrapedEmails', function (result) {

            if (result != undefined && result.ScrapedEmails != undefined) {

                var allEmails = result.ScrapedEmails;
                var csvData = allEmails.join("\n");

                $("#btnDownloadCSV").attr("download", "Scrape Email.csv");
                $("#btnDownloadCSV").attr("href", "data:text/csv,Scrape Email\n" + csvData);

                var emailHTMl = "";
                for (var i = 0; i < allEmails.length; i++) {
                    emailHTMl += '<p>' + allEmails[i] + '</p>';
                }
                $("#divEmailList").html(emailHTMl);
            }
            else {
                $("#divEmailList").html('<label class="text-danger">No Emails Found</label>');
            }
        });
    }

    if ($("#btnLinkedinDownloadCSV").length > 0) {

        chrome.storage.local.get('LinkedinData', function (result) {

            console.log(result.LinkedinData);
            if (result != undefined && result.LinkedinData != undefined) {

                var allLinkedinData = result.LinkedinData;

                var csvData = "";
                for (var i = 0; i < allLinkedinData.length; i++) {
                    var singleUser = allLinkedinData[i];
                    var socialLinks = "";
                    if (singleUser["SocialLinks"] != undefined && singleUser["SocialLinks"].length > 0) {
                        socialLinks = singleUser["SocialLinks"].join(",");
                    }
                    csvData += singleUser["FirstName"] + "," + singleUser["LastName"] + "," + singleUser["UserPhone"] + "," + singleUser["UserEmail"] + "," + singleUser["Address"] + "," + socialLinks + "\n";
                }

                $("#btnLinkedinDownloadCSV").attr("download", "Linkedin Data.csv");
                $("#btnLinkedinDownloadCSV").attr("href", "data:text/csv,First Name,Last Name,Phone Number,Email,Address,Social Links\n" + csvData);
            }

        });
    }

    var firstTime = getUrlVars()["isFirst"];
    if (firstTime != undefined && firstTime != null && firstTime != "" && firstTime == "false") {
        isFirstTime = false;
    }

    chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
        function (tabs) {
            Current_TabId = tabs[0].id;
            if (isFirstTime) {
                $('#lemoin-overlay').show();
                chrome.tabs.sendMessage(Current_TabId, { Website: "ScrapeData" }, function (data) {
                    $('#lemoin-overlay').hide();
                    console.log(data);
                    if (data != undefined && data.Success != undefined && data.Success == true) {
                        location.href = "/UserDetails.html?isremove=1&userid=" + data.UserData;
                    }
                });
                isFirstTime = false;
            }
        });
});


function ScrapeEmailsFromPage() {

    chrome.tabs.sendMessage(Current_TabId, { Website: "ScrapeEmails" }, function (data) {

        setTimeout(function () {

            chrome.storage.local.get('ScrapedEmails', function (result) {

                if (result != undefined && result.ScrapedEmails != undefined) {

                    var allEmails = result.ScrapedEmails;
                    var csvData = allEmails.join("\n");

                    $("#btnDownloadCSV").attr("download", "Scrape Email.csv");
                    $("#btnDownloadCSV").attr("href", "data:text/csv,Scrape Email\n" + csvData);
                    $("#lblMessage").show();

                    var emailHTMl = "";
                    for (var i = 0; i < allEmails.length; i++) {
                        emailHTMl += '<p>' + allEmails[i] + '</p>';
                    }
                    $("#divEmailList").html(emailHTMl);
                }
                else {
                    $("#divEmailList").html('<label class="text-danger">No Emails Found</label>');
                }
            });

        }, 1000);

    });

}

function fn_UserLogout() {
    chrome.storage.local.remove("LemonInUser", function () {
        window.location.href = '/Login.html';
    });
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