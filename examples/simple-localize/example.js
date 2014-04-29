$(function() {

    function cellValue(val) {
        return { sortValue: val, displayValue: val };
    }

    var yAxis = [{ id: 'store', name: 'Store' }];
    var keyfigures = [{ id: 'nocustomers', name: 'Customers' }, { id: 'turnover', name: 'Turnover' }];

    // danish translation
    reportState.translateDimKF['store'] = 'Butik';
    reportState.translateDimKF['nocustomers'] = 'Antal kunder';
    reportState.translateDimKF['turnover'] = 'Omsætning';

    // normally one would request data here from the server using yAxis and keyfigures
    // but to keep things simple, we type in the result below

    reportState.serverData = [
        { type: 'row', values: [cellValue('København'), cellValue("210"), cellValue("43100")] },
        { type: 'row', values: [cellValue('Stockholm'), cellValue("120"), cellValue("22100")] },
        { type: 'row', values: [cellValue('Berlin'), cellValue("743"), cellValue("50032")] },
        { type: 'grandtotal', values: [cellValue('Total'), cellValue("1073"), cellValue("115232")] }
    ];
    
    reportState.useExpandCollapse = false;
    reportState.imagePath = "../../images/";

    reportBuilder.localizedHeaders(yAxis, keyfigures);

    var allYAxisValues = reportBuilder.getYAxisValues(reportState.serverData, yAxis);
    
    reportInterface.drawTable("data", allYAxisValues, reportState.serverData, yAxis, keyfigures);
});