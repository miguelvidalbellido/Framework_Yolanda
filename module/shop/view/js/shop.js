
function loadCars(total_prod = 0, items_page=4) {
    var checkFilter = JSON.parse(localStorage.getItem('filter')) || false;
    var checkFiltersHomeBrand = JSON.parse(localStorage.getItem('homeBranFilter')) || false;
    var checkFiltersHomeFuel = JSON.parse(localStorage.getItem('homeFuelFilter')) || false;
    var checkFiltersHomeBodywork = JSON.parse(localStorage.getItem('homeBodyworkFilter')) || false;
    var checkFiltersSearch = JSON.parse(localStorage.getItem('filterSearch')) || false;
    var checkFiltersHomeModel = JSON.parse(localStorage.getItem('homeModelFilter')) || false;
    var checkPreLikeLogin = localStorage.getItem('codCarPreLogin') || false;
    var checkPreAddLogin = localStorage.getItem('codCarPreAddToCart') || false;

    getGuestToken()
        .then(function(checkLastFilters) {
            // console.log(checkLastFilters);
            // console.log(JSON.parse(localStorage.getItem('filterSearch')));
            if(checkPreAddLogin != false){
                details_car(checkPreAddLogin);
                localStorage.removeItem('codCarPreAddToCart');
            }else if(checkPreLikeLogin != false){
                details_car(checkPreLikeLogin);
                likes(checkPreLikeLogin);
                localStorage.removeItem('codCarPreLogin');
            }else if(checkFiltersHomeModel != false){
                ajaxForSearch("module/shop/ctrl/ctrl_shop.php?op=filter", [checkFiltersHomeModel], total_prod, items_page);
                saveFiltersAppliedForShort([checkFiltersHomeModel]);
                // localStorage.removeItem('homeModelFilter');
            }else if(checkFiltersSearch != false){
                ajaxForSearch("module/shop/ctrl/ctrl_shop.php?op=filter", checkFiltersSearch, total_prod, items_page);
                saveFiltersAppliedForShort(checkFiltersSearch);
                // localStorage.removeItem('filterSearch');
            }else if(checkFiltersHomeBrand != false){
                // ajaxForSearch("module/shop/ctrl/ctrl_shop.php?op=filter", [checkFiltersHomeBrand]);
                ajaxForSearch("module/shop/ctrl/ctrl_shop.php?op=filter", checkFiltersHomeBrand, total_prod, items_page);
                saveFiltersAppliedForShort(checkFiltersHomeBrand);
                // localStorage.removeItem('homeBranFilter');
            }else if(checkFiltersHomeFuel != false){
                ajaxForSearch("module/shop/ctrl/ctrl_shop.php?op=filter", checkFiltersHomeFuel, total_prod, items_page);
                saveFiltersAppliedForShort(checkFiltersHomeFuel);
                // localStorage.removeItem('homeFuelFilter');
            }else if(checkFiltersHomeBodywork != false){
                ajaxForSearch("module/shop/ctrl/ctrl_shop.php?op=filter", checkFiltersHomeBodywork, total_prod, items_page);
                saveFiltersAppliedForShort(checkFiltersHomeBodywork);
                // localStorage.removeItem('homeBodyworkFilter');
            }else if(checkFilter != false){
                var filter = JSON.parse(localStorage.getItem('filter'));
                saveFiltersAppliedForShort(filter);
                saveFiltersAppliedForShort(checkFilter);
                console.log(filter);
                ajaxForSearch("module/shop/ctrl/ctrl_shop.php?op=filter", filter, total_prod, items_page);
                highlightFilter();
            }else if(checkLastFilters != false){
                ajaxForSearch("?module=shop&op=cars", undefined, total_prod, items_page);
                // loadPreviousSearches();
            }else{
                ajaxForSearch("?module=shop&op=cars", undefined, total_prod, items_page);
            }
            
            pagination();
            
        })
        .catch(function(error) {
            console.log(error);
        });
}

function getGuestToken(){
    return new Promise(function(resolve,reject){
    localStorage.removeItem('last_filters');
    var token = localStorage.getItem('token') || false;
    if(token == false){
        resolve("false");
        console.log("El usuario no esta registrado");
    }else{
        // console.log("Token - [OK]");
        
        if(token) {
            ajaxPromise("module/login/ctrl/ctrl_login.php?op=dataUser", 'POST', 'JSON', { 'token': token })
            .then(function (data) { 
                let username = data[0]['username'];
                ajaxPromise("module/shop/ctrl/ctrl_shop.php?op=seeLastFilters", 'POST', 'JSON', { 'token': username })
        .then(function(data) {
            if(data != "error"){
                var lastFilters = [];
                checkLastFilters = true;

                for(row in data){
                    let str = data[row].filters;
                    let arr = str.split(':');
                    let tmp = [];
                    for(i=0;i<arr.length; i++){
                        tmp = tmp.concat([arr[i].split(",")]);

                    }
                    tmp = [tmp];
                    lastFilters = lastFilters.concat(tmp);
                }
                localStorage.removeItem('last_filters');
                localStorage.setItem('last_filters', JSON.stringify(lastFilters));
            }
            resolve(checkLastFilters);
            
        }).catch(function() {
            console.log("error ajaxForSearch");
            resolve("false");
        });
            }).catch(function() {
                console.log("Error al cargar data del usuario");
            });
        }else{
            resolve("false");
        }
    }
    });
}

function ajaxForSearch(url,filter,total_prod = 0, items_page = 3){
    ajaxPromise(friendlyURL(url), 'POST', 'JSON', { 'filter': filter, 'total_prod': total_prod, 'items_page': items_page  })
    .then(function(data) {
        $('#list_cars1').empty();
        // console.log(data);
        if (data == "error") {
            $('<div></div>').appendTo('#list_cars1')
                .html(
                    '<div class="alert alert-danger d-flex align-items-center" role="alert">' +
                    '<i class="bi bi-exclamation-triangle-fill me-2 "></i>' +
                    '<div>' +
                    '¡No se han encontrado vehículos con los parámetros establecidos! ' +
                    '¡Sentimos las molestias! ' +
                    '</div>' +
                    '</div>'
                )
        } else {
        for (row in data) {
            $('<div></div>').attr('class', "row justify-content-center mt-1").attr({ 'id': data[row].cod_car }).appendTo('#list_cars1')
                .html(
                    "<div class='col-sm-9 col-md-9 border-top'>"+
                            "<div class='d-flex'>"+
                                "<div class='col-8 mr-3'>"+
                                    "<img class= 'img-fluid rounded d-block m-l-none' src='"+data[row].image+"' >"+
                                "</div>"+
                                "<div class='col-4'>"+
                                "<h2 class='fw-bold text-uppercase csstext-red'>"+ data[row].price +" €</h2>"+
                                "<h5 class='text-center fw-bold text-uppercase'>"+ data[row].brand +" "+data[row].model+" "+data[row].power+" cv "+data[row].doors+"p </h5>"+
                                    // "<p class='pt-4'> Marca: "+ data[row].brand+"</p>"+
                                    "<p class='text-center mt-4'>"+ data[row].province+"  |  "+ data[row].fuel+"</p>"+
                                    "<p class='text-center mt-4'>"+data[row].year+"  |  "+data[row].km+" km </p>"+
                                    "<p class='text-center mt-4 bg-light rounded'>"+ data[row].publication_date+"</p>"+
                                    // "<p class=''> Potencia (cv): "+ data[row].power+"</p>"+
                                "<button id='" + data[row].cod_car + "' class='more_info_car mt-3 button-86' role='button'>Ver más</button>"+
                                "<a id='like_button' value='"+data[row].cod_car+"'><i id='"+data[row].cod_car+"' class='bi bi-suit-heart-fill text-primary fa-lg'></i><a>"+
                                "</div>"+
                            "</div>"+
                    "</div>"
                )
        }
        localStorage.getItem('token') !== null ? loadLikes(localStorage.getItem('token')) : console.log("no hay token");
        }
        // mapBox_all(data);
    }).catch(function() {
        console.log("error ajaxForSearch");
        // window.location.href = "index.php?module=ctrl_exceptions&op=503&type=503&lugar=Type_Categories HOME";
    });
}

// ==================== PAGINATION ====================  //


function pagination(){

    var filters_applied = JSON.parse(localStorage.getItem('filters_applied')) || false;
    // console.log(filters_applied);
    url = filters_applied != false ? '?module=shop&op=count_cars_filter' :  '?module=shop&op=count_all_cars';
    sdata = filters_applied != false ? {'filter': filters_applied} : undefined;

    ajaxPromise(friendlyURL(url), 'POST', 'JSON', sdata)
        .then(function(data) {
            // console.log(data);
            var total_prod = data[0].cant_coches;

            // console.log(data[0].cant_coches);

            if (total_prod >= 4) {
                total_pages = Math.ceil(total_prod / 4);
            } else {
                total_pages = 1;
            }

            $('#show_paginator').bootpag({
                total: total_pages,
                page: localStorage.getItem('page') ? localStorage.getItem('page') : 1,
                maxVisible: total_pages
            }).on('page', function(event, num)
            {
                localStorage.setItem('page', num);
                // localStorage.removeItem('id_car');
                total_prod = 4 * (num - 1);
                if (total_prod == 0) {
                    localStorage.setItem('total_prod', 0)
                }
                loadCars(total_prod, 4);
                // $('html, body').animate({ scrollTop: $(".list__content") });
            });
        }).catch(function() {
            console.log('Fail pagination');
        });
}

$(document).ready(function() {
    // ajaxForSearch("?module=shop&op=cars", undefined, 0, 3);
    // pagination();
    loadCars();
})