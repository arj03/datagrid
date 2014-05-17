This is a work in progress, documentation will come. For now the
examples directory is your best source.

Requirements:
 - underscore.js
 - jQuery 
 - font awesome

Datagrid is a Javascript library for displaying data in tabular
form. It was written out of frustration with the DevExpress Pivot Grid
control but is in no way tied to data from an OLAP cube. It can
display data from an SQL Server, Olap cube or just plain Javascript
data equally well. Datagrid allows collapse / expand for very large
data sets, local sorting, helper functions for working with data and
localization support.

The datagrid library is split into two seperate parts: the report
builder and the report interface. The purpose of report builder is to
provide helper functions for local sorting, merge, splicing and
combining data from multiple sources. While report interface deals
with actually drawing the data and adding the expand / collapse and
sorting functionality to the UI if needed.

reportBuilder:
 - sortData
 - sortExpandedData

 - generateDataWithSubTotals
 - generateDataWithGrandTotals
 - generateDataWithSubAndGrandTotals
 - generateData

 - localizedHeaders

 - mergeData
 - getAllYAxisValues

 - combineData

 - spliceColumn

reportInterface:
 - addSortHeaders
 - addExpandCollapseAll (auto calls hookupExpandCollapseAll)

 - drawTable

 - hookupExpandCollapseAll

 - addSplits
 - addSplit

