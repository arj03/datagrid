var reportState = new function () {

    // format: [{ type: "row|subtotal|grandtotal", values: [{ sortValue: "", displayValue: "", sortValueType: "string" }] ]
    this.serverData = [];

    // the function used to draw the server data
    this.drawData = null;

    // must be a function that can request data again and draw
    this.drawNewData = null;

    this.useExpandCollapse = true;

    // FIXME: document format and use, used to use dim, now uses dim id
    // this maps dimension ids to list of expanded cells
    this.expandedCells = {};

    // this is used when sorting and then expanding, to make sure that expanded data is shown in the same order
    this.sortRowIndex = -1;
    this.sortDirection = "";

    // [value1, value2, ...]
    this.dimensionsY = [];
    //this.dimensionsX = [];
    //this.keyfigures = [];

    // english term -> localized term
    this.translate = {};

    // dimension id or keyfigure id -> localized name
    this.translateDimKF = {};

    // the relative path where images resides
    this.imagePath = "images/";
};
