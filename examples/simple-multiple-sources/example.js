$(function() {

    function cellValue(val) {
        return { sortValue: val, displayValue: val };
    }

    var yAxis = [{ id: 'store', name: 'Store' }];
    var salesKeyfigures = [{ id: 'nocustomers', name: 'Customers' }, { id: 'turnover', name: 'Turnover' }];

    // normally one would request data here from the server using yAxis and salesKeyfigures
    // but to keep things simple, we type in the result below

    var salesData = [
        { type: 'row', values: [cellValue('Copenhagen'), cellValue("210"), cellValue("43100")] },
        { type: 'row', values: [cellValue('Stockholm'), cellValue("120"), cellValue("22100")] },
        { type: 'row', values: [cellValue('Berlin'), cellValue("743"), cellValue("50032")] },
        { type: 'grandtotal', values: [cellValue('Grand total'), cellValue("1073"), cellValue("115232")] }
    ];
    
    var adKeyfigures = [{ id: 'noads', name: 'Number of ads run' }, { id: 'marketingbudget', name: 'Marketing budget' }];

    // normally one would request data here from the server using yAxis and adKeyfigures
    // but to keep things simple, we type in the result below

    var adData = [
        { type: 'row', values: [cellValue('Copenhagen'), cellValue("0"), cellValue("0")] },
        { type: 'row', values: [cellValue('Stockholm'), cellValue("5"), cellValue("5000")] },
        { type: 'row', values: [cellValue('Berlin'), cellValue("10"), cellValue("7500")] },
        { type: 'grandtotal', values: [cellValue('Grand total'), cellValue("15"), cellValue("12500")] }
    ];

    var reportState = new ReportState();

    reportState.imagePath = "../../images/";

    reportState.serverData = reportBuilder.combineData([salesData, adData], [salesKeyfigures, adKeyfigures], yAxis);

    var allYAxisValues = reportBuilder.getYAxisValues(reportState.serverData, yAxis);

    reportInterface.drawTable("data", reportState, allYAxisValues, reportState.serverData, yAxis, _.flatten([salesKeyfigures, adKeyfigures]));
});
