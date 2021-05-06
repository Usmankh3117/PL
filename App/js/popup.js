var Current_TabId;

document.addEventListener("DOMContentLoaded", function () {

    $("#btnScrapeEmails").click(ScrapeEmailsFromPage);
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

    chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
        function (tabs) {
            Current_TabId = tabs[0].id;
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
