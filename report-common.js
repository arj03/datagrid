// fixme: ns

// similar to format in other languages
function format(str) {
    for (var i = 1; i < arguments.length; ++i)
        str = str.replace(new RegExp('\\{' + (i - 1) + '\\}', "g"), arguments[i]);

    return str;
}

// deep clone
function cloneObj(o) {
    return jQuery.extend(true, {}, o);
}

// <-- remove
function floatToStr(f) {
    return removeExtraDecimals(String(f).replace(".", ","));
}

var toString = Object.prototype.toString;

_.isString = function (obj) {
    return toString.call(obj) == '[object String]';
}

function strToFloat(str) {
    if (!_.isString(str) || str == "") {
        return 0;
    }

    return parseFloat(str.replace(",", "."));
}

function removeExtraDecimals(str) {
    if (str.length > 5 && str.indexOf(',') != -1)
        return str.substring(0, str.indexOf(',') + 3);
    else
        return str;
}

function formatFloat(str) {
    if (str.indexOf(' ') != -1) // currency
    {
        var t = str.split(' ');
        // thousand digits
        return t[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " " + t[1];
    }
    else
    {
        var t = removeExtraDecimals(str);

        // thousand digits
        return t.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
}

function percentageFormat(str) 
{
    return floatToStr(strToFloat(str) * 100) + " %";
}

function percentageIncreaseFunction(val1, val2) 
{
    var fVal1 = strToFloat(val1), fVal2 = strToFloat(val2);
    if (fVal2 != 0)
        return String(((fVal1 - fVal2) * 100) / fVal2).replace(".", ",") + + " %"; // for strip to work ;-)
    else
        return "0";
}

function indexFunction(val1, val2) 
{
    var fVal1 = strToFloat(val1), fVal2 = strToFloat(val2);
    if (fVal2 != 0) {
        var res = String(((fVal1) * 100) / fVal2).replace(".", ",");
        return res; //+ " %";
    }// for strip to work ;-)
    else
        return "0";
}
// --> remove
