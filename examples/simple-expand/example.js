$(function() {

    function cellValue(val) {
        return { sortValue: val, displayValue: val.toString() };
    }

    var yAxis = [{ id: 'store', name: 'Store' }, { id: 'clerk', name: 'Clerk' }];
    var keyfigures = [{ id: 'nocustomers', name: 'Customers' }, { id: 'turnover', name: 'Turnover' }];

    // normally one would request data here from the server using yAxis and keyfigures
    // but to keep things simple, we type in the result below

    var reportState = new ReportState({ useExpandCollapse: true });

    reportState.dimensionsY = _.map(yAxis, function(e) { return e.id; });

    reportState.serverData = [
        { type: 'row', values: [cellValue('Copenhagen'), cellValue(''), cellValue(210), cellValue(43100)] },
        { type: 'row', values: [cellValue('Stockholm'), cellValue(''), cellValue(120), cellValue(22100)] },
        { type: 'row', values: [cellValue('Berlin'), cellValue(''), cellValue(743), cellValue(50032)] },
        { type: 'grandtotal', values: [cellValue('Grand total'), cellValue(''), cellValue(1073), cellValue(115232)] }
    ];

    var allYAxisValues = reportBuilder.getYAxisValues(reportState.serverData, yAxis);

    reportState.drawNewData = function(data) { 
        // this also simulates a server backend returning new results
        reportState.serverData = [];

        if (_.any(reportState.expandedCells['store'], function(e) { return e == 'store:Copenhagen'; }))
        {
            reportState.serverData.push({ type: 'row', values: [cellValue('Copenhagen'), cellValue('Stine'), cellValue(110), cellValue(33100)] });
            reportState.serverData.push({ type: 'row', values: [cellValue('Copenhagen'), cellValue('Dorthe'), cellValue(100), cellValue(10000)] });
            reportState.serverData.push({ type: 'subtotal', values: [cellValue('Copenhagen'), cellValue(''), cellValue(210), cellValue(43100)] });
        }
        else
            reportState.serverData.push({ type: 'row', values: [cellValue('Copenhagen'), cellValue(''), cellValue(210), cellValue(43100)] });

        if (_.any(reportState.expandedCells['store'], function(e) { return e == 'store:Stockholm'; }))
        {
            reportState.serverData.push({ type: 'row', values: [cellValue('Stockholm'), cellValue('Emma'), cellValue(30), cellValue(2100)] });
            reportState.serverData.push({ type: 'row', values: [cellValue('Stockholm'), cellValue('Anne'), cellValue(70), cellValue(18000)] });
            reportState.serverData.push({ type: 'row', values: [cellValue('Stockholm'), cellValue('Julia'), cellValue(20), cellValue(2000)] });
            reportState.serverData.push({ type: 'subtotal', values: [cellValue('Stockholm'), cellValue(''), cellValue(120), cellValue(22100)] });
        }
        else
            reportState.serverData.push({ type: 'row', values: [cellValue('Stockholm'), cellValue(''), cellValue(120), cellValue(22100)] });

        if (_.any(reportState.expandedCells['store'], function(e) { return e == 'store:Berlin'; }))
        {
            reportState.serverData.push({ type: 'row', values: [cellValue('Berlin'), cellValue('Sandra'), cellValue(93), cellValue(1182)] });
            reportState.serverData.push({ type: 'row', values: [cellValue('Berlin'), cellValue('Katharina'), cellValue(100), cellValue(6700)] });
            reportState.serverData.push({ type: 'row', values: [cellValue('Berlin'), cellValue('Nadine'), cellValue(120), cellValue(10030)] });
            reportState.serverData.push({ type: 'row', values: [cellValue('Berlin'), cellValue('Julia'), cellValue(430), cellValue(30200)] });
            reportState.serverData.push({ type: 'subtotal', values: [cellValue('Berlin'), cellValue(''), cellValue(743), cellValue(50032)] });
        }
        else
            reportState.serverData.push({ type: 'row', values: [cellValue('Berlin'), cellValue(''), cellValue(743), cellValue(50032)] });

        reportState.serverData.push({ type: 'grandtotal', values: [cellValue('Grand total'), cellValue(''), cellValue(1073), cellValue(115232)] });

        if (reportState.sortRowIndex != -1)
            reportState.drawData(reportBuilder.sortExpandedData(reportState.serverData, reportState.dimensionsY, reportState.sortRowIndex, reportState.sortDirection, reportState.expandedCells));
        else
            reportState.drawData(reportState.serverData);
    };
    
    reportState.drawData = function(data) {
        reportInterface.drawTable("data", reportState, allYAxisValues, data, yAxis, keyfigures);
        reportInterface.addSortHeaders("data", reportState);
        reportInterface.addExpandCollapseHeaders("data", reportState);
    };

    reportState.drawData(reportState.serverData);
});
