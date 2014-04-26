// fixme: ns

// HELPER FUNCTIONS  //

// FIXME: used where?
function getTableData(data) {
    return callbackUrlRetry("Report.aspx", "GetReportData", JSON.stringify(data));
}

// might still be useful
function sumFunc(vals) {
    return _.reduce(vals, function (memo, num) { return memo + num; }, 0); 
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
// --> remove

function percentageFormat(str) {
    return floatToStr(strToFloat(str) * 100) + " %";
}

function percentageIncreaseFunction(val1, val2) {
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

function GetTodayInNiceFormat() 
{
    var today = new Date();
    var dd = today.getDate()-1;
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd < 10)
        dd = '0' + dd;

    if (mm < 10)
        mm = '0' + mm;

    today = mm + '/' + dd + '/' + yyyy;

    return today;
}

function GetDayMDXRestriction() 
{
    var dateRestriction = $("#day").val();
    if (dateRestriction.length <= 10) {
        return format('[Time].[PK_Date].[PK_Date].&[{0}-{1}-{2}T00:00:00]',
            dateRestriction.slice(6), dateRestriction.slice(3, 5), dateRestriction.slice(0, 2));
    } else {
        return format('{[Time].[PK_Date].[PK_Date].&[{0}-{1}-{2}T00:00:00]:[Time].[PK_Date].[PK_Date].&[{3}-{4}-{5}T00:00:00]}',
                      dateRestriction.slice(6, 10), dateRestriction.slice(3, 5), dateRestriction.slice(0, 2), 
                      dateRestriction.slice(19), dateRestriction.slice(16, 18), dateRestriction.slice(13, 15));
    }
}

function GetLastYearDayMDXRestriction() 
{
    var dateRestriction = $("#day").val();

    if (dateRestriction.length <= 10) {
        var d = new Date(parseInt(dateRestriction.slice(6)), parseInt(dateRestriction.slice(3, 5)), parseInt(dateRestriction.slice(0, 2)) - 1);
        var lastYear = SameDayPreviousYear(d);

        return format('[Time].[PK_Date].[PK_Date].&[{0}-{1}-{2}T00:00:00]', d.getFullYear(), paddy(d.getMonth() + 1, 2), paddy(d.getDate(), 2));
    } else {
        var d1 = new Date(parseInt(dateRestriction.slice(6, 10)), parseInt(dateRestriction.slice(3, 5)), parseInt(dateRestriction.slice(0, 2)) - 1);
        var d2 = new Date(parseInt(dateRestriction.slice(19)), parseInt(dateRestriction.slice(16, 18)), parseInt(dateRestriction.slice(13, 15)) - 1);

        var lastYearD1 = SameDayPreviousYear(d1);
        var lastYearD2 = SameDayPreviousYear(d2);

        return format('{[Time].[PK_Date].[PK_Date].&[{0}-{1}-{2}T00:00:00]:[Time].[PK_Date].[PK_Date].&[{3}-{4}-{5}T00:00:00]}',
                      d1.getFullYear(), paddy(d1.getMonth() + 1, 2), paddy(d1.getDate(), 2), 
                      d2.getFullYear(), paddy(d2.getMonth() + 1, 2), paddy(d2.getDate(), 2));
    }
}

function SameDayPreviousYear(date, years) 
{
    if (!years)
        years = 1;

    var dayOfWeek = date.getDay(); // find the day of week, so we can find it last year
    date.setMonth(date.getMonth() - (years * 12));
    while (date.getDay() != dayOfWeek)
        date.setDate(date.getDate() + 1);
}

// FIXME: woah
$(function() {
    $(document).ajaxStart(function() {
        $("#ajaxSpinnerImage").show();
    }).ajaxStop(function() {
        $("#ajaxSpinnerImage").hide();
    });
});
