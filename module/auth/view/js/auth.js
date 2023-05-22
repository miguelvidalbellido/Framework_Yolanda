// ============== LOAD FORM ================ //
const changeForm = () => {
    $('#selecForm').on('click', function () {
        $(this).text() == "Login" ? ( $(this).text('Register'), $('#form_register').hide(), $('#form_login').show() ) : ( $(this).text('Login'), $('#form_login').hide(), $('#form_register').show() );
    });
}

/***********************************
*               LOGIN              *
***********************************/
function key_login() {
    $("#login").keydown(function(e) {
        e.which == 13 ? ( e.preventDefault(), login() ) : undefined;
    });
}

function button_login() {
    $('#login').on('click', function(e) {
        e.preventDefault();
        // console.log("asdsadasdas");
        login();
    });
}

function validate_login() {
    var error = false;

    if($('#usernameLogin').val().length === 0) {
        $('#errorUsernameLogin').html('<br>Introduce tu nombre de usuario');
        error = true;
    } else {
        if($('#usernameLogin').val().length < 6) {
            $('#errorUsernameLogin').html('<br>El nombre de usuario tiene como mínimo 6 caracteres');
            error = true;
        } else {
            $('#errorUsernameLogin').html('');
        }
    }

    if($('#passwordLogin').val().length === 0) {
        $('#errorPasswordLogin').html('<br>Introduce la contraseña');
        error = true;
    } else {
            $('#errorPasswordLogin').html('');
    }

    return error == true ? true : false;
}

function login() {
    validate_login() == false ? promiseLogin() : undefined;
    function promiseLogin() {
        let data = $('#loginForm').serialize();
        // console.log(data);
        ajaxPromise(friendlyURL("?module=auth&op=login"), 'POST', 'JSON', data)
        .then(function (data) {
            console.log(data);
            let error = false;
            data == "error_username" ? ( $('#errorUsernameLogin').html('<br>El nombre de usuario introducido no existe'), error = true) : undefined;
            data == "error_password" ? ( $('#errorPasswordLogin').html('<br>Datos erroneos, revisa el nombre de usuario y la contraseña'), error = true) : undefined;
            error == false ? ( localStorage.setItem("token", data['token_large']), localStorage.setItem("token_refresh", data['token_refresh']), toastr.success("Bienvenido de nuevo"), setTimeout(() => window.location.href = friendlyURL('?module=shop'), 1000) ) : undefined;
        }).catch(function() {
            console.log("error ajaxForSearch Login");
        });
    }
}

/***********************************
*            REGISTER              *
***********************************/
const key_register = () => {
    $("#register").keydown(function(e) {
        e.which == 13 ? ( e.preventDefault(), register() ) : undefined;
    });
}

const button_register = () => {
    $('#register').on('click', function(e) {
        e.preventDefault();
        register();
    });
}

// VALIDATE
const validate_register = () => {
    var usernameExpr = /^[a-zA-Z0-9]{6,}$/;
    var mailExpr = /^[a-zA-Z0-9_\.\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$/;
    var passwdExpr = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/;
    var fechaDeReferencia = new Date('2005-01-01');
    var error = false;

    if($('#usernameRegister').val().length === 0) {
        $('#errorUsername').html('<br>Añade un nombre de usuario');
        error = true;
    } else {
        if($('#usernameRegister').val().length < 6) {
            $('#errorUsername').html('<br>El usuario ha de contener 6 caracteres como minimo');
            error = true;
        } else {
            if(!usernameExpr.test($('#usernameRegister').val())) {
                $('#errorUsername').html('<br>No se pueden poner caracteres especiales');
                error = true;
            }else{
                $('#errorUsername').html('');
            }
        }
    }

    if($('#emailRegister').val().length === 0) {
        $('#errorMail').html('<br>Tienes que escribir un correo');
        error = true;
    } else {
        if(!mailExpr.test($('#emailRegister').val())) {
            $('#errorMail').html('<br>El formato del mail es invalido');
            error = true;
        } else {
            $('#errorMail').html('');
        }
    }

    $('#errorRepeatPassword').html('<br>');
    if($('#passwordRegister').val().length === 0) {
        $('#errorPassword').html('<br>Tienes que escribir la contraseña');
        error = true;
    } else {
        if($('#passwordRegister').val().length < 8) {
            $('#errorPassword').html('<br>La password tiene que tener 8 caracteres como minimo');
            error = true;
        } else {

            if ($('#passwordRegister').val() != $('#passwordRepeatRegister').val()) { 
                $('#errorRepeatPassword').html('<br>La password no coincide con la anterior');
                // error = true;
            }else { 
                $('#errorRepeatPassword').html('<br>');
                if(!passwdExpr.test($('#passwordRegister').val())) {
                    $('#errorPassword').html('<br>Debe de contener minimo 8 caracteres, mayusculas, minusculas y simbolos especiales');
                    error = true;
                }else{
                    $('#errorPassword').html('');
                }
            }
        }
    }

    let fechaSeleccionada = new Date($('#f_nacimientoRegister').val());

    if (isNaN(fechaSeleccionada)) {
        $('#errorFNacimiento').html('<br>Introduce la fecha de nacimiento');
        error = true;
    } else {
        // if(fechaSeleccionada > fechaDeReferencia) {
        //     $('#errorFNacimiento').html('<br>La fecha introducida no es valida');
        //     error = true;
        // }else{
            $('#errorFNacimiento').html();
        // }
    }

    return error == true ? true : false; 
}

const register = () => {
    validate_register() == false ? promiseRegister() : undefined;
    function promiseRegister() {
        let data = $('#registerForm').serialize();
        // console.log(data);
        ajaxPromise(friendlyURL("?module=auth&op=register"), 'POST', 'JSON', data)
        .then(function(data) {
            // console.log(data[0][0]['resultado']);
            let res = data[0][0]['resultado'];
            res == "error_mail" ? $('#errorMail').html('<br>El emial introduccido ya esta en uso') : undefined;
            res == "error_username" ? $('#errorUsername').html('<br>El username introduccido no esta disponible') : undefined;
            res == "ok_insert" ? (toastr.success("Registery succesfully"), setTimeout($('#selecForm').text('Register'), $('#form_register').hide(), $('#form_login').show() ,1000)) : undefined;
        }).catch(function() {
            console.log("error ajaxForSearch Register");
        });
    }
}

$(document).ready(function (){
    $('#form_login').hide();
    changeForm();
    key_register();
    button_register();
    key_login();
    button_login();
});
