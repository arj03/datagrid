$(function() {

    $('#day').dateRangePicker({ datepickerOptions: { firstDay: 1} });

    function GetDayMDXRestriction() {
        // grab date restrictions from #day
    }

    function SameDayPreviousYear(date, years) 
    {
        if (!years)
            years = 1;

        // invalid date
        if (isNaN(date.getTime()))
            return date;

        var returnDate = new Date(date);

        var dayOfWeek = returnDate.getDay(); // find the day of week, so we can find it last year

        returnDate.setMonth(returnDate.getMonth() - (years * 12));
        while (returnDate.getDay() != dayOfWeek)
            returnDate.setDate(returnDate.getDate() + 1);

        return returnDate;
    }

    function GetLastYearDayMDXRestriction() {
        // grab date restrictions from #day and use SameDayPreviousYear
    }

    function cellValue(val) {
        return { sortValue: val, displayValue: val };
    }

    var yAxis = [{ id: 'store', name: 'Store' }];
    var keyfigures = [{ id: 'nocustomers', name: 'Customers' }, { id: 'turnover', name: 'Turnover' }];

    var xAxisRestrictionsThisYear = [{ name: 'Day', restrictions: [GetDayMDXRestriction()], visible: false }];

    // normally one would request data here from the server using yAxis and keyfigures
    // but to keep things simple, we type in the result below

    var thisYearData = [
        { type: 'row', values: [cellValue('Copenhagen'), cellValue("210"), cellValue("43100")] },
        { type: 'row', values: [cellValue('Stockholm'), cellValue("120"), cellValue("22100")] },
        { type: 'row', values: [cellValue('Berlin'), cellValue("743"), cellValue("50032")] },
        { type: 'grandtotal', values: [cellValue('Grand total'), cellValue("1073"), cellValue("115232")] }
    ];
    
    var xAxisRestrictionsLastYear = [{ name: 'Day', restrictions: [GetLastYearDayMDXRestriction()], visible: false }];

    // normally one would request data here from the server using yAxis and keyfigures
    // but to keep things simple, we type in the result below

    var lastYearData = [
        { type: 'row', values: [cellValue('Copenhagen'), cellValue("0"), cellValue("0")] },
        { type: 'row', values: [cellValue('Stockholm'), cellValue("5"), cellValue("5000")] },
        { type: 'row', values: [cellValue('Berlin'), cellValue("10"), cellValue("7500")] },
        { type: 'grandtotal', values: [cellValue('Grand total'), cellValue("15"), cellValue("12500")] }
    ];

    var reportState = new ReportState();

    reportState.imagePath = "../../images/";

    var allYAxisValues = reportBuilder.getAllYAxisValues([thisYearData, lastYearData], yAxis);

    var combinedKeyFigures = [
        { id: keyfigures[0].id, name: keyfigures[0].name + ' TY', dataref: thisYearData, dataindex: 0 },
        { id: keyfigures[0].id, name: keyfigures[0].name + ' LY', dataref: lastYearData, dataindex: 0 },
        { id: keyfigures[0].id, name: keyfigures[0].name + ' Index', datacalculate: function(row) { 
            var val = 0;
            if (row[yAxis.length + 1].sortValue > 0)
                val = row[yAxis.length].sortValue / row[yAxis.length + 1].sortValue;
            
            return (val * 100).toFixed(0).toString() + "%";
        } },
        { id: keyfigures[1].id, name: keyfigures[1].name + ' TY', dataref: thisYearData, dataindex: 1 },
        { id: keyfigures[1].id, name: keyfigures[1].name + ' LY', dataref: lastYearData, dataindex: 1 },
        { id: keyfigures[1].id, name: keyfigures[1].name + ' Index', datacalculate: function(row) { 
            var val = 0;
            if (row[yAxis.length + 1].sortValue > 0)
                val = row[yAxis.length+3].sortValue / row[yAxis.length + 3 + 1].sortValue;
            
            return (val * 100).toFixed(0).toString() + "%";
        } }
    ];

    reportState.serverData = reportBuilder.mergeData(allYAxisValues, combinedKeyFigures);

    reportInterface.drawTable("data", reportState, allYAxisValues, reportState.serverData, yAxis, combinedKeyFigures);
});
