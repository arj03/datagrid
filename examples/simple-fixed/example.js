$(function() {

    function cellValue(val) {
        return { sortValue: val, displayValue: val };
    }

    var yAxis = [{ id: 'store', name: 'Store' }];
    var keyfigures = [{ id: 'nocustomers', name: 'Customers' }, { id: 'turnover', name: 'Turnover' }];

    // normally one would request data here from the server using yAxis and keyfigures
    // but to keep things simple, we type in the result below

    var reportState = new ReportState();

    reportState.serverData = [
        { type: 'row', values: [cellValue('Copenhagen'), cellValue("210"), cellValue("43100")] },
        { type: 'row', values: [cellValue('Stockholm'), cellValue("120"), cellValue("22100")] },
        { type: 'row', values: [cellValue('Berlin'), cellValue("743"), cellValue("50032")] },
        { type: 'grandtotal', values: [cellValue('Grand total'), cellValue("1073"), cellValue("115232")] }
    ];
    
    var allYAxisValues = reportBuilder.getYAxisValues(reportState.serverData, yAxis);
    
    reportInterface.drawTable("data", reportState, allYAxisValues, reportState.serverData, yAxis, keyfigures);
});
