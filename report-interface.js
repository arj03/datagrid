var reportInterface = new function () {

    // public 

    this.addSortHeaders = function(domId) 
    {
        // sort
        _.each($(format("#{0} tr.header td", domId)), function (e) { $(e).html($(e).html() + '&nbsp;<img class="sortdown" src="Images/arrow_up.png"/>&nbsp;<img class="sortup" src="Images/arrow_down.png"/>'); });

        $(".sortup").unbind().click(function (e) {
            $("#ajaxSpinnerImage").show();

            reportState.sortRowIndex = $(this).parent().index();
            reportState.sortDirection = "up";

            if (reportState.useExpandCollapse)
                reportState.drawData(reportBuilder.sortExpandedData(reportState.serverData, reportState.dimensionsY, reportState.sortRowIndex, reportState.sortDirection));
            else
                reportState.drawData(reportBuilder.sortData(reportState.serverData, reportState.sortRowIndex, reportState.sortDirection));

            $("#ajaxSpinnerImage").hide();
        });

        $(".sortdown").unbind().click(function (e) {
            $("#ajaxSpinnerImage").show();

            reportState.sortRowIndex = $(this).parent().index();
            reportState.sortDirection = "down";

            if (reportState.useExpandCollapse)
                reportState.drawData(reportBuilder.sortExpandedData(reportState.serverData, reportState.dimensionsY, reportState.sortRowIndex, reportState.sortDirection));
            else
                reportState.drawData(reportBuilder.sortData(reportState.serverData, reportState.sortRowIndex, reportState.sortDirection));

            $("#ajaxSpinnerImage").hide();
        });
    };

    // domId
    // allYaxisValues the result of getAllYAxisValues
    // data [{ type: "row|subtotal|grandtotal", values: [{ sortValue: "", displayValue: "", sortValueType: "string" }] ]
    // yAxis [{ id: '', name: ''}, ...]
    // xAxis [{ id: '', name: '', calculate: ... }, ...] 
    // xAxisRestrictions [{ name: '', visible: false }, ...] 
    // xAxisDimValues [value1, value2, ...]
    //
    this.drawTable = function(domId, allYaxisValues, data, yAxis, xAxis, xAxisRestrictions, xAxisDimValues)
    {
        var dataTable = $(format("#{0}", domId));
        var dataTableHTML = "";

        var extraHeaders = _.filter(xAxisRestrictions, function (e) { return e.visible; }).length;

        dataTableHTML += "<thead>";

        for (var i = 0; i < extraHeaders; ++i) {
            var extraRow = [];
            _.each(yAxis, function () { extraRow.push(""); });

            _.each(xAxis, function (x, xi) {
                var visibleHeaders = _.filter(xAxisRestrictions[xi], function (e) { return e.visible; });
                var hasHeaders = visibleHeaders.length >= (extraHeaders - i);

                _.each(x, function () {
                    if (hasHeaders)
                        extraRow.push(visibleHeaders[extraHeaders - i - 1].name);
                    else
                        extraRow.push("");
                });
            });

            dataTableHTML += headerRowToHTML(extraRow, true);
        }

        // normal headers
        var yNames = _.map(yAxis, function (e) { return e.name; });
        var xNames = _.map(xAxis, function (e) { return e.name; });

        // x-axis dimension
        if (xAxisDimValues != null && xAxisDimValues.length > 0) {
            var extraRow = [];
            _.each(yAxis, function () { extraRow.push(""); });

            var allXNames = [];

            _.each(xAxisDimValues, function (xAxisDimValue) {

                extraRow.push(xAxisDimValue);
                for (var i = 1; i < xNames.length; ++i)
                    extraRow.push(xAxisDimValue);

                _.each(xNames, function (xName) {
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
            _.each(xAxis, function (xAxisSpec) {
                if (xAxisSpec.calculate)
                    formatFunctions[noDimensions + i] = xAxisSpec.calculate;
                noDimensions += 1;
            });
        }

        _.each(data, function (row, i) {

	    var unmodifiedYaxis = _.take(row.values, yAxis.length);
            var values = _.map(row.values, function(e) { return cloneObj(e); });

            var foundSubtotal = false;

            _.each(yAxis, function (e, i) {
                if (reportState.useExpandCollapse && lastDimValues[i].displayValue == values[i].displayValue && row.type == "row")
                    values[i].displayValue = "";

                if (row.type == "subtotal" && values[i].displayValue == "" && !foundSubtotal) {
                    values[i].displayValue = "Sub total";
                    foundSubtotal = true;
                }
            });

            dataTableHTML += reportInterface.rowToHTML(values, row.type, formatFunctions, yAxis, row.values);

            lastDimValues = unmodifiedYaxis;
        });

        dataTable.html(dataTableHTML);
    };

    this.addExpandCollapseHeaders = function(domId)
    {
        _.each(reportState.dimensionsY, function (e, i) {

            var noExpandedCells = $(format("img.expandDimension.{0}", e)).length;
            var noCollapsedCells = $(format("img.collapseDimension.{0}", e)).length;

            var header = $(format("#{0} tr.header td:eq({1})", domId, i));

            if (noExpandedCells > 0)
                header.html(header.html() + "&nbsp;<img class='expandAll' src='images/expand.png'>");
            else if (noCollapsedCells > 0)
                header.html(header.html() + "&nbsp;<img class='collapseAll' src='images/collapse.png'>");
        });

        this.hookupExpandCollapseAll(domId);
    };

    this.hookupExpandCollapse = function (domId)
    {
        $(format("#{0} .expandDimension", domId)).click(function () {
            var td = $(this).closest("td");
            var dimId = reportState.dimensionsY[td[0].cellIndex];

            var expandValue = $(this).data("expandcollapse");

            if (dimId in reportState.expandedCells)
                reportState.expandedCells[dimId].push(expandValue);
            else
                reportState.expandedCells[dimId] = [expandValue];

            // we don't need data-expandcollapse as we draw anyway
            $(this).replaceWith("<img src='images/collapse.png' class='collapseDimension'/>");

            reportState.drawNewData();
        });

        $(format("#{0} .collapseDimension", domId)).click(function () {
            var td = $(this).closest("td");
            var dimId = reportState.dimensionsY[td[0].cellIndex];

	    // FIXME: we need to use sortValue!
            var value = td.text();

	    // FIXME: maybe get the sort value instead of the display value as td.text() is

            // collapse multiple
            // we have encoded the parent values in the collapse img tag
            // so we need to remove these as well
            var cells = _.map($(format("img.collapseDimension[data-expandcollapse*='{0}']", dim + ':' + value)), function (e) { return $(e).data('expandcollapse'); });

            _.each(reportState.expandedCells, function (tempValues, expandedDim) {
                _.each(cells, function (cell) {
                    reportState.expandedCells[expandedDim] = _.without(reportState.expandedCells[expandedDim], cell);
                    if (reportState.expandedCells[expandedDim].length == 0) {
                        delete reportState.expandedCells[expandedDim];
                        return false; // break
                    }
                });
            });

            // we don't need data-expandcollapse as we draw anyway
            $(this).replaceWith("<img src='images/expand.png' class='expandDimension'/>");

            reportState.drawNewData();
        });
    };

    this.hookupExpandCollapseAll = function (domId) 
    {
        $(format("#{0} img.expandAll", domId)).unbind().click(function (e) {
            var td = $(this).closest("td");
            var dimId = reportState.dimensionsY[td[0].cellIndex];

            var cellsToExpand = $(format("img.expandDimension.{0}", dimId));

            _.each(cellsToExpand, function (e, i) {
                var expandValue = $(e).data("expandcollapse");

                if (reportState.expandedCells[dimId] != null)
                    reportState.expandedCells[dimId].push(expandValue);
                else
                    reportState.expandedCells[dimId] = [expandValue];

                // we don't need data-expandcollapse as we draw anyway
                $(e).replaceWith("<img src='images/collapse.png' class='collapseDimension'/>");
            });

            reportState.drawNewData();
        });

        $(format("#{0} img.collapseAll", domId)).unbind().click(function (e) {
            var td = $(this).closest("td");
            var dimId = reportState.dimensionsY[td[0].cellIndex];

            var cellsToCollapse = $(format("img.collapseDimension.{0}", dimId));

            _.each(cellsToCollapse, function (e, i) {

                var td = $(e).closest("td");
                var value = td.text();

		// FIXME: maybe get the sort value instead of the display value as td.text() is

                // collapse multiple
                // we have encoded the parent values in the collapse img tag
                // so we need to remove these as well
                var cells = _.map($(format("img.collapseDimension[data-expandcollapse*='{0}']", dimId + ':' + value)), function (e2) { return $(e2).data('expandcollapse'); });

                _.each(reportState.expandedCells, function (tempValues, expandedDim) {
                    _.each(cells, function (cell) {
                        reportState.expandedCells[expandedDim] = _.without(reportState.expandedCells[expandedDim], cell);
                        if (reportState.expandedCells[expandedDim].length == 0) {
                            delete reportState.expandedCells[expandedDim];
                            return false; // break
                        }
                    });
                });

                // we don't need data-expandcollapse as we draw anyway
                $(e).replaceWith("<img src='images/expand.png' class='expandDimension'/>");
            });

            reportState.drawNewData();
        });
    };

    this.addSplits = function() 
    {
        for (var i = 0; i < arguments.length; ++i) {
            this.addSplit(arguments[i]);
        }
    };

    this.addSplit = function (colIndex) 
    {
        $(format("table.simple td:nth-child({0})", colIndex)).css("border-right", "1.5px solid #ccc");
    };

    this.rowToHTML = function(values, rowType, formatFunctions, yAxis, startValues) 
    {
        var valuesHTML = "";

        _.each(values, function (e, i) {

            var dimValue = e.displayValue;

	    // this is yAxis length - 1 because we can't expand the last dim anyway
            if (reportState.useExpandCollapse && i < (yAxis.length - 1) && dimValue != '')
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
                        valuesHTML += format("<td><img src='images/collapse.png' data-expandcollapse='{0}' class='collapseDimension {2}' />{1}</td>", lookupKey, dimValue, dimId);
                        return;
                    }
                }

                valuesHTML += format("<td><img src='images/expand.png' data-expandcollapse='{0}' class='expandDimension {2}' />{1}</td>", lookupKey, dimValue, dimId);
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
    function headerRowToHTML(values, top) 
    {
        var valuesHTML = "";

        var lastValue = "æøå";
        var valuesInARow = 1;
        var waitingToWrite = "";

        _.each(values, function (e, i) {

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
