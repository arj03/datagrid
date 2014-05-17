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

    function sortAndDrawData(rowIndex, direction)
    {
        reportState.sortRowIndex = rowIndex;
        reportState.sortDirection = direction;

        // normally one would request sorted data from the server here
        // using the index (either yAxis or keyfigures) and the direction
        // and on return call reportState.drawData with the data
    }

    reportState.drawData = function(data) {
        reportInterface.drawTable("data", reportState, allYAxisValues, data, yAxis, keyfigures);
        reportInterface.addSortHeaders("data", reportState);

        // overwrite local sorting
        $(".sortup").unbind().click(function(e) {

            e.preventDefault();

            sortAndDrawData($(this).parent().index(), "up");
        });

        $(".sortdown").unbind().click(function(e) {

            e.preventDefault();

            sortAndDrawData($(this).parent().index(), "down");
        });
    };

    reportState.drawData(reportState.serverData);
});
