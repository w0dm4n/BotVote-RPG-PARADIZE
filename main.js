phantom.injectJs("routine.js");

var hostname        = null;
var forbidden_ip    = "127.0.0.1";
var last_host       = null;

var proxy_host              = null;
var proxy_port              = 0;
var useProxy                = true;
var proxyCounter            = 0;

function getCurrentHostname(callback)
{
    var page = require('webpage').create();
    var url = 'http://bot.whatismyipaddress.com/';
    page.open(url, function (status) {
        var html_deleted = page.content.split("<body>")[1];
        hostname = html_deleted.split("</body>")[0];
        callback();
    });
}

function resetProxyPhantom()
{
    phantom.setProxy('', '', '', '', '');
    console.log("Proxy disabled for 2captcha solving !");
}

function setProxyPhantom(proxy_host, proxy_port, type)
{
    phantom.setProxy(proxy_host, proxy_port, type, '', '');
}

function getProxy()
{
    var fs = require('fs');
    var proxys = fs.read('proxy.txt').split('\r\n');
    if (proxyCounter < proxys.length) {
        var proxy_data = proxys[proxyCounter].split(":");
        proxy_host = proxy_data[0];
        proxy_port = proxy_data[1];
        proxyCounter++;
    } else {
        proxy_host = null;
        proxy_port = 0;
    }
}

function startVote() {
    if (useProxy == true) {
        getProxy();
        if (proxy_host == null || proxy_port == 0) {
            console.log("No more proxy available !");
            return ;
        }
    }
    getCurrentHostname(function() {
        if (hostname != forbidden_ip) {
            //if (hostname != last_host) {
                startRoutine(useProxy, proxy_host, proxy_port);
                last_host = hostname;
            //} else {
            //    console.log("Please update the address ip !");
            //}
        }
    });
}

if (useProxy) {
    getProxy();
}

startVote();
setInterval(startVote, 200000);