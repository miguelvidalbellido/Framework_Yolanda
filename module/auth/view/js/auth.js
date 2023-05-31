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
            if(data == "unverified_email") {
                toastr.success("El usuario no se encuentra activo, revisa el correo");
            }else {
                $('#content_button_recover').empty();
                data == "error_username" ? ( $('#errorUsernameLogin').html('<br>El nombre de usuario introducido no existe'), error = true) : undefined;
                data == "error_password" ? ( $('#errorPasswordLogin').html('<br>Datos erroneos, revisa el nombre de usuario y la contraseña'), $('#content_button_recover').append('<a class="recover_password">RECUPERAR CONTRASEÑA</a>'), error = true) : undefined;
                error == false ? ( localStorage.setItem("token", data['token_large']), localStorage.setItem("token_refresh", data['token_refresh']), toastr.success("Bienvenido de nuevo"), setTimeout(() => window.location.href = friendlyURL('?module=shop'), 1000) ) : undefined;
            }
            
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
            console.log(data[0][0]['resultado']);
            let res = data[0][0]['resultado'];
            res == "error_mail" ? $('#errorMail').html('<br>El emial introduccido ya esta en uso') : undefined;
            res == "error_username" ? $('#errorUsername').html('<br>El username introduccido no esta disponible') : undefined;
            res == "ok_insert" ? (toastr.success("Registery succesfully"), setTimeout($('#selecForm').text('Register'), $('#form_register').hide(), $('#form_login').show() ,1000)) : undefined;
        }).catch(function() {
            console.log("error ajaxForSearch Register");
        });
    }
}

// ------------------- LOAD CONTENT ------------------------ //

const load_content_control_email = () => {
    let path = window.location.pathname.split('/');
    // Controlamos si hay entrada de token para almacenar en localStorage y redireccionar
    if(path[4] === 'verify') {
        localStorage.setItem('option_account', path[4]);
        localStorage.setItem('token_email', path[5]);
        window.location.href = friendlyURL('?module=auth');
    }else if(path[4] == 'recover') {
        localStorage.setItem('option_account', path[4]);
        localStorage.setItem('token_email', path[5]);
        window.location.href = friendlyURL('?module=auth&op=viewRecoverPass');
    }

    // Comprobamos si hay localStorage para verificar o recuperar password.
    let token_email = localStorage.getItem('token_email') || false;
    let option_account = localStorage.getItem('option_account') || false;

    if(token_email != false){
        option_account === "verify" ? ($("#selecForm").click(), verificarAccount(token_email)) : undefined;
        option_account === "recover" ? modificarContrasena(token_email) : undefined;
    }

    function verificarAccount(token_email){
        ajaxPromise(friendlyURL("?module=auth&op=verifyAccount"), 'POST', 'JSON', {token_email})
        .then(function(data) {
            data == true ? (localStorage.removeItem('token_email'), localStorage.removeItem('option_account'), toastr.success('Tu cuenta ha sido verificada de forma exitosa')) : console.log('Error al activar');
        }).catch(function() {
            console.log("error ajaxForSearch VerifyAccount");
        });
    }

    function modificarContrasena(token_email) {
        $('#button_set_pass').on('click', function(event) {
            event.preventDefault();
            let pass = $('#password1').val();
            let pass_repeat = $('#password2').val();
            // ambas estan llenas
            if(pass.length != 0 && pass_repeat.length != 0){
                // pasamos el test de regex
                let passwdExpr = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/;
                let error = false;
                !passwdExpr.test(pass) ?(  $('#password1').css('background-color', 'red'), error = true ) : $('#password1').css('background-color', 'green');
                !passwdExpr.test(pass_repeat) ? ( $('#password2').css('background-color', 'red'), error = true ) : $('#password2').css('background-color', 'green');

                if(pass === pass_repeat && error == false) {
                    ajaxPromise(friendlyURL("?module=auth&op=changePassword"), 'POST', 'JSON', {'token_email' : token_email, 'password' : pass})
                    .then(function(data) {
                        if(data === "token_email_expired"){
                            toastr.warning("El token ha expirado");
                        }else{
                            data === true ? (toastr.success('La contraseña ha sido mofidicada correctamente'), setTimeout(window.location.href = friendlyURL('?module=auth'), 1000)) : undefined;
                        }
                    }).catch(function() {
                        console.log("error ajaxForSearch changePassword");
                    });
                }else{
                    toastr.error('Ambas contraseñas han de ser iguales')
                }
            }

        });
    }
}

function recoverPassword() {
    $('#content_button_recover').on('click', function(event) {
        event.preventDefault();
        recoverPassowrd();
    });

    function recoverPassowrd() {
        let username = $('#usernameLogin').val();
        ajaxPromise(friendlyURL("?module=auth&op=recoverPassword"), 'POST', 'JSON', {username})
        .then(function(data) {
            if(data === "User_social_login"){
                toastr.warning("No se puede recuperar, ya que se ha registrado con terceros");
            } else {
                data == true ? toastr.success('Se ha enviado un mensaje al correo asociado para reestablecer la contraseña') : undefined;
            }
        }).catch(function() {
            console.log("error ajaxForSearch RecoverPassword");
        });
    }
}

// LOGIN DE TERCEROS

const socialLogin = () => {
    
    controlSocialLogin();

    function controlSocialLogin() {
        $('#login_github').on('click', function(e) {
            e.preventDefault();
            promiseSocialLogin("github");
        });
        $('#login_google').on('click', function(e) {
            e.preventDefault();
            promiseSocialLogin("google");
        });
    }

    function firebase_config(){
        if(!firebase.apps.length){
            firebase.initializeApp(firebase_credentials);
        }else{
            firebase.app();
        }
        return authService = firebase.auth();
    }

    function promiseSocialLogin(param) {
        authService = firebase_config();
        authService.signInWithPopup(provider_config(param))
        .then(function(result) {


            email_name = result.user.email;
            let username = email_name.split('@');
            // console.log(username[0]);

            social_user = {id: result.user.uid, username: username[0], email: result.user.email, avatar: result.user.photoURL};
            // console.log(social_user);
            if (result) {
                ajaxPromise(friendlyURL("?module=auth&op=social_login"), 'POST', 'JSON', social_user)
                .then(function(data) {
                    console.log(data);
                    if(data != "error_social_login") {
                            localStorage.setItem("token", data['token_large']);
                            localStorage.setItem("token_refresh", data['token_refresh']);
                            toastr.success("Bienvenido de nuevo");
                            setTimeout(() => window.location.href = friendlyURL('?module=shop'),1000);
                    }else{
                        toastr.warning("Ha sucedido un error");
                    }
                })
                .catch(function() {
                    console.log('Error: Social login error');
                });
            }
        })
        .catch(function(error) {
            var errorCode = error.code;
            console.log(errorCode);
            var errorMessage = error.message;
            console.log(errorMessage);
            var email = error.email;
            console.log(email);
            var credential = error.credential;
            console.log(credential);
        });
    }

    function provider_config(param){
        if(param === 'google'){
            var provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            return provider;
        }else if(param === 'github'){
            return provider = new firebase.auth.GithubAuthProvider();
        }
    }
}

$(document).ready(function (){
    $('#form_login').hide();
    $('.navbar_search').remove();
    changeForm();
    key_register();
    button_register();
    key_login();
    button_login();
    load_content_control_email();
    recoverPassword();
    socialLogin();
});
