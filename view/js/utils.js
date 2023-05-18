function ajaxPromise(sUrl, sType, sTData, sData = undefined) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: sUrl,
            type: sType,
            dataType: sTData,
            data: sData
        }).done((data) => {
            resolve(data);
        }).fail((jqXHR, textStatus, errorThrow) => {
            reject(errorThrow);
        }); 
    });
}

function friendlyURL(url) {
    var link = "";
    url = url.replace("?", "");
    url = url.split("&");
    cont = 0;
    for (var i = 0; i < url.length; i++) {
        cont++;
        var aux = url[i].split("=");
        if (cont == 2) {
            link += "/" + aux[1] + "/";	
        }else{
            link += "/" + aux[1];
        }
    }
    // console.log(link);
    return "http://localhost/FW_coches_net" + link;
}

function changeMenuAuth() {
    // PINTAMOS LAS OPCIONES GENERALES DEL MENU
    $('#contNavbar').empty();
    $('#contNavbar').append(
        '<li><a class="nav-link scrollto active" href="'+ friendlyURL("?module=home") +'">Home</a></li>'+
        '<li><a class="nav-link scrollto" href="#about">About</a></li>'+
        '<li><a class="nav-link scrollto" href="index.php?page=services">Services</a></li>'+
        '<li><a class="nav-link   scrollto" href="index.php?page=controller_cars&op=list">Coches</a></li>'+
        '<li><a class="nav-link scrollto" href="' + friendlyURL("?module=shop") + '">Shop</a></li>'+
        '<li><a class="nav-link scrollto men_login" href="' + friendlyURL("?module=auth") + '">Register</a></li>'+
        '<li><a class="nav-link scrollto" href="' + friendlyURL("?module=contact") + '">Contact</a></li>'+
        '<li><a class="getstarted scrollto" href="#about">Get Started</a></li>'+

              '<div class="dropdown" id="dropdown_user"></div>'+

              '<div id="loadShopCart" class="p-3"></div>'
    );


    let token = localStorage.getItem('token');
    // console.log(token);
    if(token) {
        ajaxPromise(friendlyURL("?module=auth&op=dataUser"), 'POST', 'JSON', { 'token': token })
        .then(function (data) { 
            // console.log(data[0]['avatar']);
            // Limpiamos los contenedores
            $('#highlight_searchs').empty();
            $('.men_login').remove();
            $('#dropdown_user').empty();
            $('#loadShopCart').empty();
            // Creamos el dropdown user
            $('<a href="#" id="imageDropdown" data-toggle="dropdown"><img height="40vw" src="'+ data[0]['avatar'] +'"></a>').appendTo('#dropdown_user');
            $('<ul class="dropdown-menu" id="dropdown_user_menu" role="menu" aria-labelledby="imageDropdown"></ul>').appendTo('#dropdown_user')
                .html(
                    '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">'+ data[0]['username']+ '</a></li>'+
                    '<li role="presentation"><a role="menuitem" id="logout" tabindex="-1" href="#">Logout</a></li>'+
                    '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Menu item 3</a></li>'+
                    '<li role="presentation" class="divider"></li>'+
                    '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Menu item 4</a></li>'
                );
            data[0]['user_type'] == "admin" ? $('<li role="presentation"><a role="menuitem" tabindex="-1" href="index.php?page=ctrl_dashboard&op=launchView">Dashboard</a></li>').appendTo('#dropdown_user_menu') : undefined ;
            // Cargamos el carrito (de momento solo icono)
            $('<a href="' + friendlyURL("?module=shopCart") + '"><i class="bi bi-cart fa-6x"></i></a>').appendTo('#loadShopCart');
        }).catch(function() {
            console.log("Error al cargar data del usuarioooo");
        });
    } else {
        console.log("No Hay token");
    }

}

function click_logout() {
    $(document).on('click', '#logout', function() {
        logout();
    });

    function logout() {
        ajaxPromise(friendlyURL("?module=auth&op=logout"), 'POST', 'JSON')
        .then(function(data) {
            // console.log(data);
            localStorage.removeItem('token');
            localStorage.removeItem('token_refresh');
            toastr.success("Logout succesfully");
            window.location.href = "?module=shop";
            // console.log('logout');
        }).catch(function() {
            console.log('Error logout promise');
        });
    }
}

/***********************************
*               ACTIVITY USER              *
***********************************/

function launchActivityData() {
    protectUrl();
    setInterval(function() { controlActivity() }, 600000); // 1 min = 60000
    setInterval(function() {checkTemporalToken() }, 600000);
}

function protectUrl() {
    let token = localStorage.getItem('token');
    ajaxPromise(friendlyURL('?module=auth&op=controlUser'), 'POST', 'JSON', { 'token': token})
    .then(function(data) {
        // console.log(data);
        data == "correctUser" ? console.log("OK --> El usuario coincide con la sesion") : ( console.log("ERROR --> Acesso indebido"), $('#logout').click()) ;
    }).catch(function() {
        console.log('Error promise protectUrl');
    });
}

function controlActivity() {
    let token = localStorage.getItem('token');
    ajaxPromise(friendlyURL('?module=auth&op=controlActivity'), 'POST', 'JSON', { 'token': token})
    .then(function(data) {
        // console.log(data);
        data == "inactivo" ? ( console.log(" usuario Inactivo"), $('#logout').click()) :  ( data == "activo" ? console.log('usuario Activo') : console.log("No hay usuario logueado") );
    }).catch(function() {
        console.log('Error promise controlActivity');
    });
}

// Comprueba que el token de 1 hora sigue activo
function checkTemporalToken() {
    let token_refresh = localStorage.getItem('token_refresh');
    let token_large = localStorage.getItem('token');
    ajaxPromise(friendlyURL('?module=auth&op=checkExpirationTokenRefresh'), 'POST', 'JSON', { 'token_refresh': token_refresh, 'token_large': token_large })
    .then(function(data) {
        data == "NotExpiredJWTRefresh" ? undefined : ( data == "ExpiredJWTRefresh" ? (console.log("Token refresh exp"), changeTokenRefresh()) : $('#logout').click()) ;
        // console.log(data);
    }).catch(function() {
        console.log('Error promise checkTemporalToken');
    });

    function changeTokenRefresh() {
        let token = localStorage.getItem('token');
        ajaxPromise('module/login/ctrl/ctrl_login.php?op=changeTokenRefres', 'POST', 'JSON', { 'token': token })
        .then(function(data) {
            console.log(data);
            localStorage.setItem('token_refresh', data);
        }).catch(function() {
            console.log('Error promise changeTokenRefresh');
        });
    }
}


$(document).ready(function() {
    changeMenuAuth();
    click_logout();
    launchActivityData();
    // console.log("hola");
})