
//takes json data and create data grid
var eventList = { "input": "input", "select": "change" };

(function ($) {

    $.fn.renderDataGrid = function (settings, jsondata, saveRecords) {
        //TODO: gridSettings
        var id = $(this).attr("id");
        $("body").data(id, settings);
        $(this).addClass('dg_container');
        //remove child content before rendering
        $(this).empty();

        if (settings && jsondata == null)
            renderGridWithPagination($(this), settings);
        else {
            settings.enablePagination = false;
            _render($(this), settings, jsondata); //function (container, settings, jsondata)            
            if (saveRecords || settings.filters) {
                $('div').data(getCustomCssClass($(this), 'hdn_data_temp'), JSON.stringify(jsondata));
            }
        }
        return this;
    };

}(jQuery));

var renderGridTable = function (container, records, settings) {
    var table = getHtmlElement('table', getCustomCssClass(container, 'csoft_grid'), getCustomElementId(container, 'csoft_grid'), null);
    //table.addClass('scroll');
    if (settings.gridCssClass) {
        table.addClass(settings.gridCssClass);
    }
    var thead = getHtmlElement('thead', null, null, null);
    if (settings.filters) {
        var filter = renderFilter(settings, container, records);
        thead.append(filter);
    }

    thead.append(getDataGridHeaderRow(container, settings.columns));
    table.append(thead);
    renderTableContent(table, records, settings, container);
    container.prepend(table);
    //display no record to display message if recordslength is 0
    if (records.length == 0 && settings.showNoRecordMsg) {
        var div = getHtmlElement('div', 'no-records', null, null);
        var msg = 'No records to display.'
        if (settings.noRecordMsg)
            msg = settings.noRecordMsg;
        div.text(msg);
        container.append(div);
    }

};

var renderTableContent = function (table, records, settings, container) {

    var rowFilter = '.' + getCustomCssClass(container, 'header');
    if (settings.filters) {
        rowFilter += ', .filter-row, .filter-reset-row';
    }

    table.find('tr').not(rowFilter).remove();
    $.each(records, function (i, record) {
        var row = getDataGridRow(record, settings);
        table.append(row);
    });
};

var getDataGridRow = function (rowData, settings) {
    var row = getHtmlElement('tr', null, null, null);
    $.each(settings.columns, function (i, column) {
        var td = getHtmlElement('td', column.cssClass, column.id, null);
        if (column.attributes) {
            $.each(column.attributes, function (key, attributeValue) {
                /*first part will be attribute,second parti will be value*/
                td.attr(key, attributeValue);
            });
        }
        if (column.colType == 'Action') {

            var action = getHtmlElement('a', column.cssClass, column.id, null);
            if (column.type) {
                if (column.type != 'anchor') {
                    action = getHtmlElement(column.type, column.cssClass, column.id, null);
                    if (column.title)
                        action.attr('title', column.title);
                }
            }
            if (column.actionName) {
                action.text(column.actionName);
            }
            td.append(action);
            bindEvent("click", td, column.callBack, { 'settings': settings });
        } else {
            if (column.formatter) td.text(column.formatter(rowData[column.dataField]));
            else td.text(rowData[column.dataField]);
        }

        row.append(td);
    });

    if (settings.actionColumn) {

    }

    bindEvent("click", row, rowSelectEventCallBack, { 'settings': settings });
    return row;

}
var getDataGridHeaderRow = function (container, columns) {
    var row = getHtmlElement('tr', null, null, null);
    row.addClass(getCustomCssClass(container, 'header'));
    row.addClass('header');
    //var total = Object.keys(columns).length;
    $.each(columns, function (i, column) {
        var th = getHtmlElement('th', column.cssClass, column.id, null);
        if (column.attributes) {
            $.each(column.attributes, function (key, val) {
                /*first part will be attribute,second parti will be value*/
                th.attr(key, val);
            });
        }
        th.text(column.displayName);
        row.append(th);
    });
    row.find('th:first').not('hidden').addClass('first-column');
    row.find('th:last').not('hidden').addClass('last-column');
    return row;
}

//returns html element with class and id
var getHtmlElement = function (element, cssClass, id, type) {
    var _element = $(document.createElement(element));
    if (id) {
        _element.attr('id', id);
    }
    if (cssClass) {
        _element.addClass(cssClass);
    }

    if (type) {
        _element.attr('type', type);
    }

    return _element;
}

//removes css conflict
var getCustomCssClass = function (container, cssClass) {
    var id = container.closest('.dg_container').attr('id');
    return id + '_' + cssClass;
}

//removes css conflict
var getCustomElementId = function (container, suffix) {
    var id = container.closest('.dg_container').attr('id');
    return id + '_' + suffix;
}

var _render = function (container, settings, jsondata) {
    renderGridTable(container, jsondata, settings);
};

/********************** Event Section Start ***************************/
//bind event to control
var bindEvent = function (eventList, control, callBack) {
    $(control).on(eventList, callBack);
};

//bind event to control with callback data
var bindEvent = function (eventList, control, callBack, data) {
    $(control).on(eventList, data, callBack);
};

var rowSelectEventCallBack = function (event) {
    var settings = event.data.settings;
    $(this).parent().find('.active').first().removeClass('active');
    $(this).addClass('active');
    if (settings.rowSelectCallBack) {
        settings.rowSelectCallBack($(this));
    }
}

/********************** Event Section End ***************************/


/****************** Data Filter Start **********************/
var bindFilterEvent = function (settings, container, control, e, ft) {

    bindEvent(e, control, function (event) {
        var data = event.data;
        //var container = data.container;
        var hdnRecords = $('div').data(getCustomCssClass(container, 'hdn_data_temp'));
        console.log('Recoreds' + hdnRecords);
        var jsonObjects = $.parseJSON(hdnRecords);
        var _settings = settings;
        var filterText = $(this).val().trim();
        var result = filterData(jsonObjects, filterText, ft);
        var currentFilterId = $(this).attr('id');
        //find all filter value
        $.each(settings.filters, function (i, f) {
            filterText = null;
            var filterId = getCustomElementId(container, f.dataField + '_filter');
            if (filterId != currentFilterId)
                filterText = $('#' + filterId).val().trim();
            if (filterText)
                result = filterData(result, filterText, f.dataField);
        });

        //table, records, settings, container
        var table = $(this).closest('table');

        renderTableContent(table, result, _settings, container);
    });
}


var renderFilter = function (settings, container, data) {
    var rArray = [];
    var table = getHtmlElement('table', getCustomCssClass(container, 'csoft_filter'), null, null);
    var row = getHtmlElement('tr', null, null, null);
    var resetRow = row.clone();
    resetRow.addClass('filter-reset-row');
    row.addClass('filter-row');
    $.each(settings.columns, function (i, column) {
        var td = getHtmlElement('td', column.cssClass, column.id, null);
        $.each(settings.filters, function (i, f) {
            var filterCtrl = null;
            if (f['dataField'] == column.dataField) {
                if (f.type == 'select') {
                    filterCtrl = getHtmlElement('select', f.cssClass, getCustomElementId(container, f.dataField + '_filter'), null);
                    filterCtrl.append(getHtmlElement('option', null, getCustomElementId(container, f.dataField + '_option'), null));
                    var arrData = [];
                    $.each(data, function (i, c) {
                        if (c)
                            arrData.push(c[column.dataField]);
                    });
                    $.each($.unique(arrData.sort()), function (i, c) {
                        var option = getHtmlElement('option', null, getCustomElementId(container, f.dataField + '_option'), null);
                        option.text(c);
                        filterCtrl.append(option);
                    });

                } else {
                    filterCtrl = getHtmlElement(f.type, f.cssClass, getCustomElementId(container, f.dataField + '_filter'), null);
                }

                var ft = f['dataField'];
                var e = eventList[f['type']];
                bindFilterEvent(settings, container, filterCtrl, e, ft);
                td.append(filterCtrl);
            }
        });

        row.append(td);
    });
    //bind reset button
    console.log(settings);
    var resetButton = getHtmlElement("input", settings.filterReset.cssClass, getCustomElementId(container, 'filter_reset'), 'button');
    bindEvent("click", resetButton, function () {
        $.each(settings.filters, function (i, f) {
            $('#' + getCustomElementId(container, f.dataField + '_filter')).val('');
            ctrl = $('#' + getCustomElementId(container, f.dataField + '_filter'));
        });
        //table, records, settings, container
        var hdnRecords = $('div').data(getCustomCssClass(container, 'hdn_data_temp'));
        console.log('Recoreds' + hdnRecords);
        var jsonObjects = $.parseJSON(hdnRecords);
        var table = $(this).closest('table');
        renderTableContent(table, jsonObjects, settings, container);
    });

    resetButton.val(settings.filterReset.text);
    var td = getHtmlElement('td', settings.filterReset.tdCssClass, null, null);
    td.append(resetButton);
    resetRow.append(td);
    resetRow.addClass(settings.filterReset.rowCssClass);
    resetRow.find('td:first').attr('colspan', row.find('td').length);
    rArray.push(resetRow);
    rArray.push(row);
    return rArray;
}



var filterData = function (arr, filterText, dataField) {
    return jQuery.grep(arr, function (n, i) {
        if (n[dataField].substring(0, filterText.length).toUpperCase() == filterText.toUpperCase())
            return true;
        else
            return false;
    });
}
/****************** Data Filter End **********************/

/****************** Grid Pagination Start ******************/

var renderGridWithPagination = function (parentContainer, settings, param) {
    render(1, parentContainer, settings);//pass begain index
    if (settings.enablePagination) {
        var pagination_container = getHtmlElement('div', getCustomCssClass(parentContainer, 'pagination-container') + ' pgn_wrapper row', null);
        parentContainer.append(pagination_container);

        var grd_hdn_total_records = getHtmlElement('input', null, getCustomElementId(parentContainer, 'grd_hdn_total_records'));
        grd_hdn_total_records.attr("type", "hidden");
        var grd_hdn_page_size = getHtmlElement('input', null, getCustomElementId(parentContainer, 'grd_hdn_page_size'));
        grd_hdn_page_size.attr("type", "hidden");
        parentContainer.prepend(grd_hdn_total_records);
        parentContainer.prepend(grd_hdn_page_size);
    }


}
//pagination component
var createPagination = function (currentindex, parentContainer, settings) {
    var col2 = parentContainer.find('.grd-pgn-col2').first();
    col2.empty();
    var col3 = parentContainer.find('.grd-pgn-col3').first();
    col3.empty();
    var inputGrp = getHtmlElement('div', 'input-group', null);
    var span = getHtmlElement('span', 'input-group-addon', null);
    var arrowRightIco = getHtmlElement('i', 'glyphicon glyphicon-arrow-right', null);

    var goToPageInput = getHtmlElement("input", 'form-control small-input', null);
    goToPageInput.attr('type', 'input');
    goToPageInput.attr('title', 'Go to page');
    bindEvent("keydown", goToPageInput, goToPageEvent, { 'parentContainer': parentContainer, 'settings': settings });
    span.attr("title", "Go to page");
    bindEvent("click", span, goToPageEvent, { 'parentContainer': parentContainer, 'settings': settings });
    inputGrp.append(span);
    span.append(arrowRightIco);
    inputGrp.append(goToPageInput);
    if (!settings.hidePageInput)
        col2.append(inputGrp);


    //second button
    var thListIcon = getHtmlElement('i', 'glyphicon glyphicon-th-list', null);
    var rowPerPageInput = getHtmlElement("input", 'form-control small-input', null);
    bindEvent("keydown", rowPerPageInput, setPageSize, { 'parentContainer': parentContainer, 'settings': settings });

    var span2 = getHtmlElement('span', 'input-group-addon', null);
    span2.attr("title", "Rows per page")
    span2.append(thListIcon);
    bindEvent("click", span2, setPageSize, { 'parentContainer': parentContainer, 'settings': settings });

    var inputGrp2 = getHtmlElement('div', 'input-group', null);
    inputGrp2.append(span2);
    inputGrp2.append(rowPerPageInput);
    if (!settings.hidePagegSizeInput)
        col3.append(inputGrp2);


    var grd_hdn_current_index = getHtmlElement('input', null, getCustomElementId(parentContainer, 'grd_hdn_current_index'));
    grd_hdn_current_index.attr("type", "hidden");
    grd_hdn_current_index.val(currentindex);
    parentContainer.prepend(grd_hdn_current_index);
    renderLi(currentindex, parentContainer, settings);
};

var createPaginationComponents = function (parentContainer, settings) {

    var container = $('.' + getCustomCssClass(parentContainer, 'pagination-container'));
    container.empty();
    var ul = getHtmlElement('ul', 'pagination', null);
    var col1 = getHtmlElement('div', 'grd-pgn-col1', null);
    var col2 = getHtmlElement('div', 'grd-pgn-col2', null);
    var col3 = getHtmlElement('div', 'grd-pgn-col3', null);
    var col4 = getHtmlElement('div', 'grd-pgn-col4', null);

    //attach child
    col1.append(ul);


    //rows info section
    var rowsInfo = getHtmlElement('div', 'rows_info', null);
    //rowsInfo.text('61-70 of 200 records (p.7/20)');
    col4.append(rowsInfo);

    container.append(col1);
    container.append(col2);
    container.append(col3);
    container.append(col4);

};

//returns rows info 
var getRowsInfo = function (totalRecords, pageSize, currentIndex, beginIndex, parentContainer) {
    var lastIndex = getLastIndex(parentContainer);
    var lower = ((currentIndex - 1) * pageSize) + 1;
    var upper = '';

    if ((currentIndex * pageSize) < totalRecords)
        upper = currentIndex * pageSize;
    else {
        upper = totalRecords;
    }

    var text = lower + '-' + upper + ' of ' + totalRecords + ' records (p.' + currentIndex + '/' + lastIndex + ')';
    return text;
};


var pageIndexClickCallBack = function (event) {
    var parentContainer = event.data.parentContainer;
    var settings = event.data.settings;
    switch ($(this).attr("id")) {
        case "grd_next_page": {
            var index = $(this).parent().find(".active").first().children().first().text();
            render(parseInt(parseInt(index) + 1), parentContainer, settings);
            return;
        }
        case "grd_prev_page": {
            var index = $(this).parent().find(".active").first().children().first().text();
            render(parseInt(parseInt(index) - 1), parentContainer, settings);
            break;
        }
        case "grd_first_page": {
            render(1, parentContainer, settings);
            break;
        }
        case "grd_last_page": {
            render(getLastIndex(parentContainer), parentContainer, settings);
            break;
        }
        default: {
            var index = $(this).children().first().text();
            render(index, parentContainer, settings);
        }
    }
};



var renderLi = function (selectedindex, parentContainer, settings) {

    var bar = $('.dg_container>.' + getCustomCssClass(parentContainer, 'pagination-container') + ' .pagination');
    //remove all child element
    bar.empty();

    var grdPaginationTotalPage = 5;
    var prePage = getHtmlElement("li", null, 'grd_prev_page').append(getHtmlElement("a", null, null).text('←').attr("href", "javascript:void(0);"));
    var nextPage = getHtmlElement("li", null, 'grd_next_page').append(getHtmlElement("a", null, null).text('→').attr("href", "javascript:void(0);"));
    var firstPage = getHtmlElement("li", null, 'grd_first_page').append(getHtmlElement("a", null, null).html('&laquo').attr("href", "javascript:void(0);"));
    var lastPage = getHtmlElement("li", null, 'grd_last_page').append(getHtmlElement("a", null, null).html('&raquo').attr("href", "javascript:void(0);"));
    var beginIndex = getPaginationBeginIndex(selectedindex - 1, grdPaginationTotalPage);
    var totalRecords = $('#' + getCustomElementId(parentContainer, 'grd_hdn_total_records')).val();
    var pageSize = $('#' + getCustomElementId(parentContainer, 'grd_hdn_page_size')).val();
    console.log("Total rec: " + totalRecords);
    console.log(pageSize);

    //bind event
    bindEvent("click", nextPage, pageIndexClickCallBack, { 'parentContainer': parentContainer, 'settings': settings });
    bindEvent("click", prePage, pageIndexClickCallBack, { 'parentContainer': parentContainer, 'settings': settings });
    bindEvent("click", firstPage, pageIndexClickCallBack, { 'parentContainer': parentContainer, 'settings': settings });
    bindEvent("click", lastPage, pageIndexClickCallBack, { 'parentContainer': parentContainer, 'settings': settings });

    console.log(getRowsInfo(totalRecords, pageSize, selectedindex, beginIndex, parentContainer));
    bar.closest('.row').children().last('div').first('div').text(getRowsInfo(totalRecords, pageSize, selectedindex, beginIndex, parentContainer));

    var limit = parseInt(grdPaginationTotalPage) + parseInt(beginIndex);
    var lastIndex = getLastIndex(parentContainer);

    if (limit > lastIndex)
        limit = lastIndex + 1; //i<limit so increase 1 here
    var temp = getHtmlElement("temp", null, null);
    for (i = beginIndex; i < limit; i++) {
        var li = getHtmlElement("li", null, null);
        var anTag = getHtmlElement("a", null, null);
        anTag.attr("href", 'javascript:void(0);');
        anTag.text(i);
        if (i == selectedindex)
            li.addClass("active");
        li.append(anTag);
        temp.append(li)
        bindEvent("click", li, pageIndexClickCallBack, { 'parentContainer': parentContainer, 'settings': settings });
    }
    var li = temp.contents();
    if (selectedindex > grdPaginationTotalPage) {
        bar.first("li").prepend((firstPage));
        bar.first("li").append(prePage);
    }

    if ((pageSize * (beginIndex + grdPaginationTotalPage - 1)) < totalRecords) {
        bar.append(lastPage);
        bar.children().last().before(li);
        bar.children().last().before(nextPage);
    }
    else {
        if (selectedindex > grdPaginationTotalPage)
            bar.children().last().after(li);
        else
            bar.append(li);
    }

};

//returns begin index for pagination bar
var getPaginationBeginIndex = function (selectedindex, grdPaginationTotalPage) {
    var a = parseInt(selectedindex / grdPaginationTotalPage);
    return (a * grdPaginationTotalPage + 1);
    var remainder = grdPaginationTotalPage % selectedindex;
};

var getLastIndex = function (parentContainer) {
    var totalRecords = $('#' + getCustomElementId(parentContainer, 'grd_hdn_total_records')).val();
    var pageSize = $('#' + getCustomElementId(parentContainer, 'grd_hdn_page_size')).val();
    var lastIndex;
    if (totalRecords % pageSize == 0)
        lastIndex = parseInt(totalRecords / pageSize);
    else
        lastIndex = parseInt(totalRecords / pageSize) + 1;
    return lastIndex;
};

function _getData(currentindex, pagesize, settings) {
    var dfd = new jQuery.Deferred();
    //var params = { CurrentPageIndex: currentindex, PageSize: pagesize, SearchData: searchParam };
    // var reqData = "{'reqData':'" + JSON.stringify(params) + "'}";
    settings.searchParam.CurrentPageIndex = currentindex;
    settings.searchParam.PageSize = pagesize;
    console.log(settings);
    $.ajax({
        type: "POST",
        url: settings.url,
        data: JSON.stringify(settings.searchParam),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (grdData) {
            if (settings.dataLoadedCallBack)
                settings.dataLoadedCallBack();
            dfd.resolve(grdData);
        }
        , failure: function () {
            alert('failed');
        }
    });
    // Return the Promise so caller can't change the Deferred
    return dfd.promise();
}

var render = function (index, parentContainer, settings) {
    var pageSize = 5;
    if (settings.searchParam.PageSize)
        pageSize = settings.searchParam.PageSize;
    var _storePageSize = $('#' + getCustomElementId(parentContainer, 'grd_hdn_page_size')).val();
    if (_storePageSize)
        pageSize = _storePageSize;
    //if pagination is false set page size = 0 and check this value in controller to take all records
    settings.searchParam.IsEnabled = settings.enablePagination;
    // Attach a done, fail, and progress handler for the asyncEvent
    $.when(_getData(index, pageSize, settings)).then(
      function (data) {
          $('.grd_data_table').empty();
          //set total records on hidden field
          var returnedData = data;//data will return this value
          var totalRecords = returnedData.totalRecords;
          $('#' + getCustomElementId(parentContainer, 'grd_hdn_total_records')).val(totalRecords);
          $('#' + getCustomElementId(parentContainer, 'grd_hdn_page_size')).val(pageSize);
          parentContainer.find('table').remove();
          _render(parentContainer, settings, returnedData.data);
          $('div').data(getCustomCssClass(parentContainer, 'hdn_data_temp'), JSON.stringify(returnedData.data))
          if (settings.enablePagination) {
              createPaginationComponents(parentContainer, settings);
              createPagination(index, parentContainer, settings);
          }

      },
      function (status) {
          //alert(status + ", you fail this time");
      },
      function (status) {

      }
    );
};

//bind event to go to input
var goToPageEvent = function (e) {
    var parentContainer = e.data.parentContainer;
    var settings = e.data.settings;
    if (e.keyCode == 13) {
        var index = $(this).val();
        if (parseInt(index) <= getLastIndex(parentContainer)) {
            render(index, parentContainer, settings);
            $(this).val("").focus();
        }
        else
            $(this).focus();
    }
    else if (e.type == "click") {
        var index = $(this).parent().find('input').val();
        if (parseInt(index) <= getLastIndex(parentContainer)) {
            render(index, parentContainer, settings);
            $(this).parent().find('input').val('').focus();
        }
        else
            $(this).parent().find('input').focus();
    }
}

var setPageSize = function (e) {

    var parentContainer = e.data.parentContainer;
    var settings = e.data.settings;
    if (e.keyCode == 13 || e.type == "click") {
        var control = '';
        if (e.type == "click")
            control = $(this).parent().find('input');
        else
            control = $(this);
        var pageSize = control.val();
        var totalRecords = $('#' + getCustomElementId(parentContainer, 'grd_hdn_total_records')).val();
        if (parseInt(pageSize) <= totalRecords && parseInt(pageSize) > 0)
            $('#' + getCustomElementId(parentContainer, 'grd_hdn_page_size')).val(pageSize);
        else if (parseInt(pageSize) > totalRecords) {
            $('#' + getCustomElementId(parentContainer, 'grd_hdn_page_size')).val(totalRecords);
        }
        render(1, parentContainer, settings);
    }
};

/****************** Grid Pagination END ******************/
