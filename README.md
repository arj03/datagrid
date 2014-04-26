Requirements:
 - underscore.js
 - jQuery 

2 use cases:

 - rapport
   - start med en af generateData funktionerne
   - getAllYAxisValues
   - insertMissing?
   - drawMultiTable
   - hookupExpandCollapse
   - formatFooter

 - fixed report
   - start med en af generateData funktionerne
   - man henter data vha. parameterne og kalder clearTableAndFooter
   - localizedHeaders på data
   - getAllYAxisValues
   - insertMissing?
   - sætter draw op til: drawMultiTable + addsortheader
   - enten:
     - mergeData + draw
     - sortDataAndDraw (som nu er sortData + kald draw manuelt), 
     - drawData
   - formatFooter

mergedata erstatter insertmissing + drawmulti

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

