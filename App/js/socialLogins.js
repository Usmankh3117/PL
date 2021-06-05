function logInWithFB() {
    var clientId = '';
    var clientSecret = '';
    var redirectUri = chrome.identity.getRedirectURL("extenson-name");

    var url = 'https://www.facebook.com/dialog/oauth?client_id=' + clientId +
        '&reponse_type=token&access_type=online&display=popup' +
        '&scope=email' +
        '&redirect_uri=' + redirectUri;

    var deferred = $.Deferred();

    chrome.identity.launchWebAuthFlow(
        {
            'url': url,
            'interactive': true
        },
        function (redirectedTo) {
            if (chrome.runtime.lastError) {
                // Example: Authorization page could not be loaded.
                deferred.reject(chrome.runtime.lastError.message);
            } else {
                // var response = urlParamsToMap(redirectedTo.replace(chrome.identity.getRedirectURL("extension-name") + "?", ""));
                var code = redirectedTo.split("?code=")[1];
                // var code = response.get('code');

                $.ajax({
                    url: 'https://graph.facebook.com/oauth/access_token?' +
                    'client_id=' + clientId +
                    '&client_secret=' + clientSecret +
                    '&redirect_uri=' + redirectUri +
                    '&code=' + code,
                    type: "GET",
                    crossDomain: true
                }).then(function (data) {
                    let getURL = `https://graph.facebook.com/me?access_token=${data.access_token}`;
                    fetch(getURL).then(response => response.json()).then(response => {
                        const userInfo = { name: response.name, password: `${response.id}@facebook.com` };
                        getURL = `https://graph.facebook.com/${response.id}?fields=email&access_token=${data.access_token}`;
                        fetch(getURL).then(response => response.json()).then(response => {
                            userInfo.email = response.email;
                            deferred.resolve(userInfo);
                        }).catch(err => {
                            deferred.reject(err);
                        });
                    }).catch(err => {
                        deferred.reject(err);
                    });
                });
            }
        }
    );

    return deferred.promise();
}




function logInWithGoogle() {
    return new Promise((resolve, reject) => {
        const CLIENT_ID = encodeURIComponent('');
        const RESPONSE_TYPE = encodeURIComponent('id_token');
        const REDIRECT_URI = encodeURIComponent(chrome.identity.getRedirectURL("extenson-name"))
        const SCOPE = encodeURIComponent('openid email');
        const STATE = encodeURIComponent('meet' + Math.random().toString(36).substring(2, 15));
        const PROMPT = encodeURIComponent('consent');
    
        function create_auth_endpoint() {
            let nonce = encodeURIComponent(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    
            let openId_endpoint_url =
            `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}&nonce=${nonce}&prompt=${PROMPT}`;
            console.log(openId_endpoint_url);
            return openId_endpoint_url;
        }
    
        chrome.identity.launchWebAuthFlow({
            'url': create_auth_endpoint(),
            'interactive': true
        }, function (redirect_url) {
            if (chrome.runtime.lastError) {
                reject("Some Problem Occured");
            } else {
                let id_token = redirect_url.substring(redirect_url.indexOf('id_token=') + 9);
                id_token = id_token.substring(0, id_token.indexOf('&'));

                function parseJwt (token) {
                    var base64Url = token.split('.')[1];
                    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                
                    return JSON.parse(jsonPayload);
                };

                const user_info = parseJwt(id_token);

                if ((user_info.iss === 'https://accounts.google.com' || user_info.iss === 'accounts.google.com') && user_info.aud === CLIENT_ID) {
                    resolve({ email: user_info.email });
                } else {
                    reject("Invalid credentials.");
                }
            }
        });
    });
}

function logInWithTwitter() {
    return new Promise((resolve, reject) => {
        var API_URL = 'https://api.twitter.com/';
        var consumer_key = '0wUjT9NakPtWQhWzvA4BfTark';
        var consumer_secret = 'YxQg2ZXjm0ff4jyOnxaYFUi39HBrP05vYgaa4F3Q2g9ycNGjLi';
        var Twitter = {
            oauth_token: null,
            oauth_token_secret: '',
            authenticate: function() {
                Twitter.oauth_token_secret = '';
                Twitter.oauth_token = null;

                this.api('oauth/request_token', 'POST', $.proxy(function(response) {
                    var des = this.deparam(response);
                    
                    chrome.identity.launchWebAuthFlow({
                        'url': 'https://api.twitter.com/oauth/authenticate?oauth_token=' + des.oauth_token,
                        'interactive': true
                    }, function (redirect_url) {
                        console.log({redirect_url});
                        if (chrome.runtime.lastError) {
                            reject("Some Problem Occured");
                        } else {
                            let data = redirect_uri.split("?")[1];
                            data = Twitter.deparam(data);
                            resolve(data);
                        }
                    });

                    // Twitter.oauth_token_secret = des.oauth_token_secret;
                    // Twitter.oauth_token = des.oauth_token;
                    // var url = 'https://api.twitter.com/oauth/authenticate?oauth_token=' + Twitter.oauth_token;
                    // window.open(url);
                }, this));
            },
            api: function(path /* params obj, callback fn */) {
                var args = Array.prototype.slice.call(arguments, 1),
                    fn = false,
                    params = {},
                    method = 'GET';

                /* Parse arguments to their appropriate position */
                for(var i in args) {
                    switch(typeof args[i]) {
                    case 'function':
                        fn = args[i];
                    break;
                    case 'object':
                        params = args[i];
                    break;
                    case 'string':
                        method = args[i].toUpperCase();
                    break;
                    }
                }

                /* Add an oauth token if it is an api request */
                Twitter.oauth_token && (params.oauth_token = Twitter.oauth_token);

                /* Add a 1.1 and .json if its not an authentication request */
                (!path.match(/oauth/)) && (path = '1.1/' + path + '.json');

                var accessor = {consumerSecret: consumer_secret, tokenSecret: Twitter.oauth_token_secret},
                    message = {
                    action: API_URL + path,
                    method: method,
                    parameters: [['oauth_consumer_key', consumer_key], ['oauth_signature_method', 'HMAC-SHA1']]
                    };

                $.each(params, function(k, v) {
                    OAuth.setParameter(message, k, v);
                });

                OAuth.completeRequest(message, accessor);

                var p = [];
                $.each(OAuth.getParameterMap(message.parameters), function(k, v) {
                    p.push(k + '=' + OAuth.percentEncode(v));
                });

                $[method.toLowerCase()](API_URL + path, p.join('&'), fn).error(function(res) {
                    if(res && res.responseText && res.responseText.match(/89/)) {
                        Twitter.authenticate();
                    }
                });
            },
            deparam: function(params) {
                var obj = {};
                $.each(params.split('&'), function() {
                    var item = this.split('=');
                    obj[item[0]] = item[1];
                });
                return obj;
            }
        };
        Twitter.authenticate();
    });
}