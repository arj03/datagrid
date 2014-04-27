$(function() {

    function cellValue(val) {
        return { sortValue: val, displayValue: val };
    }

    var yAxis = [{ id: 'store', name: 'Store' }];
    var keyfigures = [{ id: 'nocustomers', name: 'Customers' }, { id: 'turnover', name: 'Turnover' }];

    reportState.serverData = [
        { type: 'row', values: [cellValue('Copenhagen'), cellValue("210"), cellValue("43100")] },
        { type: 'row', values: [cellValue('Stockholm'), cellValue("120"), cellValue("22100")] },
        { type: 'row', values: [cellValue('Berlin'), cellValue("743"), cellValue("50032")] },
        { type: 'grandtotal', values: [cellValue('Grand total'), cellValue("1073"), cellValue("115232")] }
    ];
    
    reportState.useExpandCollapse = false;

    var allYAxisValues = reportBuilder.getYAxisValues(reportState.serverData, yAxis);
    
    reportInterface.drawTable("data", allYAxisValues, reportState.serverData, yAxis, keyfigures);
});