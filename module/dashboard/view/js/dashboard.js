/***********************************
*     DASHBOARD FOR USERS          *
***********************************/

// Tabla de usuarios
function launchUsersData() {
    ajaxPromise(friendlyURL('?module=dashboard&op=dataUsers'),'POST', 'JSON')
    .then(function(data) {
        // console.log(data);
        $('#tableData').show();
        $('#usersLauncher').empty();
        $('#cabeceraDataList').empty();
        $('<tr></tr>').appendTo('#cabeceraDataList')
            .html(
                '<th scope="col">Username</th>'+
                '<th scope="col">Fecha de alta</th>'+
                '<th scope="col">Fecha de nacimiento</th>'+
                '<th scope="col">Rol</th>'+
                '<th scope="col">Email</th>'+
                '<th>Administrar</th>'

            )
        for (row in data) {
            $('<tr></tr>').appendTo('#usersLauncher')
                .html(
                    '<td>'+
                        '<img alt="..." src="'+data[row]['avatar']+'" class="avatar avatar-sm rounded-circle me-2">'+
                        '<a class="text-heading font-semibold" >'+data[row]['username']+'</a>'+
                    '</td>'+
                    '<td>'+data[row]['d_registration']+'</td>'+
                    '<td>'+data[row]['d_birth']+'</td>'+
                    '<td>'+
                        '<span class="badge badge-lg badge-dot"><i class="bg-success"></i>'+data[row]['user_type']+'</span>'+
                   '</td>'+
                   '<td>'+data[row]['email']+'</td>'+
                   '<td class="text-end">'+
                   '<button type="button" class="btn btn-sm btn-square btn-neutral text-danger-hover" id="updateUser" value="'+data[row]['username']+'"><i class="bi bi-pencil"></i></button>'+
                    '<button type="button" class="btn btn-sm btn-square btn-neutral text-danger-hover" id="viewUser" value="'+data[row]['username']+'"><i class="bi bi-search"></i></button>'+
                        '<button type="button" class="btn btn-sm btn-square btn-neutral text-danger-hover delete_user" value="'+data[row]['username']+'">'+
                            '<i class="bi bi-trash"></i>'+
                        '</button>'+
                    '</td>'
                )
        }
    }).catch(function() {
        console.log("ERR: Launch Data Users");
    });
}

function deleteUser(){
    $('.delete_user').remove();
    // Comprobamos si realiza click en eliminar
    $(document).on("click", ".delete_user", function() {
        let username = $(this).val();
        modalDeleteUser(username);   
    });

    // El usuario confirma el boorado
    $(document).on("click", "#confirmDeleteUser", function() {
        let username = $(this).val();

        ajaxPromise(friendlyURL('?module=dashboard&op=deleteUser'),'POST', 'JSON', { 'username': username })
            .then(function(data) {
            launchUsersData();
            data == true ? toastr.info("Usuario eliminado correctamente") : toastr.success("Error al eliminar el usuario");
            $('#modalConfirmDelete').modal("hide");
        }).catch(function() {
        console.log("ERR: Delete User");
        });
    });
}

function modalDeleteUser(username){
    
    $('#launchModals').empty();
    ajaxPromise(friendlyURL('?module=dashboard&op=dataOneUser'),'POST', 'JSON', { 'username': username })
            .then(function(data) {
            // console.log(data);
            $('<div class="modal fade" id="modalConfirmDelete" tabindex="-1" aria-labelledby="modalConfirmDelete" aria-hidden="true"></div>').appendTo('#launchModals')
            .html(
                '<div class="modal-dialog">'+
                '<div class="modal-content">'+
                    '<div class="modal-header">'+
                    '<h5 class="modal-title" id="exampleModalLabel">Esta seguro que desea eliminar al usuario</h5>'+
                    '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'+
                    '</div>'+
                    '<div class="modal-body">'+
                    '<h5>Username: '+data[0]['username']+' </h5>'+
                    '<p>Username: '+data[0]['email']+' <p>'+
                    '<p>Username: '+data[0]['user_type']+' </p>'+
                    '</div>'+
                    '<div class="modal-footer">'+
                    '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>'+
                    '<button type="button" value="'+data[0]['username']+'" id="confirmDeleteUser" class="btn btn-warning">Eliminar</button>'+
                    '</div>'+
                '</div>'+
                '</div>'
            );
            $('#modalConfirmDelete').modal("show"); // Mostramos el modal
        }).catch(function() {
            console.log("ERR: Data One User");
        });

}

function viewDataUser(){

    $(document).on("click", "#viewUser", function() {

        let username = $(this).val();
        $('#launchModals').empty();

        ajaxPromise(friendlyURL('?module=dashboard&op=dataOneUser'),'POST', 'JSON', { 'username': username })
                .then(function(data) {
                // console.log(data);
                $('<div class="modal fade" id="modalViewUser" tabindex="-1" aria-labelledby="modalConfirmDelete" aria-hidden="true"></div>').appendTo('#launchModals')
                .html(
                    '<div class="modal-dialog">'+
                    '<div class="modal-content">'+
                        '<div class="modal-header">'+
                        '<h5 class="modal-title" id="exampleModalLabel">Información del usuario: '+data[0]['username']+'</h5>'+
                        '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'+
                        '</div>'+
                        '<div class="modal-body">'+
                        '<table class="table table-dark">'+
                        '<tr>'+
                            '<th>Username</th>'+
                            '<td>'+data[0]['username']+'</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<th>Email</th>'+
                            '<td>'+data[0]['email']+'</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<th>fecha nacimiento</th>'+
                            '<td>'+data[0]['d_birth']+'</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<th>fecha de alta</th>'+
                            '<td>'+data[0]['d_registration']+'</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<th>Número de busquedas</th>'+
                            '<td>'+data[0]['num_searchs']+'</td>'+
                        '</tr>'+
                        '</table>'+
                        '</div>'+
                        '<div class="modal-footer">'+
                        '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>'+
                        '</div>'+
                    '</div>'+
                    '</div>'
                );
                $('#modalViewUser').modal("show"); // Mostramos el modal
            }).catch(function() {
                console.log("ERR: Data One User");
            });

    });
}

function updateDataUser(){

    $(document).on("click", "#updateUser", function() {

        let username = $(this).val();
        $('#launchModals').empty();

        ajaxPromise(friendlyURL('?module=dashboard&op=dataOneUser'),'POST', 'JSON', { 'username': username })
                .then(function(data) {
                // console.log(data);
                $('<div class="modal fade" id="modalupdateUser" tabindex="-1" aria-labelledby="modalConfirmDelete" aria-hidden="true"></div>').appendTo('#launchModals')
                .html(
                    '<div class="modal-dialog">'+
                    '<div class="modal-content">'+
                        '<div class="modal-header">'+
                        '<h5 class="modal-title" id="exampleModalLabel">Modificar al usuario: '+data[0]['username']+'</h5>'+
                        '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'+
                        '</div>'+
                            '<div class="modal-body">'+
                            '<form class="mx-1 mx-md-4" id="updateForm" method="post">'+

                            // CAMPOS OCULTOS PARA VALIDAR USUARIO Y CORREO POSTERIORMENTE
                            '<input type="text"  style="display:none" id="usernameRegisterDb" name="usernameRegisterDb" class="form-control" value="'+data[0]['username']+'"/>'+
                            ' <input type="email" style="display:none" id="emailRegisterDb" name="emailRegisterDb" class="form-control" value="'+data[0]['email']+'" />'+
                            ' <input type="email" style="display:none" id="passwordRegisterDb" name="passwordRegisterDb" class="form-control" value="'+data[0]['password']+'" />'+

                            '<div class="d-flex flex-row align-items-center mb-4">'+
                                '<i class="fas fa-user fa-lg me-3 fa-fw"></i>'+
                                '<div class="form-outline flex-fill mb-0">'+
                                    '<input type="text" id="usernameRegister" name="usernameRegister" class="form-control" value="'+data[0]['username']+'"/>'+
                                    '<label class="form-label" for="usernameRegister">Username</label>'+
                                    '<span style="color: red;" id="errorUsername" class="error"></span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="d-flex flex-row align-items-center mb-4">'+
                                '<i class="fas fa-envelope fa-lg me-3 fa-fw"></i>'+
                                '<div class="form-outline flex-fill mb-0">'+
                                    ' <input type="email" id="emailRegister" name="emailRegister" class="form-control" value="'+data[0]['email']+'" />'+
                                    '<label class="form-label" for="emailRegister">Email</label>'+
                                    '<span style="color: red;" id="errorMail" class="error"></span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="d-flex flex-row align-items-center mb-4">'+
                                '<i class="fas fa-lock fa-lg me-3 fa-fw"></i>'+
                                '<div class="form-outline flex-fill mb-0">'+
                                    ' <input type="password" id="passwordRegister" id="passwordRegister" name="passwordRegister" class="form-control" value="'+data[0]['password']+'" />'+
                                    '<label class="form-label" for="passwordRegister">Password</label>'+
                                    '<span style="color: red;" id="errorPassword" class="error"></span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="d-flex flex-row align-items-center mb-4">'+
                                '<i class="fas fa-key fa-lg me-3 fa-fw"></i>'+
                                '<div class="form-outline flex-fill mb-0">'+
                                    '<input type="password" id="passwordRepeatRegister" class="form-control" value="'+data[0]['password']+'" />'+
                                    '<label class="form-label" for="passwordRepeatRegister">Repeat your password</label>'+
                                    '<span style="color: red;" id="errorRepeatPassword" class="error"></span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="d-flex flex-row align-items-center mb-4">'+
                                '<i class="fas fa-envelope fa-lg me-3 fa-fw"></i>'+
                                '<div class="form-outline flex-fill mb-0">'+
                                    '<input type="date" id="f_nacimientoRegister" name="f_nacimientoRegister" class="form-control" value="'+data[0]['d_birth']+'" />'+
                                    '<label class="form-label" for="f_nacimientoRegister">Fecha de nacimiento</label>'+
                                    '<span style="color: red;" id="errorFNacimiento" class="error"></span>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                        '<div class="modal-footer">'+
                        '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>'+
                        '<button type="button" value="'+data[0]['username']+'" id="confirmUpdate" class="btn btn-warning">Update</button>'+
                        '</div>'+
                    '</div>'+
                    '</div>'
                );
                $('#modalupdateUser').modal("show"); // Mostramos el modal
            }).catch(function() {
                console.log("ERR: Data One User");
            });
    });

    $(document).on("click", "#confirmUpdate", function () {
        updateUser();
    });

    function validateUpdate() {
        
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
                    error = true;
                    $('#errorRepeatPassword').html('<br>La password no coincide con la anterior');
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
        // console.log(error);
        return error == true ? true : false; 
    }

    function updateUser() {

        validateUpdate() == false ? promiseRegister() : undefined;
    
        function promiseRegister() {
            let dataForm = $('#updateForm').serialize();
            // console.log(dataForm);
            ajaxPromise(friendlyURL('?module=dashboard&op=updateUser'), 'POST', 'JSON',  dataForm)
            .then(function(data) {
                // console.log(data);
                data == "Username_no_valido" ? toastr.error("El usuario introducido no es valido") : undefined;
                data == "Email_no_valido" ? toastr.error("El email introducido no es valido") : undefined;
                data == true ? ( toastr.success("Usuario actualizado de forma adecuada"), $('#modalupdateUser').modal("hide"), launchUsersData() ) : undefined;
            }).catch(function() {
                console.log("error ajaxForSearch update");
            });
        }
    }
}

function createUser(){
    
    $('#launchModals').empty();
    $('<a  class="btn d-inline-flex btn-sm btn-primary mx-1" id="spanbuttoncreate"></a>').appendTo('#buttons_up')
    .html(
        '<span class="pe-2" >'+
            '<i class="bi bi-plus"></i>'+
        '</span>'+
        '<span id="createUser">Create</span>'
    );

    $(document).on("click", "#createUser", function() {
        // console.log("dsad");
        $('#launchModals').empty();

    $('<div class="modal fade" id="modalcreateUser" tabindex="-1" aria-labelledby="modalConfirmDelete" aria-hidden="true"></div>').appendTo('#launchModals')
                .html(
                    '<div class="modal-dialog">'+
                    '<div class="modal-content">'+
                        '<div class="modal-header">'+
                        '<h5 class="modal-title" id="exampleModalLabel">Añadir usuario</h5>'+
                        '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'+
                        '</div>'+
                            '<div class="modal-body">'+
                            '<form class="mx-1 mx-md-4" id="createForm" method="post">'+

                            '<div class="d-flex flex-row align-items-center mb-4">'+
                                '<i class="fas fa-user fa-lg me-3 fa-fw"></i>'+
                                '<div class="form-outline flex-fill mb-0">'+
                                    '<input type="text" id="usernameRegister" name="usernameRegister" class="form-control" value=""/>'+
                                    '<label class="form-label" for="usernameRegister">Username</label>'+
                                    '<span style="color: red;" id="errorUsername" class="error"></span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="d-flex flex-row align-items-center mb-4">'+
                                '<i class="fas fa-envelope fa-lg me-3 fa-fw"></i>'+
                                '<div class="form-outline flex-fill mb-0">'+
                                    ' <input type="email" id="emailRegister" name="emailRegister" class="form-control" value="" />'+
                                    '<label class="form-label" for="emailRegister">Email</label>'+
                                    '<span style="color: red;" id="errorMail" class="error"></span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="d-flex flex-row align-items-center mb-4">'+
                                '<i class="fas fa-lock fa-lg me-3 fa-fw"></i>'+
                                '<div class="form-outline flex-fill mb-0">'+
                                    ' <input type="password" id="passwordRegister" id="passwordRegister" name="passwordRegister" class="form-control" value="" />'+
                                    '<label class="form-label" for="passwordRegister">Password</label>'+
                                    '<span style="color: red;" id="errorPassword" class="error"></span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="d-flex flex-row align-items-center mb-4">'+
                                '<i class="fas fa-key fa-lg me-3 fa-fw"></i>'+
                                '<div class="form-outline flex-fill mb-0">'+
                                    '<input type="password" id="passwordRepeatRegister" class="form-control" value="" />'+
                                    '<label class="form-label" for="passwordRepeatRegister">Repeat your password</label>'+
                                    '<span style="color: red;" id="errorRepeatPassword" class="error"></span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="d-flex flex-row align-items-center mb-4">'+
                                '<i class="fas fa-envelope fa-lg me-3 fa-fw"></i>'+
                                '<div class="form-outline flex-fill mb-0">'+
                                    '<input type="date" id="f_nacimientoRegister" name="f_nacimientoRegister" class="form-control" value="" />'+
                                    '<label class="form-label" for="f_nacimientoRegister">Fecha de nacimiento</label>'+
                                    '<span style="color: red;" id="errorFNacimiento" class="error"></span>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                        '<div class="modal-footer">'+
                        '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>'+
                        '<button type="button" value="" id="confirmCreate" class="btn btn-warning">Create</button>'+
                        '</div>'+
                    '</div>'+
                    '</div>'
                );
                $('#modalcreateUser').modal("show"); // Mostramos el modal
    });

    $(document).on("click", "#confirmCreate", function () {
        createUser();
    });

    function validateCreate() {
        
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
                    error = true;
                    $('#errorRepeatPassword').html('<br>La password no coincide con la anterior');
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
        // console.log(error);
        return error == true ? true : false; 
    }

    function createUser() {

        validateCreate() == false ? promiseRegister() : console.log('true');
    
        function promiseRegister() {
            let dataForm = $('#createForm').serialize();
            // console.log(dataForm);
            ajaxPromise(friendlyURL("?module=auth&op=register"), 'POST', 'JSON', dataForm)
            .then(function(data) {
            // console.log(data);
            console.log(data[0][0]['resultado']);
            let res = data[0][0]['resultado'];
            res == "error_mail" ? $('#errorMail').html('<br>El emial introduccido ya esta en uso') : undefined;
            res == "error_username" ? $('#errorUsername').html('<br>El username introduccido no esta disponible') : undefined;
            res == "ok_insert" ? (toastr.success("Registery succesfully"), launchUsersData(), $('#modalcreateUser').modal("hide")) : undefined;
            }).catch(function() {
                console.log("error ajaxForSearch Register");
            });
        }
    }


}

// carga las estadisticas generales de usuario
function cardDataCountUsers(){
    ajaxPromise(friendlyURL('?module=dashboard&op=cantUsers'),'POST', 'JSON')
        .then(function(data) {
        // console.log(data[0]['cantUsers']);
        $('<div class="col-xl-3 col-sm-6 col-12"></div>').appendTo('#cards_estadistics')
            .html('<div class="card shadow border-0">'+
            '<div class="card-body">'+
                '<div class="row">'+
                    '<div class="col">'+
                        '<span class="h6 font-semibold text-muted text-sm d-block mb-2">Usuarios</span>'+
                        '<span class="h3 font-bold mb-0">'+data[0]['cantUsers']+'</span>'+
                    '</div>'+
                    '<div class="col-auto">'+
                        '<div class="icon icon-shape bg-primary text-white text-lg rounded-circle">'+
                            '<i class="bi bi-people"></i>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
                '<div class="mt-2 mb-0 text-sm">'+
                    '<span class="badge badge-pill bg-soft-success text-success me-2"><i class="bi bi-arrow-up me-1"></i>30%</span>'+
                    '<span class="text-nowrap text-xs text-muted"></span>'+
                '</div>'+
                '</div>'+
            '</div>'
        );          

    }).catch(function() {
    console.log("ERR: Data Count User");
    });
}

function cardDataCountSearchs(){
    ajaxPromise(friendlyURL('?module=dashboard&op=cantBusquedasDiarias'),'POST', 'JSON')
        .then(function(data) {
        // console.log(data[0]['cantSearchs']);
        $('<div class="col-xl-3 col-sm-6 col-12"></div>').appendTo('#cards_estadistics')
            .html('<div class="card shadow border-0">'+
            '<div class="card-body">'+
                '<div class="row">'+
                    '<div class="col">'+
                        '<span class="h6 font-semibold text-muted text-sm d-block mb-2">Busquedas de hoy</span>'+
                        '<span class="h3 font-bold mb-0">'+data[0]['cantSearchs']+'</span>'+
                    '</div>'+
                    '<div class="col-auto">'+
                        '<div class="icon icon-shape bg-primary text-white text-lg rounded-circle">'+
                            '<i class="bi bi-minecart-loaded"></i>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
                '<div class="mt-2 mb-0 text-sm">'+
                    '<span class="badge badge-pill bg-soft-success text-success me-2"><i class="bi bi-arrow-up me-1"></i>30%</span>'+
                    '<span class="text-nowrap text-xs text-muted"></span>'+
                '</div>'+
                '</div>'+
            '</div>'
        );          

    }).catch(function() {
    console.log("ERR: Data Count Searchs");
    });
}

// == LAUNCHER USERS == //

function launcherDashboardForUsers(){
    $('#tableData').hide();
    $('#cards_estadistics').empty();
    $('#buttons_up').empty();
    launchUsersData();
    deleteUser();
    cardDataCountUsers();
    viewDataUser();
    updateDataUser();
    cardDataCountSearchs();
    createUser();
}

/***********************************
*     DASHBOARD FOR STATS          *
***********************************/

function launcherDashboardForStats() {
    $('#tableData').hide();
    $('#cards_estadistics').empty();
    $('#spanbuttoncreate').remove();

    $('<div class="col-xl-12 col-sm-12 col-12 text-center bg-secondary"></div>').appendTo('#cards_estadistics')
        .html(
            '<h2>Estadísticas generales</h2>'
        );
    brandMoreVisited();
    usersDateRegistration();
    bodyworkMoreVisited();
    fuelMoreVisited();

    

    function brandMoreVisited(){
        // Marca más buscada
        $('<div class="col-xl-3 col-sm-3 col-12"></div>').appendTo('#cards_estadistics')
        .html(
            '<div class="card shadow border-0 w-100">'+
                '<div class="card-body">'+
                '<span class="h6 font-semibold text-muted text-sm d-block mb-2">Marca más buscada</span>'+
                '<canvas id="brandVisits-chart" width="100%" height="100%"></canvas>'+
                '</div>'+
            '</div>'
        );

        ajaxPromise(friendlyURL('?module=dashboard&op=chartBrandMostVisited'),'POST', 'JSON')
            .then(function(data) {
            // console.log(data);
            let brands = [];
            let visits = [];
            for(row in data){
                brands.push(data[row]['description']);
                visits.push(data[row]['num_visits']);
            }

            // Eliminamos las comillas del array visits
            let visitClear = visits.map(elemento => JSON.parse(elemento));
            // console.log(visitClear);
            new Chart(document.getElementById("brandVisits-chart"), {
                type: 'doughnut',
                data: {
                labels: brands,
                datasets: [
                    {
                    label: "Visitas",
                    backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
                    data: visitClear
                    }
                ]
                },
                options: {
                title: {
                    display: true,
                    text: 'Visitas: '
                }
                }
            });

        }).catch(function() {
        console.log("ERR: Data Visits Brands");
        });

    }

    function bodyworkMoreVisited(){
        // Marca más buscada
        $('<div class="col-xl-3 col-sm-3 col-12"></div>').appendTo('#cards_estadistics')
        .html(
            '<div class="card shadow border-0 w-100">'+
                '<div class="card-body ">'+
                '<span class="h6 font-semibold text-muted text-sm d-block mb-2">Carroceria más buscada</span>'+
                '<canvas id="bodyworkVisits-chart" width="100%" height="100%"></canvas>'+
                '</div>'+
            '</div>'
        );

        ajaxPromise(friendlyURL('?module=dashboard&op=chartBodyworkMostVisited'),'POST', 'JSON')
            .then(function(data) {
            // console.log(data);
            let bodywork = [];
            let visits = [];
            for(row in data){
                bodywork.push(data[row]['description']);
                visits.push(data[row]['num_visitas']);
            }
            // Eliminamos las comillas del array bodywork
            let bodyworkClear = visits.map(elemento => JSON.parse(elemento));
            // console.log(bodyworkClear);
            new Chart(document.getElementById("bodyworkVisits-chart"), {
                type: 'doughnut',
                data: {
                labels: bodywork,
                datasets: [
                    {
                    label: "Visitas",
                    backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
                    data: bodyworkClear
                    }
                ]
                },
                options: {
                title: {
                    display: true,
                    text: 'Visitas: '
                }
            }
            });

        }).catch(function() {
        console.log("ERR: Data Visits Bodywork");
        });

    }

    function usersDateRegistration(){
        // Marca más buscada
        $('<div class="col-xl-3 col-sm-3 col-12"></div>').appendTo('#cards_estadistics')
        .html(
            '<div class="card shadow border-0 w-100">'+
                '<div class="card-body">'+
                '<span class="h6 font-semibold text-muted text-sm d-block mb-2">Nuevos usuarios por día</span>'+
                '<canvas id="userRegistration-chart" width="100%" height="100%"></canvas>'+
                '</div>'+
            '</div>'
        );

        ajaxPromise(friendlyURL('?module=dashboard&op=chartUserRegistration'),'POST', 'JSON')
            .then(function(data) {
            // console.log(data);
            let date = [];
            let quantity = [];
            for(row in data){
                date.push(data[row]['d_registration']);
                quantity.push(data[row]['quantity_register']);
            }
            
            // Eliminamos las comillas del array visits
            let quantityClear = quantity.map(elemento => JSON.parse(elemento));

            new Chart(document.getElementById("userRegistration-chart"), {
                type: 'bar',
                data: {
                labels: date,
                datasets: [
                    {
                    label: "Nuevos usuarios",
                    backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
                    data: quantityClear
                    }
                ]
                },
                options: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Predicted world population (millions) in 2050'
                }
                }
            });

        }).catch(function() {
        console.log("ERR: Data Visits Brands");
        });

    }

    function fuelMoreVisited(){
        // Marca más buscada
        $('<div class="col-xl-3 col-sm-3 col-12"></div>').appendTo('#cards_estadistics')
        .html(
            '<div class="card shadow border-0 w-100">'+
                '<div class="card-body">'+
                '<span class="h6 font-semibold text-muted text-sm d-block mb-2">Combustible más buscado</span>'+
                '<canvas id="fuelVisits-chart" width="100%" height="100%"></canvas>'+
                '</div>'+
            '</div>'
        );

        ajaxPromise(friendlyURL('?module=dashboard&op=chartFuelMostVisited'),'GET', 'JSON')
            .then(function(data) {
            // console.log(data);
            let brands = [];
            let visits = [];
            for(row in data){
                brands.push(data[row]['description']);
                visits.push(data[row]['num_visits']);
            }

            // Eliminamos las comillas del array visits
            let visitClear = visits.map(elemento => JSON.parse(elemento));
            // console.log(visitClear);
            new Chart(document.getElementById("fuelVisits-chart"), {
                type: 'doughnut',
                data: {
                labels: brands,
                datasets: [
                    {
                    label: "Busquedas",
                    backgroundColor: ["#3e92cd", "#8e1ea2","#3cba2f","#e8c3b5","#c45850"],
                    data: visitClear
                    }
                ]
                },
                options: {
                title: {
                    display: true,
                    text: 'Fuel: '
                }
                }
            });

        }).catch(function() {
        console.log("ERR: Data Visits Brands");
        });

    }
}


function launcher() {
    $(document).on("click", "#stats", function() {
        launcherDashboardForStats();
    });

    $(document).on("click", "#users", function() {
        launcherDashboardForUsers();
    });

}

$(document).ready(function() {
    $('#header').remove();
    $('#hero').remove();
    $('#footer').remove();
    $('.navbar_search').remove();
    launcher();
    
});
