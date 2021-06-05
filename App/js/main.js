const app_api_endpoint = GetAPIEndpoint();
var UserId = "";
var isProcessing = false;
var previousURL = "";

chrome.storage.local.get('LemonInUser', function (loginResult) {
    if (loginResult != undefined && loginResult.LemonInUser != undefined && loginResult.LemonInUser.Id != undefined && loginResult.LemonInUser.Id != null) {
        UserId = loginResult.LemonInUser.Id;
    }
});

//(function (window, jQuery) {

//    chrome.storage.local.get('LemonInUser', function (loginResult) {

//        if (loginResult != undefined && loginResult.LemonInUser != undefined && loginResult.LemonInUser.Id != undefined && loginResult.LemonInUser.Id != null) {

//            UserId = loginResult.LemonInUser.Id;

//            setInterval(function () {

//                if (!isProcessing && (previousURL == "" || (previousURL != "" && location.href.indexOf(previousURL) == -1))) {

//                    previousURL = window.location.href;

//                    $.ajax({
//                        type: "POST",
//                        url: app_api_endpoint + "User/CheckUserExists",
//                        dataType: "json",
//                        headers: {
//                            "Content-Type": "application/json"
//                        },
//                        data: JSON.stringify({
//                            "UserId": UserId,
//                            "ProfileURL": location.href
//                        }),
//                        success: function (data) {
//                            if (data != null && data != undefined) {

//                                if (data.status) {
//                                    var isExists = data.data;
//                                    if (isExists) {

//                                        previousURL = window.location.href;
//                                        var href = window.location.href;
//                                        if (href.indexOf('https://www.linkedin.com/in') > -1 || href.indexOf('https://www.linkedin.com/sales/people') > -1) {

//                                            if ($(".main-injected-div").length == 0) {
//                                                var elem = document.createElement('div');
//                                                elem.innerHTML = '<div class="main-injected-div"><button disabled="disabled" type="button" id="btnScrapeData" class="btn_scrape_data btn_scraped_data">Captured</button></div>';
//                                                elem.setAttribute("id", "divScrapeData");
//                                                document.body.appendChild(elem);
//                                            }
//                                            else {
//                                                $("#btnScrapeData").html("Captured");
//                                                $("#btnScrapeData").attr("disabled", true);
//                                                $("#btnScrapeData").addClass("btn_scraped_data");
//                                            }
//                                        }
//                                        else {
//                                            if ($("#divScrapeData").length > 0) {
//                                                $("#divScrapeData").remove();
//                                            }
//                                        }

//                                    }
//                                    else {
//                                        InjectScrapeButton();
//                                    }
//                                }
//                                else {
//                                    InjectScrapeButton();
//                                }
//                            }
//                            else {
//                                InjectScrapeButton();
//                            }
//                        },
//                        error: function (data) {
//                        }
//                    });
//                }

//                //chrome.storage.local.get('LinkedinData', function (result) {

//                //    if (result != undefined && result.LinkedinData != undefined) {

//                //        var previousData = result.LinkedinData;
//                //        if (previousData != null && previousData.length > 0) {

//                //            var isExists = false;
//                //            for (var i = 0; i < previousData.length; i++) {
//                //                var obj = previousData[i];
//                //                var url = obj["ProfileURL"];

//                //                if (location.href.indexOf(url) != -1) {
//                //                    isExists = true;
//                //                    break;
//                //                }
//                //            }
//                //            if (isExists) {

//                //                var href = window.location.href;
//                //                if (href.indexOf('https://www.linkedin.com/in') > -1 || href.indexOf('https://www.linkedin.com/sales/people') > -1) {

//                //                    if ($(".main-injected-div").length == 0) {
//                //                        var elem = document.createElement('div');
//                //                        elem.innerHTML = '<div class="main-injected-div"><button disabled="disabled" type="button" id="btnScrapeData" class="btn_scrape_data btn_scraped_data">Captured</button></div>';
//                //                        elem.setAttribute("id", "divScrapeData");
//                //                        document.body.appendChild(elem);
//                //                    }
//                //                    else {
//                //                        $("#btnScrapeData").html("Captured");
//                //                        $("#btnScrapeData").attr("disabled", true);
//                //                        $("#btnScrapeData").addClass("btn_scraped_data");
//                //                    }
//                //                }
//                //                else {
//                //                    if ($("#divScrapeData").length > 0) {
//                //                        $("#divScrapeData").remove();
//                //                    }
//                //                }

//                //            }
//                //            else {
//                //                InjectScrapeButton();
//                //            }
//                //        }
//                //        else
//                //            InjectScrapeButton();
//                //    }
//                //    else
//                //        InjectScrapeButton();
//                //});

//            }, 4000);

//        }

//    });

//})(window, $)

//function InjectScrapeButton() {

//    var current_location = "";

//    var href = window.location.href;
//    if (href.indexOf(current_location) < 0 || current_location == '') {

//        current_location = href;
//        if (href.indexOf('https://www.linkedin.com/in') > -1 || href.indexOf('https://www.linkedin.com/sales/people') > -1) {

//            if ($(".main-injected-div").length == 0) {
//                var elem = document.createElement('div');
//                elem.innerHTML = '<div class="main-injected-div"><button type="button" id="btnScrapeData" class="btn_scrape_data">Capture</button></div>';
//                elem.setAttribute("id", "divScrapeData");
//                document.body.appendChild(elem);
//            }
//            else {
//                $("#btnScrapeData").html("Capture");
//                $("#btnScrapeData").removeAttr("disabled");
//                $("#btnScrapeData").removeClass("btn_scraped_data");
//            }
//        }
//        else {
//            if ($("#divScrapeData").length > 0) {
//                $("#divScrapeData").remove();
//            }
//        }
//    }
//}

//$(document).on('click', '#btnScrapeData', function () {
//    ScrapeData();
//});

function ScrapeData(callback) {
    $("html, body").animate({ scrollTop: document.body.scrollHeight }, 3000);
    //$("#btnScrapeData").html("Running");
    //$("#btnScrapeData").attr("disabled", true);
    isProcessing = true;

    setTimeout(function () {

        var FirstName = "", LastName = "", ProfileURL = "", UserEmail = "", UserPhone = "", Address = "", Company = "", Designation = "", ImageURL = "", TotalExperince = "";
        var SocialLinks = [];
        var UserSkills = [];

        var LinkedinScrapedData = [];
        var CapturedData = {
            "UserId": "",
            "FirstName": "",
            "LastName": "",
            "Company": "",
            "Designation": "",
            "ProfileImageURL": "",
            "UserEmail": "",
            "UserPhone": "",
            "UserProfileURL": "",
            "Address": "",
            "TotalExperince": "",
            "SocialLinks": [],
            "UserSkills": []
        }

        ProfileURL = location.href;
        console.log("started");

        var topvcCard = $(".pv-top-card__list-container");
        if (topvcCard.length > 0) {

            var nameHTML = topvcCard.find('ul > li')[0];
            if ($(nameHTML).length > 0) {
                var UserName = $(nameHTML).text().trim();
                if (UserName.split(" ").length > 1) {
                    FirstName = UserName.split(" ")[0];
                    LastName = UserName.split(" ")[1];
                }
            }
            console.log("FirstName " + FirstName);
            console.log("LastName " + LastName);

            var addressHTML = topvcCard.find('ul.pv-top-card--list-bullet > li')[0];
            if ($(addressHTML).length > 0) {
                Address = $(addressHTML).text().trim();
                if (Address.length > 0)
                    Address = Address.replace(/,/g, "");
            }
            console.log("Address " + Address);
        }
        else {

            var nameHTML = $("h1.text-heading-xlarge");
            if (nameHTML.length > 0) {
                var UserName = $(nameHTML).text().trim();
                if (UserName.split(" ").length > 1) {
                    FirstName = UserName.split(" ")[0];
                    LastName = UserName.split(" ")[1];
                }
                console.log("FirstName " + FirstName);
                console.log("LastName " + LastName);
            }

            if ($(".pb2").length > 0) {
                var addressHTML = $(".pb2").find(".text-body-small");
                if (addressHTML.length > 0) {
                    Address = $(addressHTML).text().trim();
                    if (Address.length > 0)
                        Address = Address.replace(/,/g, "");
                }
                console.log("Address " + Address);
            }
        }

        var photoVCard = $(".pv-top-card--photo");
        if (photoVCard.length > 0) {

            var imageHTML = photoVCard.find("img");
            if (imageHTML.length > 0) {

                var imageURLtemp = imageHTML.attr("src");
                if (imageURLtemp.indexOf("https") != -1)
                    ImageURL = imageURLtemp;
            }
            console.log("ImageURL " + ImageURL);
        }
        else if ($(".pv-top-card--photo__v2").length > 0) {

            var imageHTML = $(".pv-top-card--photo__v2").find("img");
            if (imageHTML.length > 0) {

                var imageURLtemp = imageHTML.attr("src");
                if (imageURLtemp.indexOf("https") != -1)
                    ImageURL = imageURLtemp;
            }
            console.log("ImageURL " + ImageURL);
        }

        var cardProfiles = $(".pv-profile-section__card-header");
        if (cardProfiles.length > 0) {
            $(cardProfiles).each(function () {

                var cardHeaders = $(this).find("h2");
                var header = $(cardHeaders).text().trim();

                if (header == "Experience") {

                    var experienceSection = $(this).next();
                    if (experienceSection.length > 0) {

                        var compaines = experienceSection.find("li.pv-profile-section__list-item");
                        $(compaines).each(function () {

                            var companyLink = $(this).find('a');
                            if ($(this).find('ul').length > 0) {
                                var company = $(this).find('a').find('h3').find('span');
                                if (company.length > 0) {
                                    var companyName = $(company[1]).text().trim();
                                    Company = companyName;
                                }

                                var companyRoles = $(this).find('ul').find('li');
                                $(companyRoles).each(function () {

                                    var currentRole = $(this);
                                    if (currentRole.find('h3').length > 0) {
                                        var headContent = currentRole.find('h3').find('span');
                                        if (headContent.length > 0) {
                                            var roleName = $(headContent[1]).text();
                                            Designation = roleName;
                                        }
                                    }
                                    return false;
                                });
                            }
                            else {
                                var company = $(this).find('a').find('h3');
                                if (company.length > 0) {

                                    Designation = $(company).text().trim();
                                    var companyTitle = $(company).nextAll("p.pv-entity__secondary-title");
                                    if (companyTitle.length > 0) {

                                        if (companyTitle.find('span').length > 0) {
                                            var companyName = companyTitle.text().substring(0, companyTitle.text().indexOf(companyTitle.find('span').text()));
                                            Company = companyName.trim();
                                        }
                                        else {
                                            var companyName = companyTitle.text().trim();
                                            Company = companyName;
                                        }
                                    }
                                }
                            }

                            return false;
                        });
                    }

                    console.log("companyName " + Company);
                    console.log("Designation " + Designation);
                }

                if (header == "Experience") {

                    var experienceSection = $(this).next();
                    if (experienceSection.length > 0) {

                        fnSeemoreCompanylist(function () {
                            console.log("Experience");
                            var totalMonth = 0, TotalYear = 0;
                            var compaines = experienceSection.find("li.pv-profile-section__list-item");
                            $(compaines).each(function () {

                                if ($(this).find('ul').length > 0) {

                                    var durationHTMl = $(this).find('h4.t-14.t-black.t-normal');
                                    if (durationHTMl.length > 0) {

                                        var durataiontextHTML = $(durationHTMl).find('span');
                                        if (durataiontextHTML.length > 0) {
                                            var duration = $(durataiontextHTML[1]).text().trim();

                                            if ((duration.indexOf("mos") > 0 && duration.indexOf("yrs") > 0) || (duration.indexOf("mo") > 0 && duration.indexOf("yr") > 0) || (duration.indexOf("mos") > 0 && duration.indexOf("yr") > 0)
                                                || (duration.indexOf("mo") > 0 && duration.indexOf("yrs") > 0)) {

                                                var monthyear = duration.split(" ");
                                                if (monthyear.length > 0) {

                                                    if (monthyear[0] != undefined) {
                                                        if (parseInt(monthyear[0]) != NaN) {
                                                            var year = parseInt(monthyear[0]);
                                                            TotalYear += parseInt(year);
                                                        }
                                                    }
                                                    if (monthyear[2] != undefined) {
                                                        if (parseInt(monthyear[2]) != NaN) {
                                                            var month = parseInt(monthyear[2]);
                                                            totalMonth += parseInt(month);
                                                        }
                                                    }

                                                }
                                            }
                                            else if (duration.indexOf("mos") > 0 || duration.indexOf("mo") > 0) {

                                                var month = duration.replace("mos", "").trim();
                                                totalMonth += parseInt(month);

                                            }
                                            else if (duration.indexOf("yrs") > 0 || duration.indexOf("yr") > 0) {

                                                var year = duration.replace("yrs", "").trim();
                                                TotalYear += parseInt(year);

                                            }

                                        }
                                    }

                                }
                                else {
                                    if ($(this).length > 0) {

                                        var durationHTMl = $(this).find('h4.t-14.t-black--light');
                                        if (durationHTMl.length > 0) {

                                            var durataiontextHTML = $(durationHTMl).find('span.pv-entity__bullet-item-v2');
                                            if (durataiontextHTML.length > 0) {

                                                var duration = durataiontextHTML.text().trim();

                                                if ((duration.indexOf("mos") > 0 && duration.indexOf("yrs") > 0) || (duration.indexOf("mo") > 0 && duration.indexOf("yr") > 0) || (duration.indexOf("mos") > 0 && duration.indexOf("yr") > 0)
                                                    || (duration.indexOf("mo") > 0 && duration.indexOf("yrs") > 0)) {

                                                    var monthyear = duration.split(" ");
                                                    if (monthyear.length > 0) {

                                                        if (monthyear[0] != undefined) {
                                                            if (parseInt(monthyear[0]) != NaN) {
                                                                var year = parseInt(monthyear[0]);
                                                                TotalYear += parseInt(year);
                                                            }
                                                        }
                                                        if (monthyear[2] != undefined) {
                                                            if (parseInt(monthyear[2]) != NaN) {
                                                                var month = parseInt(monthyear[2]);
                                                                totalMonth += parseInt(month);
                                                            }
                                                        }

                                                    }
                                                }
                                                else if (duration.indexOf("mos") > 0 || duration.indexOf("mo") > 0) {

                                                    var month = duration.replace("mos", "").trim();
                                                    totalMonth += parseInt(month);

                                                }
                                                else if (duration.indexOf("yrs") > 0 || duration.indexOf("yr") > 0) {

                                                    var year = duration.replace("yrs", "").trim();
                                                    TotalYear += parseInt(year);

                                                }
                                            }
                                        }
                                    }
                                }
                            });

                            if (totalMonth > 0 && TotalYear > 0) {

                                if (totalMonth < 12) {
                                    TotalExperince = TotalYear + " yrs " + totalMonth + " mos";
                                }
                                else if (totalMonth == 12) {
                                    TotalExperince = (TotalYear + 1) + " yrs";
                                }
                                else if (totalMonth > 12) {

                                    var tempYear = Math.floor(totalMonth / 12);
                                    var tempMonth = totalMonth % 12;

                                    TotalExperince = (TotalYear + tempYear) + " yrs " + tempMonth + " mos";
                                }

                            }
                            else if (totalMonth > 0) {

                                if (totalMonth < 12) {
                                    TotalExperince = totalMonth + " mos";
                                }
                                else if (totalMonth == 12) {
                                    TotalExperince = "1 yrs";
                                }
                                else if (totalMonth > 12) {

                                    var tempYear = Math.floor(totalMonth / 12);
                                    var tempMonth = totalMonth % 12;

                                    TotalExperince = tempYear + " yrs " + tempMonth + " mos";
                                }

                            }
                            else if (TotalYear > 0) {
                                TotalExperince = TotalYear + " yrs";
                            }

                        });

                    }
                }

            });
        }

        var cardSkillHTML = $(".pv-skill-categories-section");
        if (cardSkillHTML.length > 0) {

            var topSkillHTML = $("ol.pv-skill-categories-section__top-skills");
            if (topSkillHTML.length > 0) {

                $(topSkillHTML.find("li")).each(function () {

                    if ($(this).find(".pv-skill-category-entity__name-text").length > 0) {
                        var skillName = $(this).find(".pv-skill-category-entity__name-text").text().trim();
                        UserSkills.push(skillName);
                    }
                });

                console.log("UserSkills " + UserSkills);
            }
        }

        var contactInfo;
        contactInfo = $('a[href*="/contact-info/"]'); //$('a[data-control-name="contact_see_more"]');
        //if (contactInfo.length == 0)
        //    contactInfo = $("a:contains(Contact info)");

        if (contactInfo.length > 0) {

            setTimeout(function () {
                console.log("contact click");
                if ($(contactInfo[0]).find("span").length > 0) {
                    $(contactInfo[0]).find("span").click();
                }
                else {
                    contactInfo[0].click();
                }
                //chrome.runtime.sendMessage({ type: "ContactInfo", Link: "https://www.linkedin.com/" + $(contactInfo[0]).attr("href") }, function (response) {
                //    debugger;

                //});
            }, 2000);

            fnContactInfoLoaded(function () {

                if ($(".artdeco-modal__content").length > 0) {

                    console.log("contact load");
                    var emailHTMl = $(".artdeco-modal__content").find(".ci-email");
                    if (emailHTMl.length > 0) {

                        if (emailHTMl.find('a').length > 0) {
                            UserEmail = emailHTMl.find('a').text().trim();
                        }
                    }

                    var phoneHTMl = $(".artdeco-modal__content").find(".ci-phone");
                    if (phoneHTMl.length > 0) {

                        if (phoneHTMl.find('ul').length > 0) {
                            if (phoneHTMl.find('ul').find('span').length > 0) {
                                UserPhone = $(phoneHTMl.find('ul').find('span')[0]).text().trim();
                            }
                        }
                    }

                    var twitterHTMl = $(".artdeco-modal__content").find(".ci-twitter");
                    if (twitterHTMl.length > 0) {

                        if (twitterHTMl.find('ul').length > 0) {
                            if (twitterHTMl.find('ul').find('a').length > 0) {
                                var twitterLink = $(twitterHTMl.find('ul').find('a')[0]).attr("href").trim();
                                SocialLinks.push(twitterLink);
                            }
                        }
                    }

                    var iamHTMl = $(".artdeco-modal__content").find(".ci-ims");
                    if (iamHTMl.length > 0) {

                        if (iamHTMl.find('ul').length > 0) {
                            if (iamHTMl.find('ul').find('li').length > 0) {
                                var iamText = $(iamHTMl.find('ul').find('li')[0]).find("span");
                                if (iamText.length > 0) {
                                    SocialLinks.push(iamText.text().replace(/\n/g, " ").replace(/\s\s+/g, ' ').trim());
                                }
                            }
                        }
                    }

                    if ($('button[aria-label="Dismiss"]').length > 0)
                        $('button[aria-label="Dismiss"]').click();

                    CapturedData.UserId = UserId;
                    CapturedData.FirstName = FirstName;
                    CapturedData.LastName = LastName;
                    CapturedData.Company = Company;
                    CapturedData.Designation = Designation;
                    CapturedData.ProfileImageURL = ImageURL;
                    CapturedData.UserEmail = UserEmail;
                    CapturedData.UserPhone = UserPhone;
                    CapturedData.UserProfileURL = ProfileURL;
                    CapturedData.Address = Address;
                    CapturedData.TotalExperince = TotalExperince;
                    CapturedData.SocialLinks = SocialLinks;
                    CapturedData.UserSkills = UserSkills;

                    LinkedinScrapedData.push(CapturedData);
                    console.log(CapturedData);

                    //setTimeout(function () {

                    $.ajax({
                        type: "POST",
                        url: app_api_endpoint + "User/Create",
                        dataType: "json",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify(CapturedData),
                        success: function (data) {
                            if (data != null && data != undefined) {

                                if (data.status) {
                                    var userDetails = { "Show": true, "UserId": data.id }
                                    chrome.storage.local.set({ 'ShowUserDetail': userDetails });
                                    callback({ "UserId": data.id });
                                }
                                isProcessing = false;
                                //$("#btnScrapeData").html("Captured");
                                //$("#btnScrapeData").addClass("btn_scraped_data");
                                //$("#btnScrapeData").attr("disabled", true);
                            }
                        },
                        error: function (data) {
                        }
                    });

                    //}, 2000);

                }

            });
        }

        $("html, body").animate({ scrollTop: 0 }, 1000);

    }, 3000);
}

function fnSeemoreCompanylist(callbackSeeMore) {

    if ($(".pv-experience-section__see-more").length > 0) {

        var seemoreButton = $(".pv-experience-section__see-more").find("button.pv-profile-section__see-more-inline");
        if (seemoreButton.length > 0) {
            if ($(seemoreButton[0]).attr("class").indexOf("pv-profile-section__see-less-inline") == -1) {
                $(seemoreButton[0]).click();
                setTimeout(function () {
                    fnSeemoreCompanylist(callbackSeeMore);
                }, 500);
            }
            else
                callbackSeeMore();
        }
        else
            callbackSeeMore();
    }
    else
        callbackSeeMore();

}

function fnContactInfoLoaded(callbackContact) {

    if ($(".artdeco-modal__content").length > 0) {
        callbackContact();
    }
    else {
        setTimeout(function () {
            fnContactInfoLoaded(callbackContact);
        }, 500);
    }

}

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
        else if (message.Website == "ScrapeData") {

            var href = location.href;
            if (href.indexOf('https://www.linkedin.com/in') > -1 || href.indexOf('https://www.linkedin.com/sales/people') > -1) {

                if (UserId != "" && UserId != undefined) {
                    $.ajax({
                        type: "POST",
                        url: app_api_endpoint + "User/CheckUserExists",
                        dataType: "json",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify({
                            "UserId": UserId,
                            "ProfileURL": location.href
                        }),
                        success: function (data) {
                            if (data != null && data != undefined) {
                                if (data.status) {
                                    var isExists = data.data;
                                    if (!isExists) {
                                        ScrapeData(function (data) {
                                            CallbackResponse({ "Success": true, "UserData": data.UserId });
                                        });
                                    }
                                    else
                                        CallbackResponse({ "Success": false, "UserData": 0 });
                                }
                                else
                                    CallbackResponse({ "Success": false, "UserData": 0 });
                            }
                            else
                                CallbackResponse({ "Success": false, "UserData": 0 });
                        },
                        error: function (data) {
                        }
                    });
                }
            }
            return true;
        }
    }
});