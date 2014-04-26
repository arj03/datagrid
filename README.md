This is a work in progress, documentation will come

Requirements:
 - underscore.js
 - jQuery 

Interface:

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

 reportInterace:

   - addSortHeaders
   - addExpandCollapseAll (auto calls hookupExpandCollapseAll)
   - hookupExpandCollapseAll

   - drawTable
   - hookupExpandCollapse

   - clearTableAndFooter
   - formatFooter  

   - addSplits
   - addSplit

