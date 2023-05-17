// BRANDS
const loadBrandSearch = () => {
    ajaxPromise(friendlyURL('?module=search&op=searchbrands'), 'POST', 'JSON')
        .then(function (data) {
            // console.log(data);
            $('<option>Marca</option>').attr('selected', true).attr('disabled', true).appendTo('#selectBrand')
            for (row in data){
                $('<option value="'+ data[row].description +'">'+ data[row].description+'</option>').appendTo('#selectBrand')
            }
        }).catch(function() {
            console.log("ERR: ajaxPromise Brands");
        });
}

const loadCategorySearch = (brand) => {
    $('#selectModel').empty();
    brand === undefined ? promiseLoadCategorySearchAll() : promiseLoadCategorySearchBrand(brand)
    
    function promiseLoadCategorySearchAll() {
        ajaxPromise(friendlyURL('?module=search&op=searchAllModel'), 'POST', 'JSON')
        .then(function(data) {
            // console.log(data);
            $('<option>Model</option>').attr('selected', true).attr('disabled', true).appendTo('#selectModel')
            for (row in data){
                $('<option value="'+ data[row].description +'">'+ data[row].description+'</option>').appendTo('#selectModel')
            }
        });
    }

    function promiseLoadCategorySearchBrand (brand) {
        ajaxPromise(friendlyURL('?module=search&op=searchModelsBrand'), 'POST', 'JSON', { 'brand': brand })
        .then(function(data) {
            // console.log(data);
            if (data == "error"){
            console.log("Error ");
            }else{
                $('<option>Model</option>').attr('selected', true).attr('disabled', true).appendTo('#selectModel')
                for (row in data){
                    $('<option value="'+ data[row].description +'">'+ data[row].description+'</option>').appendTo('#selectModel')
                }
            }
        });
    }
}

// BUSCADOR
function launchData(){
    loadBrandSearch();
    loadCategorySearch();

    $(document).on('change', '#selectBrand', function () {
        let brand = $(this).val();
        console.log(brand);
        brand === 0 ? loadCategorySearch() : loadCategorySearch(brand); 
    });
}

// AUTOCOMPLETE
function autocomplete() {

    $("#searchAutocomplete").on("keyup", function () {
        let sdata = [];
        sdata.push(["description_population", $(this).val()]);
        $('#selectBrand').val() != undefined ? sdata.push(["description_brand", $('#selectBrand').val()]) : console.log(false);
        $('#selectModel').val() != undefined ? sdata.push(["description_model", $('#selectModel').val()]) : console.log(false);
        // console.log(sdata);
        promiseLoadAutocomplete(sdata);
    })

    function promiseLoadAutocomplete(arraysdata){
        $('#populations').empty();
        ajaxPromise(friendlyURL('?module=search&op=searchDataAutocomplete'), 'POST', 'JSON', { 'arraysdata': arraysdata })
        .then(function(data) {
            console.log(data);
            for(row in data){
                $('<option></option>').attr('value', data[row].description_population).appendTo('#populations');
            }
        }).catch(function() {
            console.log("ERR: ajaxPromise autocomplete");
        });
    }
}

// SEARCH BUTTON
function buttonSearch(){
    $('#button_search').on('click', function () {
        // console.log('Click Boton');
        // console.log($('#selectBrand').val());
        localStorage.removeItem('filterSearch');
        var filterSearch = [];
        
        $('#selectBrand').val() != undefined ? filterSearch.push(["brand", $('#selectBrand').val()]) : console.log("false");
        $('#selectModel').val() != undefined ? filterSearch.push(["model", $('#selectModel').val()]) : console.log("false");
        $('#searchAutocomplete').val() !== "" ? filterSearch.push(["population", $('#searchAutocomplete').val()]) : console.log("false");

        // console.log(filterSearch);
        localStorage.setItem('filterSearch', JSON.stringify(filterSearch));
        window.location.href = '?module=shop';
    });
}

// LAUNCHER

const launcherSearch = () => {
    launchData();
    autocomplete();
    buttonSearch();
}

$(document).ready(function() {
    launcherSearch();
})