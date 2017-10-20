var private_key = "KEY FROM 2CAPTCHA HERE";
var counter                 = 0;
var two_captcha_id          = 0;
var routine_callback        = null;
var interval                = null;
var page_default            = null;

function getResponse()
{
    var baseUrl = "http://2captcha.com/res.php?key=" + private_key + "&action=get&id=" + two_captcha_id;
    page_default.open(baseUrl, function (status) {
        var html = page_default.content.split("<body>")[1];
        var result = html.split("</body>")[0];
        if (result == "CAPCHA_NOT_READY") {
            console.log("Captcha not ready yet...");
        } else {
            var response = result.split("|");
            if (response.length > 1) {
                routine_callback(response[1]);
                clearInterval(interval);
                return;
            }
        }
        counter++;
        if (counter == 80) {
            clearInterval(interval);
            routine_callback(null);
        }
    });
}

function getRecaptcha(googleKey, page, callback)
{
    page_default = page;
    counter = 0;
    two_captcha_id = 0;
    routine_callback = callback
    var baseUrl = "http://2captcha.com/in.php?key=" + private_key + "&method=userrecaptcha&googlekey=" + googleKey + "&pageurl=www.rpg-paradize.com";
    logCookies(page_default);

    page_default.open(baseUrl, function (status) {
        if (status !== 'success') {
            console.log("An error occured on http request on recaptcha solving");
            return;
        }

        var html = page_default.content.split("|")[1];
        two_captcha_id = html.split("</body>")[0];
        console.log("Resolving captcha id : " + two_captcha_id + "...");
        if (two_captcha_id) {
            interval = setInterval(getResponse, 2000);
        }
    });
}