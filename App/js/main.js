chrome.runtime.onMessage.addListener(function (message, sender, CallbackResponse) {

    if (message != null) {
        if (message.Website == "ScrapeEmails") {

            if ($("body").length > 0) {
                var allEmails = $("body").html().match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);

                chrome.storage.local.get('ScrapedEmails', function (result) {

                    if (result != undefined && result.ScrapedEmails != undefined) {
                        var previousEmails = result.ScrapedEmails;

                        if (allEmails != null && allEmails.length > 0) {

                            var newEmailList = allEmails.concat(previousEmails);

                            var uniqueEmailList = newEmailList.filter(function (itm, i, a) {
                                return i == a.indexOf(itm);
                            });
                            chrome.storage.local.set({ 'ScrapedEmails': uniqueEmailList });
                        }
                    }
                    else {
                        if (allEmails != null && allEmails.length > 0) {
                            var uniqueEmailList = allEmails.filter(function (itm, i, a) {
                                return i == a.indexOf(itm);
                            });
                            chrome.storage.local.set({ 'ScrapedEmails': uniqueEmailList });
                        }
                    }
                });

            }
            CallbackResponse(true);
        }
    }
});