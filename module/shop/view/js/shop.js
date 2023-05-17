
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
                ajaxForSearch("?module=shop&op=filter", [checkFiltersHomeModel], total_prod, items_page);
                saveFiltersAppliedForShort([checkFiltersHomeModel]);
                // localStorage.removeItem('homeModelFilter');
            }else if(checkFiltersSearch != false){
                ajaxForSearch("?module=shop&op=filter", checkFiltersSearch, total_prod, items_page);
                saveFiltersAppliedForShort(checkFiltersSearch);
                // localStorage.removeItem('filterSearch');
            }else if(checkFiltersHomeBrand != false){
                // ajaxForSearch("module/shop/ctrl/ctrl_shop.php?op=filter", [checkFiltersHomeBrand]);
                ajaxForSearch("?module=shop&op=filter", checkFiltersHomeBrand, total_prod, items_page);
                saveFiltersAppliedForShort(checkFiltersHomeBrand);
                // localStorage.removeItem('homeBranFilter');
            }else if(checkFiltersHomeFuel != false){
                ajaxForSearch("?module=shop&op=filter", checkFiltersHomeFuel, total_prod, items_page);
                saveFiltersAppliedForShort(checkFiltersHomeFuel);
                // localStorage.removeItem('homeFuelFilter');
            }else if(checkFiltersHomeBodywork != false){
                ajaxForSearch("?module=shop&op=filter", checkFiltersHomeBodywork, total_prod, items_page);
                saveFiltersAppliedForShort(checkFiltersHomeBodywork);
                // localStorage.removeItem('homeBodyworkFilter');
            }else if(checkFilter != false){
                var filter = JSON.parse(localStorage.getItem('filter'));
                saveFiltersAppliedForShort(filter);
                // saveFiltersAppliedForShort(checkFilter);
                ajaxForSearch("?module=shop&op=filter", filter, total_prod, items_page);
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

function saveFiltersAppliedForShort(filtersApplied){
    localStorage.setItem('filters_applied', JSON.stringify(filtersApplied));
}

// ==================== FILTER BUTTON ==================== //

function filter_button(){

    // Almacenamos la selección del cliente en local storage
    $('#fuel').change(function() {
        localStorage.setItem('type_fuel', this.value);
    });
    $('#brand').change(function() {
        localStorage.setItem('brand_name', this.value);
    });
    $('#shifter').change(function() {
        localStorage.setItem('type_shifter', this.value);
    });
    $('#environmental_label').change(function() {
        localStorage.setItem('environmental_label', this.value);
    });

    // Al clickar el boton almacenaremos los filtros seleccionados en un array
    // para posteriormente trabajar sobre data en el servidor
    $(document).on('click', '.filter_button', function(){
        var filterWithToken = [];
        var token = [];
        var filter = [];

        if(localStorage.getItem('type_fuel')) {
            filter.push(['fuel', localStorage.getItem('type_fuel')])
        }
        if(localStorage.getItem('brand_name')) {
            filter.push(['brand', localStorage.getItem('brand_name')])
        }
        if(localStorage.getItem('type_shifter')) {
            filter.push(['type_shifter', localStorage.getItem('type_shifter')])
        }
        if(localStorage.getItem('environmental_label')) {
            filter.push(['environmental_label', localStorage.getItem('environmental_label')])
        }
        
        localStorage.setItem('filter', JSON.stringify(filter));
        saveFiltersAppliedForShort(filter);
        // Obtenemos el token y almacenamos en filterWithToken [[Token],[filtros]] --> [filtros] --> [[fuel,gasolina],[brand,bmw]]
        // Obtenemos el username almacenado en el token

        let token_usr = localStorage.getItem('token');

        $('#highlight_searchs').empty();
        if(token_usr) {
            ajaxPromise("module/login/ctrl/ctrl_login.php?op=dataUser", 'POST', 'JSON', { 'token': token_usr })
            .then(function (data) { 
                console.log(data);
                token = [data[0]['username']];
                filterWithToken = token.concat([filter]);
                $('#highlight_searchs').empty();
            highlightFilter();
            // ajaxForSearch("module/shop/ctrl/ctrl_shop.php?op=filters_token", filterWithToken);
            ajaxForSearch("module/shop/ctrl/ctrl_shop.php?op=filters_token", filterWithToken);
            saveFiltersAppliedForShort(filterWithToken[1]);
            pagination();
            }).catch(function() {
                console.log("Error al cargar data del usuario");
            });
        }else {
            $('#highlight_searchs').empty();
            highlightFilter();
            // console.log(filter);
            ajaxForSearch("?module=shop&op=filter", filter);
            pagination();
        }
    });

    remove_filters();
    
}

// ==================== SHORT (ORDER BY) ==================== //
function detectChangeShort(){
    $(document).on('change', '#order', function () {
        let short = $(this).val();
        console.log(short);


        let filtrosAplicados = JSON.parse(localStorage.getItem('filters_applied')); 
        filtrosAplicados === null ? filtrosAplicados = [["ORDER BY", short]] : filtrosAplicados.push(["ORDER BY", short]); 
        
        let filtrosOrder = filtrosAplicados;
        // console.log(filtrosOrder);

        filtrosAplicados != 0 ? appliOrderBy(filtrosOrder) : console.log(false);

        function appliOrderBy(filtros){
            ajaxForSearch("?module=shop&op=filter", filtros);
        }
    });
}

// CONTROL CLICKS //

function clicks() {
    $(document).on("click", ".more_info_car", function() {
        var cod_car = this.getAttribute('id');
        details_car(cod_car);
    });

    $(document).on("click", "#like_button", function() {
        let value = this.getAttribute('value');
        likes(value);
    });
}

// ==================== REMOVE FILTERS ==================== //

function remove_filters(){
    $(document).on('click', '.remove_button', function(){
        localStorage.removeItem('filter');
        localStorage.removeItem('type_fuel');
        localStorage.removeItem('brand_name');
        localStorage.removeItem('type_shifter');
        localStorage.removeItem('environmental_label');
        localStorage.removeItem('homeBranFilter');
        localStorage.removeItem('homeFuelFilter');
        localStorage.removeItem('homeBodyworkFilter');
        localStorage.removeItem('filters_applied');
        localStorage.removeItem('filterSearch');
        localStorage.removeItem('page');
        localStorage.removeItem('homeModelFilter');

        location.reload();
    }); 
}

// ==================== HIGHLIHT FILTERS ==================== //

function highlightFilter() {
    var filters = JSON.parse(localStorage.getItem('filter'));
    // console.log(all_filter);
    $('#highlight').empty(); // Limpiamos el contenido de highlight

    for (var i = 0; i < filters.length; i++){
        if(filters[i][0] == "fuel"){
            
            $("#fuel").find("option[value='"+filters[i][1]+"']").prop("selected", true);
            $('<p>'+filters[i][1]+'</p>').attr('class', "p-2 p-highlight").appendTo('#highlight').html();

        }else if(filters[i][0] == "brand"){

            $("#brand").find("option[value='"+filters[i][1]+"']").prop("selected", true);
            $('<p>'+filters[i][1]+'</p>').attr('class', "p-2 p-highlight").appendTo('#highlight').html();
        
        }else if(filters[i][0] == "environmental_label"){

            $("#environmental_label").find("option[value='"+filters[i][1]+"']").prop("selected", true);
            $('<p>'+filters[i][1]+'</p>').attr('class', "p-2 p-highlight").appendTo('#highlight').html();
            
        }else if(filters[i][0] == "type_shifter"){

            $("#type_shifter").find("option[value='"+filters[i][1]+"']").prop("selected", true);
            $('<p>'+filters[i][1]+'</p>').attr('class', "p-2 p-highlight").appendTo('#highlight').html();
        }
    }
    
}

// LOAD LATERAL MENU //
function loadLateralMenu() {
    ajaxPromise(friendlyURL('?module=shop&op=lateral_menu'),'POST', 'JSON')
    .then(function(data) {
        // console.log(data);
        if (data == "error") {
            $('<div></div>').appendTo('#lateral_menu')
                .html(
                    '<h3>¡ERROR MENU!</h3>'
                )
        } else {
            // Fuel
            $('<h5></h5>').appendTo("#fuel")
            .html("Combustible: ")
            // Fuel
            for (row in data[0]) {
                $('<option></option>').attr({ 'value': data[0][row].type_fuel }).attr({ 'id': data[0][row].type_fuel }).appendTo('#fuel')
                    .html(
                        data[0][row].type_fuel    
                    )
            }
            // Brand
            for (row in data[1][0]) {
                $('<option></option>').attr({ 'value': data[1][0][row].brand_name }).appendTo('#brand')
                    .html(
                        data[1][0][row].brand_name    
                    )
            }
            // Shifter
            for (row in data[2][0]) {
                $('<option></option>').attr({ 'value': data[2][0][row].type_shifter }).appendTo('#shifter')
                    .html(
                        data[2][0][row].type_shifter    
                    )
            }
            // Enviromental label
            for (row in data[3][0]) {
                $('<option></option>').attr({ 'value': data[3][0][row].environmental_label }).appendTo('#environmental_label')
                    .html(
                        data[3][0][row].environmental_label    
                    )
            }
            // Button sumbit
            $('<div></div>').appendTo('#lateral_menu')
            .html(
                "<button class='button-87 mt-3 filter_button' role='button'>Aplicar</button>"+
                "<button class='button-88 mt-3 remove_button' role='button'>Restablecer</button>"
            )
    }
        // console.log(data);
    }).catch(function() {
        // window.location.href = "index.php?module=ctrl_exceptions&op=503&type=503&lugar=Type_Categories HOME";
        console.log("Error lateral menu");
    });
}

function ajaxForSearch(url,filter,total_prod = 0, items_page = 3){
    ajaxPromise(friendlyURL(url), 'POST', 'JSON', { 'filter': filter, 'total_prod': total_prod, 'items_page': items_page  })
    .then(function(data) {
        $('#list_cars1').empty();
        // console.log(data);
        if (data.length === 0) {
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
        mapBox_all(data);
    }).catch(function() {
        console.log("error ajaxForSearch");
    });
}

// ==================== PAGINATION ====================  //


function pagination(){

    var filters_applied = JSON.parse(localStorage.getItem('filters_applied')) || false;
    // console.log(filters_applied);
    url = filters_applied != false ? '?module=shop&op=count_cars_filter' :  '?module=shop&op=count_all_cars';
    sdata = filters_applied != false ? {'filter': filters_applied} : undefined;
    // console.log(sdata);
    ajaxPromise(friendlyURL(url), 'POST', 'JSON', sdata)
        .then(function(data) {
            // console.log(data);
            var total_prod = data[0].cant_coches;

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

// ==================== MAPBOX ==================== //

function mapBox(id) {
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjBqdWFuMTUiLCJhIjoiY2t6eWhubW90MDBnYTNlbzdhdTRtb3BkbyJ9.uR4BNyaxVosPVFt8ePxW1g';
    const monument = [id.lon, id.lat];
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [id.lon, id.lat], // starting position [lng, lat]
        zoom: 10 // starting zoom
    });

    // Creamosel popup
    const popup = new mapboxgl.Popup({ offset: 25 }).setText(
    id.brand+' | '+id.model+' | '+id.price
    );
    
    // Creamos elemnto DOM para marker
    const el = document.createElement('div');
    el.id = 'marker';
    el.style.backgroundImage = `url(`+id.img+`)`;
    // console.log(id.img); 

    // Creamos el marker
    new mapboxgl.Marker(el)
    .setLngLat(monument)
    .setPopup(popup) // sets a popup on this marker
    .addTo(map);

}

function mapBox_all(shop) {
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjBqdWFuMTUiLCJhIjoiY2t6eWhubW90MDBnYTNlbzdhdTRtb3BkbyJ9.uR4BNyaxVosPVFt8ePxW1g';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-0.61667, 38.83966492354664], // starting position [lng, lat]
        zoom: 6 // starting zoom
    });

    for (row in shop) {
        // console.log(shop[row]);s
        const monument = [shop[row].lon, shop[row].lat];
        const minPopup = new mapboxgl.Popup()
        minPopup.setHTML('<h3 style="text-align:center;">' + shop[row].brand + '</h3><p style="text-align:center;">Modelo: <b>' + shop[row].model+ '</b></p>' +
            '<p style="text-align:center;">Precio: <b>' + shop[row].price + '€</b></p>' +
            "<button id='" + shop[row].cod_car + "' class='more_info_car mt-3 button-86' role='button'>Ver más</button>")
        
        // Creamos elemnto DOM para marker
        const el = document.createElement('div');
        el.id = 'marker';
        el.style.backgroundImage = `url(`+shop[row].image+`)`;
        // console.log(id.img); 

        // Creamos el marker
        new mapboxgl.Marker(el)
        .setLngLat(monument)
        .setPopup(minPopup) // sets a popup on this marker
        .addTo(map);
    }
}

// DETAILS CAR //
function details_car(cod_car) {
    // console.log(cod_car);
    ajaxPromise(friendlyURL("?module=shop&op=details_car"),'POST', 'JSON', { 'cod_car': cod_car})
    .then(function(data) {
        // console.log(data[0][0][0].brand);
        let data_car = data[0][0][0];
        // console.log(data_car.cod_car)
    $('#list_cars').empty();
        for (row in data[1][0]) {
            $('<swiper-slide></swiper-slide>').appendTo('#container-date-img')
                .html(
                    "<img src='"+ data[1][0][row].url_image +"' >"
                )
        }

      

        $('<div></div>').attr({ 'id': data_car.id_car, class: 'date_car_dentro' }).appendTo('.date_car')
            .html(
                "<div class='list_product_details'>" +
                "<div class='product-info_details'>" +
                "<div class='product-content_details'>" +
                "<h1 class='text-center'><b>" + data_car.brand + " " + data_car.model + "</b></h1>" +
                "<hr class=hr-shop>" +
                "<table id='table-shop'> <tr>" +
                "<td> <i id='col-ico' class='fa-solid fa-road fa-lg'></i> &nbsp;" + data_car.km + " KM" + "</td>" +
                "<td> <i id='col-ico' class='fa-solid fa-person fa-lg'></i> &nbsp;" + data_car.shifter + "</td>  </tr>" +
                "<td> <i id='col-ico' class='fa-solid fa-car fa-lg'></i> &nbsp;" + data_car.bodywork + "</td>" +
                "<td> <i id='col-ico' class='fa-solid fa-door-open fa-lg'></i> &nbsp;" + data_car.doors + "</td>  </tr>" +
                "<td> <i id='col-ico' class='fa-solid fa-gas-pump fa-lg'></i> &nbsp;" + data_car.type_motor + "</td>" +
                "<td> <i id='col-ico' class='fa-solid fa-calendar-days fa-lg'></i> &nbsp;" + data_car.enrollment_date + "</td>  </tr>" +
                "<td> <i id='col-ico' class='fa-solid fa-palette fa-lg'></i> &nbsp;" + data_car.color + "</td>" +
                "<td> <i class='fa-solid fa-location-dot fa-lg'></i> &nbsp;" + data_car.population + "</td> </tr>" +
                "<td> <h2 class='fw-bold text-uppercase csstext-red'>" + data_car.price + " €</h2></td>  </tr>" +
                "</table>" +
                "<hr class=hr-shop>" +
                "<h3><b>" + "More Information:" + "</b></h3>" +
                "<p>This vehicle has a 2-year warranty and reviews during the first 6 months from its acquisition.</p>" +
                "<div class='buttons_details'>" +
                "<a class='button add' href='#'>Add to Cart</a>" +
                "<a class='button buy' href='#'>Buy</a>" +
                // "<span class='button' id='price_details'>" + data[0].price + "<i class='fa-solid fa-euro-sign'></i> </span>" +
                // "<a class='details__heart' id='" + data[0].id_car + "'><i id=" + data[0].id_car + " class='fa-solid fa-heart fa-lg'></i></a>" +
                "<a id='like_button' value='"+data_car.cod_car+"'><i id='"+data_car.cod_car+"' class='bi bi-suit-heart-fill text-primary fa-lg'></i><a>"+
                "</div>" +
                "</div>" +
                "</div>" +
                "<div class='border w-50 mt-5 '>"+
                    "<div class='d-flex justify-content-center'>"+
                        "<table>"+
                            "<td><p class='font-weight-bold'>"+ data_car.state +":</p></td></tr>"+
                            "<td><p class='h4'>"+ data_car.price +"</p></td>"+
                            "<td class='ml-5'><p class=' h4 text-success'>En stock</p></td></tr>"+
                            "<td>"+
                               "<div class='quantity-field' >"+
                                    "<button class='value-button decrease-button' id='lessProduct' title='Azalt'>-</button>"+
                                    "<div class='number' data-codCar='"+data_car.cod_car+"' id='quantityProductDetails'>0</div>"+
                                    "<button class='value-button increase-button' id='moreProduct' title='Arrtır'>+</button>"+
                                "</div>"+
                            "</td>"+
                            "<td>"+
                                "<button type='button' class='btn btn-default btn-sm' id='addToCart' data-codCar='"+data_car.cod_car+"'>"+
                                "<span class='glyphicon  glyphicon-shopping-cart'> </span>"+
                                "<b> Add to Cart </b>"+
                            "</button>"+
                            "</td>"+
                        "</table>"+
                    "</div>"+
                "</div>"+
                "<div id='loadModalAddCart'></div>"+ 
                "</div>"
            )
        mapBox(data_car);
        // loadLikes(localStorage.getItem('token'));
        // controlCart();
    }).catch(function() {
    console.log("Error load details");
});

loadSimiarCars(cod_car);
}

// ==================== PRODUCTOS SIMILARES ==================== //
// Pintamos los 3 primeros vehículos, cuando el scroll sea 95% o superior, comprobaremos si hay más coches y pintaremos los nuevos vehículos.
function loadSimiarCars(id){
    let limit = 3;
    
        searchSimilarCars(id, limit);
        
        moreCarsScroll();
    
        function searchSimilarCars(id, limit){
            // $('.title_similar').empty();
            //     $('<h4>Vehículos similares</h4>').attr('class', 'mt-2 mb-5 title_similar').appendTo('.title_similarsCars');
            ajaxPromise(friendlyURL("?module=shop&op=similar_cars"), 'POST', 'JSON', { 'id': id })
            .then(function (data) {
                // console.log(data);
                $('#similarCars').empty();
                
                // console.log(data);
                limit_for = checkLimit(data,limit);
                for(let i = 0; i < limit_for; i++){
                    $('<div></div>').attr('class','col-lg-4 col-md-6 mb-4').appendTo('#similarCars')
                    .html(
                        '<div class="card">'+
                            '<div class="bg-image hover-zoom ripple ripple-surface ripple-surface-light data-mdb-ripple-color="light"">'+
                                '<img src="'+ data[i].image +'" class="w-100" />'+
                                '<a href="#!">'+
                                    '<div class="mask">'+
                                        '<div class="d-flex justify-content-start align-items-end h-100">'+
                                            '<h5><span class="badge bg-primary ms-2">'+data[i].state+'</span></h5>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="hover-overlay">'+
                                        '<div class="mask" style="background-color: rgba(251, 251, 251, 0.15);"></div>'+
                                    '</div>'+
                                '</a>'+
                            '</div>'+
                            '<div class="card-body">'+
                                '<a href="" class="text-reset">'+
                                    '<h5 class="card-title mb-3">'+data[i].brand+' '+data[i].model+'</h5>'+
                                '</a>'+
                                '<a href="'+data[i].cod_car+'" class="more_info_car text-reset">'+
                                    '<p>'+data[i].fuel+'</p>'+
                                '</a>'+
                                '<h6 class="mb-3">'+data[i].price+'</h6>'+
                            '</div>'+
                        '</div>'
                    );
                }
            }).catch(function () {
                console.log("Error load similar cars");
            })
        };
    
        function checkLimit(data, limit){
            let end_for = 0;
            end_for = data.length > limit ? limit : data.length;
            return end_for;
        }
    
        function moreCarsScroll(){
            function amountscrolled(){
                var winheight = $(window).height()
                var docheight = $(document).height()
                var scrollTop = $(window).scrollTop()
                var trackLength = docheight - winheight
                var pctScrolled = Math.floor(scrollTop/trackLength * 100) // gets percentage scrolled (ie: 80 NaN if tracklength == 0)
                    if (pctScrolled > 95){
                        let limitIncrement = limit + 3;
                        searchSimilarCars(id, limitIncrement);
                    }
                }
            
                $(window).on("scroll", function(){
                amountscrolled();
                })
        }
    
    }

$(document).ready(function() {
    loadLateralMenu();
    loadCars();
    filter_button();
    clicks();
    detectChangeShort();
})