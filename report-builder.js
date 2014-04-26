var reportBuilder = new function() {

    // public 

    // this is sorting of simple, non-expanded data
    this.sortData = function(data, rowIndex, direction) 
    {
        var sortedList = [];
        var sortedData = [];

        var grandTotal = {};

        _.each(data, function(e) {
            if (e.type == 'grandtotal') {
                grandTotal = e;
                return;
            }

            var val = e.values[rowIndex].sortValue;
            var sortIndex = _.sortedIndex(sortedList, val);

            sortedList.splice(sortIndex, 0, val);
            sortedData.splice(sortIndex, 0, e);
        });

        if (direction == "up")
            sortedData = sortedData.reverse();

        if (grandTotal)
            sortedData.push(grandTotal);

        return sortedData;
    };

    // this can sort expanded data, making sure to sort each independently
    this.sortExpandedData = function(data, dimensionsY, rowIndex, direction) 
    {
        // transforms data into a tree, were the parent is the sub total of the leaves

        var treeLastData = [];

        var currentLevelRows = [];
        var currentLevelIndex = 0;

        var state = "";
        var tempState = []; // stack of unfinished children

        _.each(data, function(row) {

	    var e = cloneObj(row);

            var dim = dimensionsY[currentLevelIndex];

            if (reportState.expandedCells[dim] && _.any(reportState.expandedCells[dim], function(expandedValue) { return expandedValue.indexOf(e.values[currentLevelIndex].displayValue) != -1; })) // start of sub total
            {
                if (state != "start") {
                    _.each(currentLevelRows, function(e2) {
                        treeLastData.push(e2);
                    });
                } else {
                    tempState.push(currentLevelRows);
                }

                currentLevelRows = [];
                currentLevelRows.push(e);
                currentLevelIndex++;

                state = "start";
            }
            else if (e.type == 'subtotal') // this ends a sub total
            {
                e.child = currentLevelRows;

                if (tempState.length > 0)
                    currentLevelRows = tempState.pop();
                else
                    currentLevelRows = [];

                currentLevelRows.push(e);
                currentLevelIndex--;

                state = "end";
            }
            else if (e.type == 'grandtotal') // mother of all
            {
                _.each(currentLevelRows, function(e2) {
                    treeLastData.push(e2);
                });

                e.child = treeLastData;
                treeLastData = e;
            }
            else
                currentLevelRows.push(e);
        });

        function sortValues(el, level) 
	{
            var sortedList = [];
            var sortedData = [];

            _.each(el.child, function(e) {
                var val = e.values[rowIndex].sortValue;
                var sortIndex = _.sortedIndex(sortedList, val);

                sortedList.splice(sortIndex, 0, val);
                sortedData.splice(sortIndex, 0, e);
            });

            if (direction == "up")
                sortedData = sortedData.reverse();

            if (level >= 0) {
                // Fix expand to be on top
                _.each(sortedData, function(e, i) {
                    if (e.values[level].displayValue != '') {
                        if (i != 0) {
                            sortedData[0].values[level] = cloneObj(e.values[level]);
                            e.values[level].displayValue = '';
                        }
                        return false; // break
                    }
		});
            }

            el.child = sortedData;
        }

        // sort each group of leaves
        // move the dim name up
        // flatten

        var level = 0;

        function traverseTreeSort(node) 
	{
            ++level;

            if (node.child != null) {
                _.each(node.child, function(child) {
                    traverseTreeSort(child);
                });
                sortValues(node, level - 2);
            }
            --level;
        }

        traverseTreeSort(treeLastData);

        var flattenedTree = [];

        function traverseTreeFlatten(node) 
	{
            if (node.type != "grandtotal" && node.type != "subtotal")
                flattenedTree.push(node);

            if (node.child != null)
                _.each(node.child, function(child) {
                    traverseTreeFlatten(child);
                });

            if (node.type == "grandtotal" || node.type == "subtotal")
                flattenedTree.push(node);
        }

        traverseTreeFlatten(treeLastData);

        return flattenedTree;
    };

    this.generateDataWithSubTotals = function(yAxis, xAxis, xAxisRestrictions) {
        var data = this.generateData(yAxis, xAxis, xAxisRestrictions);
        data.options = { subTotals: true, grandTotals: false };
        return data;
    };

    this.generateDataWithGrandTotals = function(yAxis, xAxis, xAxisRestrictions) {
        var data = this.generateData(yAxis, xAxis, xAxisRestrictions);
        data.options = { subTotals: false, grandTotals: true };
        return data;
    };

    this.generateDataWithSubAndGrandTotals = function(yAxis, xAxis, xAxisRestrictions) {
        var data = this.generateData(yAxis, xAxis, xAxisRestrictions);
        data.options = { subTotals: true, grandTotals: true };
        return data;
    };

    this.generateData = function(yAxis, xAxis, xAxisRestrictions) {
        var data = { yAxis: [], xAxis: { keyfigures: [], restrictions: [] }, options: {} };

        _.each(yAxis, function(e, i) {
            data.yAxis.push({ id: e.id, left: e.left, right: e.right, restrictions: e.restrictions });
        });

        _.each(xAxis, function(e, i) {
            data.xAxis.keyfigures.push(e.id);
        });

        _.each(xAxisRestrictions, function(e, i) {
            data.xAxis.restrictions.push(e);
        });

        return data;
    };

    this.localizedHeaders = function(yAxis, fullXAxis) {

        _.each(yAxis, function(e) {
            e.name = reportState.translateDimKF[e.id];
        });

        _.each(fullXAxis, function(e) {
            if (e.name == 'LY')
                e.name = reportState.translateDimKF[e.id] + " " + reportState.translate["LastYear"];
            else if (e.name == 'INDEX')
                e.name = reportState.translateDimKF[e.id] + " " + reportState.translate["Index"];
            else
                e.name = reportState.translateDimKF[e.id];
        });
    };

    // this is a way to merge multiple data sets into one, a use case
    // would be to get data for this year and last year, and to
    // combine these, maybe adding an index.
    //
    // might be a good idea to run insertMissingValues first to make
    // sure all data have the same number of rows
    //
    // allYaxisValues: a list of dimension values
    // combinedXAxis: a list of keyfigures with the following syntax {id: '', name: '', [dataref: array, dataindex: indexinarray], [datacalculate: function(row) { }] }
    //
    // returns a list of combined rows
    this.mergeData = function(allYaxisValues, combinedXAxis) {
        var calculatedResultSet = [];

        _.each(allYaxisValues, function(row, i) {

            var yAxisColumns = row.length;

            _.each(combinedXAxis, function(e) {
                if (e.datacalculate != null) {
                    var val = e.datacalculate(row, i);
                    row.push({ sortValue: val, displayValue: val });
                } else
                    row.push(e.dataref[i].values[yAxisColumns + e.dataindex]);
            });

            calculatedResultSet.push({ type: 'row', values: row });
        });

        return calculatedResultSet;
    };

    // extracts dimension values
    this.getYAxisValues = function(data, yAxis) 
    {
        return _.map(data, function(e) { return e.values.slice(0, yAxis.length); });
    };

    // extracts unique dimension values from multiple data results
    this.getAllYAxisValues = function(data, yAxis) 
    {
        var allYaxisValues = _.map(data[0], function(e) { return e.values.slice(0, yAxis.length); });

        _.each(data.slice(1), function(table, i) {
            var tableYAxisValues = _.map(table, function(e) { return e.values.slice(0, yAxis.length); });

            _.each(tableYAxisValues, function(e) {
                if (!_.find(allYaxisValues, function(e2) { return _.isEqual(e, e2); }))
                    allYaxisValues.push(e);
            });
        });

        // FIXME: maybe sort this

        return allYaxisValues;
    };

    // insert column at index in data
    // data must be an array of values
    this.spliceColumn = function(data, index, column)
    {
        _.each(data.rows, function(row, i) {
            row.values.splice(index, 0, column[i]);
        });
    };

    // combines multiple server results into one 
    //
    // data: a list of data from the server [[{values:[], type: ''}, ...], ...]
    // allXaxis: a list of keyfigure specifications [[{ id: '', name: '' }, ...], ...]
    //
    this.combineData = function(data, allXaxis, noDimensions) {

	var resultDimensions = {};
	var result = [];

        _.each(data, function(jsonData, jsonDataI) {
            var noKeyfigures = allXaxis[jsonDataI].length;

            _.each(jsonData, function(e, i) {

		var dimensions = e.values.slice(0, noDimensions);

                if (dimensions in resultDimensions)
		{
		    // append values to existing row
		    _.each(jsonData[i].values, function(val) {
			result[i].values.push(val);
		    });
		} 
		else
		{
		    result.push(cloneObj(jsonData[i]));
		}
	    });
        });

        // FIXME: maybe sort this by dimension

	return result;
    };
};
