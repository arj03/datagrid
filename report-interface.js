var reportInterface = new function() {

    // public

    this.addSortHeaders = function(domId, reportState) 
    {
        // sort
        _.each($(format("#{0} tr.header td", domId)), function(e, i) { 

            // if dim, then it needs to be expanded
            if (reportState.useExpandCollapse && 
                i < reportState.dimensionsY.length &&
                i > _.keys(reportState.expandedCells).length)
                return; // continue

            if (reportState.sortRowIndex == i && reportState.sortDirection == "down")
                $(e).append('<i class="fa fa-angle-up sortdown sortdownselected"></i>');
            else
                $(e).append('<i class="fa fa-angle-up sortdown"></i>');

            if (reportState.sortRowIndex == i && reportState.sortDirection == "up")
                $(e).append('<i class="fa fa-angle-down sortup sortupselected"></i>');
            else
                $(e).append('<i class="fa fa-angle-down sortup"></i>');
        });

        function sortAndDrawDataLocally(rowIndex, direction)
        {
            reportState.sortRowIndex = rowIndex;
            reportState.sortDirection = direction;

            if (reportState.useExpandCollapse)
                reportState.drawData(reportBuilder.sortExpandedData(reportState.serverData, reportState.dimensionsY, reportState.sortRowIndex, reportState.sortDirection, reportState.expandedCells));
            else
                reportState.drawData(reportBuilder.sortData(reportState.serverData, reportState.sortRowIndex, reportState.sortDirection));
        }

        $(".sortup").unbind().click(function(e) {

            e.preventDefault();

            sortAndDrawDataLocally($(this).parent().index(), "up");
        });

        $(".sortdown").unbind().click(function(e) {

            e.preventDefault();

            sortAndDrawDataLocally($(this).parent().index(), "down");
        });
    };

    // adds expand/collapse all to dimension headers and hookup click handlers
    this.addExpandCollapseHeaders = function(domId, reportState)
    {
        _.each(reportState.dimensionsY, function(e, i) {

            var noExpandedCells = $(format("#{0} i.expandDimension.{1}", domId, e)).length;
            var noCollapsedCells = $(format("{0} i.collapseDimension.{1}", domId, e)).length;

            var header = $(format("#{0} tr.header td:eq({1})", domId, i));

            if (noExpandedCells > 0)
                header.append('<i class="fa fa-plus expandAll"></i>');
            else if (noCollapsedCells > 0)
                header.append('<i class="fa fa-minus collapseAll"></i>');
        });


        this.hookupExpandCollapseAll(domId, reportState);
    };

    // domId
    // allYaxisValues the result of getAllYAxisValues
    // data [{ type: "row|subtotal|grandtotal", values: [{ sortValue: "", displayValue: "", sortValueType: "string" }] ]
    // yAxis [{ id: '', name: ''}, ...]
    // xAxis [{ id: '', name: '', calculate: ... }, ...] 
    // xAxisRestrictions [{ name: '', visible: false }, ...] 
    // xAxisDimValues [value1, value2, ...]
    //
    this.drawTable = function(domId, reportState, allYaxisValues, data, yAxis, xAxis, xAxisRestrictions, xAxisDimValues)
    {
        var dataTable = $(format("#{0}", domId));
        var dataTableHTML = "";

        var extraHeaders = _.filter(xAxisRestrictions, function(e) { return e.visible; }).length;

        dataTableHTML += "<thead>";

        for (var i = 0; i < extraHeaders; ++i) {
            var extraRow = [];
            _.each(yAxis, function() { extraRow.push(""); });

            _.each(xAxis, function(x, xi) {
                var visibleHeaders = _.filter(xAxisRestrictions[xi], function(e) { return e.visible; });
                var hasHeaders = visibleHeaders.length >= (extraHeaders - i);

                _.each(x, function() {
                    if (hasHeaders)
                        extraRow.push(visibleHeaders[extraHeaders - i - 1].name);
                    else
                        extraRow.push("");
                });
            });

            dataTableHTML += headerRowToHTML(extraRow, true);
        }

        // normal headers
        var yNames = _.map(yAxis, function(e) { return e.name; });
        var xNames = _.map(xAxis, function(e) { return e.name; });

        // x-axis dimension
        if (xAxisDimValues != null && xAxisDimValues.length > 0) {
            var extraRow = [];
            _.each(yAxis, function() { extraRow.push(""); });

            var allXNames = [];

            _.each(xAxisDimValues, function(xAxisDimValue) {

                extraRow.push(xAxisDimValue);
                for (var i = 1; i < xNames.length; ++i)
                    extraRow.push(xAxisDimValue);

                _.each(xNames, function(xName) {
                    allXNames.push(xName);
                });
            });

            dataTableHTML += headerRowToHTML(extraRow, true);
            dataTableHTML += headerRowToHTML(_.flatten([yNames, allXNames]));
        }
        else {
            dataTableHTML += headerRowToHTML(_.flatten([yNames, xNames]));
        }

        dataTableHTML += "</thead>";

        // values

        var lastDimValues = _.map(yAxis, function() { return { displayValue: "" }; });

        var noDimensions = yNames.length;

        var formatFunctions = {};

        var xAxisCount = 1;
        if (xAxisDimValues != null && xAxisDimValues.length > 0)
            xAxisCount = xAxisDimValues.length;

        for (var xAxisIndex = 0; xAxisIndex < xAxisCount; ++xAxisIndex) {
            _.each(xAxis, function(xAxisSpec) {
                if (xAxisSpec.calculate)
                    formatFunctions[noDimensions + i] = xAxisSpec.calculate;
                noDimensions += 1;
            });
        }

        _.each(data, function(row, i) {

	    var unmodifiedYaxis = _.take(row.values, yAxis.length);
            var values = _.map(row.values, function(e) { return cloneObj(e); });

            var foundSubtotal = false;

            _.each(yAxis, function(e, i) {
                if (reportState.useExpandCollapse && lastDimValues[i].displayValue == values[i].displayValue && row.type == "row")
                    values[i].displayValue = "";

                if (row.type == "subtotal" && values[i].displayValue == "" && !foundSubtotal) {
                    values[i].displayValue = "Sub total";
                    foundSubtotal = true;
                }
            });

            dataTableHTML += reportInterface.rowToHTML(values, row.type, formatFunctions, yAxis, row.values, reportState);

            lastDimValues = unmodifiedYaxis;
        });

        dataTable.html(dataTableHTML);

        if (reportState.useExpandCollapse)
            hookupExpandCollapse(domId, reportState);
    };

    this.hookupExpandCollapseAll = function(domId, reportState) 
    {
        $(format("#{0} i.expandAll", domId)).unbind().click(function(e) {

            e.preventDefault();

            var td = $(this).closest("td");
            var dimId = reportState.dimensionsY[td[0].cellIndex];

            var cellsToExpand = $(format("i.expandDimension.{0}", dimId));

            _.each(cellsToExpand, function(e, i) {
                var expandValue = $(e).data("expandcollapse");

                if (reportState.expandedCells[dimId] != null)
                    reportState.expandedCells[dimId].push(expandValue);
                else
                    reportState.expandedCells[dimId] = [expandValue];
                
                $(e).removeClass("expandDimension").addClass("collapseDimension");
            });

            reportState.drawNewData();
        });

        $(format("#{0} i.collapseAll", domId)).unbind().click(function(e) {

            e.preventDefault();

            var td = $(this).closest("td");
            var dimId = reportState.dimensionsY[td[0].cellIndex];

            var cellsToCollapse = $(format("i.collapseDimension.{0}", dimId));

            _.each(cellsToCollapse, function(e, i) {

                var td = $(e).closest("td");
                var value = td.text();

		        // FIXME: maybe get the sort value instead of the display value as td.text() is

                // collapse multiple
                // we have encoded the parent values in the collapse img tag
                // so we need to remove these as well
                var cells = _.map($(format("i.collapseDimension[data-expandcollapse*='{0}']", dimId + ':' + value)), function(e2) { return $(e2).data('expandcollapse'); });

                _.each(reportState.expandedCells, function(tempValues, expandedDim) {
                    _.each(cells, function(cell) {
                        reportState.expandedCells[expandedDim] = _.without(reportState.expandedCells[expandedDim], cell);
                        if (reportState.expandedCells[expandedDim].length == 0) {
                            delete reportState.expandedCells[expandedDim];
                            return false; // break
                        }
                    });
                });

                $(e).removeClass("collapseDimension").addClass("expandDimension");
            });

            reportState.drawNewData();
        });
    };

    // adds horizontal split lines to the table, can take any number of column indexes
    this.addSplits = function(domId)
    {
        for (var i = 0; i < arguments.length; ++i) {
            this.addSplit(domId, arguments[i]);
        }
    };

    // adds a horizontal split line to the table, can take any number of column indexes
    this.addSplit = function(domId, colIndex) 
    {
        $(format("table#{0} td:nth-child({1})", domId, colIndex)).css("border-right", "1.5px solid #ccc");
    };

    this.rowToHTML = function(values, rowType, formatFunctions, yAxis, startValues, reportState) 
    {
        var valuesHTML = "";

        _.each(values, function(e, i) {

            var dimValue = e.displayValue == '' ? '&nbsp;' : e.displayValue;

	        // this is yAxis length - 1 because we can't expand the last dim anyway
            if (reportState.useExpandCollapse && i < (yAxis.length - 1) && dimValue != '&nbsp;')
            {
                if (rowType != 'row') {
                    valuesHTML += format("<td>{0}</td>", dimValue);
                    return;
                }

                var lookupKey = "";
                for (var j = 0; j <= i; ++j) {
                    if (j != i)
                        lookupKey += yAxis[j].id + ":" + startValues[j].sortValue + "|";
                    else
                        lookupKey += yAxis[j].id + ":" + startValues[j].sortValue;
                }

		        var dimId = reportState.dimensionsY[i];

                if (dimId in reportState.expandedCells) {
                    if (_.contains(reportState.expandedCells[dimId], lookupKey)) {
                        valuesHTML += format("<td><i class='fa fa-minus collapseDimension {1}' data-expandcollapse='{0}'></i>{2}</td>", lookupKey, dimId, dimValue);
                        return;
                    }
                }

                valuesHTML += format("<td><i class='fa fa-plus expandDimension {1}' data-expandcollapse='{0}'></i>{2}</td>", lookupKey, dimId, dimValue);
            }
            else 
	        {
                if (i <= yAxis.length - 1) {
                    valuesHTML += format("<td>{0}</td>", dimValue);
                }
                else {
		            // FIXME: formatfloat shit
                    if (formatFunctions && formatFunctions[i])
                        valuesHTML += format("<td class='data-kf-value'>{0}</td>", formatFloat(formatFunctions[i](dimValue)));
                    else
                        valuesHTML += format("<td class='data-kf-value'>{0}</td>", formatFloat(dimValue));
                }
            }
        });

        if (rowType != 'row')
            return format("<tr class='{0}'>{1}</tr>", rowType, valuesHTML);
        else
            return format("<tr>{0}</tr>", valuesHTML);
    };

    // private
    
    // adds click handler to expand/collapse buttons in the table
    function hookupExpandCollapse(domId, reportState)
    {
        $(format("#{0} .expandDimension", domId)).click(function(e) {

            e.preventDefault();

            var td = $(this).closest("td");
            var dimId = reportState.dimensionsY[td[0].cellIndex];

            var expandValue = $(this).data("expandcollapse");

            if (dimId in reportState.expandedCells)
                reportState.expandedCells[dimId].push(expandValue);
            else
                reportState.expandedCells[dimId] = [expandValue];

            // we don't need data-expandcollapse as we draw anyway
            $(this).removeClass("expandDimension").addClass("collapseDimension");

            reportState.drawNewData();
        });

        $(format("#{0} .collapseDimension", domId)).click(function(e) {

            e.preventDefault();

            var td = $(this).closest("td");
            var dimId = reportState.dimensionsY[td[0].cellIndex];

	        // FIXME: we need to use sortValue!
            var value = td.text();

	        // FIXME: maybe get the sort value instead of the display value as td.text() is

            // collapse multiple
            // we have encoded the parent values in the collapse img tag
            // so we need to remove these as well
            var cells = _.map($(format("i.collapseDimension[data-expandcollapse*='{0}']", dimId + ':' + value)), function(e) { return $(e).data('expandcollapse'); });

            _.each(reportState.expandedCells, function(tempValues, expandedDim) {
                _.each(cells, function(cell) {
                    reportState.expandedCells[expandedDim] = _.without(reportState.expandedCells[expandedDim], cell);
                    if (reportState.expandedCells[expandedDim].length == 0) {
                        delete reportState.expandedCells[expandedDim];
                        return false; // break
                    }
                });
            });

            // we don't need data-expandcollapse as we draw anyway
            $(this).removeClass("collapseDimension").addClass("expandDimension");

            reportState.drawNewData();
        });
    };

    function headerRowToHTML(values, top) 
    {
        var valuesHTML = "";

        var lastValue = "æøå";
        var valuesInARow = 1;
        var waitingToWrite = "";

        _.each(values, function(e, i) {

            if (lastValue != e) {
                if (waitingToWrite != "") {
                    valuesHTML += format(waitingToWrite, valuesInARow);
                    waitingToWrite = "<td colspan='{0}'>" + e + "</td>";
                }
                else
                    waitingToWrite = "<td colspan='{0}'>" + e + "</td>";
                valuesInARow = 1;
            } else
                valuesInARow += 1;

            lastValue = e;
        });

        if (waitingToWrite != "")
            valuesHTML += format(waitingToWrite, valuesInARow);

        if (top)
            return format("<tr class='topheader'>{0}</tr>", valuesHTML);
        else
            return format("<tr class='header'>{0}</tr>", valuesHTML);
    }
};
