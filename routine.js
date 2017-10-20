phantom.injectJs("recaptcha.js");

var rpg_id = 109340;
var rpg_host = "http://www.rpg-paradize.com/?page=vote&vote=" + rpg_id;
var proxy_type = "http";
var savedUseProxy = false;
var savedProxyHost = null;
var savedProxyPort = 0;
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomUserAgent()
{
   var agents = ["Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1",
    "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2226.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A",
    "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/532.2 (KHTML, like Gecko) ChromePlus/4.0.222.3 Chrome/4.0.222.3 Safari/532.2",
    "Mozilla/5.0 (Windows NT 6.1; rv:27.3) Gecko/20130101 Firefox/27.3",
    "Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0"];
    return (agents[getRandomInt(0, agents.length - 1)]);
}

function setHeaders(page)
{
    page.settings.userAgent = getRandomUserAgent();
    page.customHeaders = {
    "Accept-Language": "fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4"};
    page.cookiesEnabled = true;
    page.addCookie({
            'name': 'cookieconsent_status',
            'value': 'dismiss',
            'domain': 'www.rpg-paradize.com'
        });
    page.settings.resourceTimeout = 7000; // 7 seconds
    page.onResourceTimeout = function(e) {
        console.log(e.errorCode);   // it'll probably be 408 
        console.log(e.errorString); // it'll probably be 'Network timeout on resource'
        console.log(e.url);         // the url whose request timed out
    };
}

function logCookies(page)
{
    var cookies = page.cookies;
    console.log('Listing cookies:');
    for(var i in cookies) {
        console.log(cookies[i].name + '=' + cookies[i].value);
    }
}

function clear(page)
{
    page.clearMemoryCache();
    page.clearCookies();

    phantom.clearCookies(); // just to be sure that everything is cleared
}

function submitVote(page, response)
{
    console.log("Submitting vote...");
    data = 'submitvote=' + rpg_id + "&g-recaptcha-response=" + response + "&capcode=false&submit=Voter";
    page.open("http://www.rpg-paradize.com/?page=vote2", 'post', data, function (status) {
        if (status !== 'success') {
            console.log("An error occured on http request on submitting vote");
            clear(page);
            return;
        } else { 
            logCookies(page);
            clear(page);
        }
    });
}

function setProxy(proxy_host, proxy_port, print)
{
    setProxyPhantom(proxy_host, proxy_port, "socks5");
    if (print) {
        console.log("Proxy " + proxy_host + ":" + proxy_port + " set !");
    }
}

function startRoutine(useProxy, proxy_host, proxy_port)
{
    var page = require('webpage').create();
    setHeaders(page);
    if (useProxy) {
        setProxy(proxy_host, proxy_port, true);
    }
    page.open(rpg_host, function (status) {
        if (status !== 'success') {
            console.log("An error occured on http request on routine");
            return;
        }

       var html_datas = page.content.split("data-sitekey=\"");
       if (html_datas.length > 1) {
           html_datas = html_datas[1];
        var googleKey = html_datas.split("\">")[0];
        if (useProxy) {
            resetProxyPhantom();
            savedUseProxy = useProxy;
            savedProxyHost = proxy_host;
            savedProxyPort = proxy_port;
        }
            getRecaptcha(googleKey, page, function(response) {
                if (response) {
                    if (savedUseProxy) {
                        setProxy(savedProxyHost, savedProxyPort, true);
                    }
                    console.log("Response: " + response);
                    submitVote(page, response);
                } else {
                    console.log("Cannot get response from 2captcha !");
                    clear(page);
                }
            });
        } else {
           console.log("Address ip invalid, please use a new one !");
       }
        //logCookies(page);
    });
}