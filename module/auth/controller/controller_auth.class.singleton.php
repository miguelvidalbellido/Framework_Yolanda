<?php

@session_start();

    class controller_auth {

        static $_instance;
		function __construct() {   

        }

        public static function getInstance() {  /// Crea el constructor si no exixte
            if (!(self::$_instance instanceof self)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        function view(){
            common::load_view('top_page_auth.html', 'C:/xampp/htdocs/FW_coches_net/module/auth/view/' . 'auth.html');
        }
        function viewRecoverPass() {
            common::load_view('top_page_auth.html', 'C:/xampp/htdocs/FW_coches_net/module/auth/view/' . 'recover_pass.html');
        }
        function register(){
            echo json_encode(common::load_model('auth_model', 'get_register', [ $_POST['usernameRegister'],$_POST['emailRegister'],$_POST['passwordRegister'],$_POST['f_nacimientoRegister'] ]));
        }
        function login(){
            echo json_encode(common::load_model('auth_model', 'get_login', [ $_POST['usernameLogin'],$_POST['passwordLogin'] ]));
        }
        function dataUser() {
            // echo json_encode($_POST['token']);
            echo json_encode(common::load_model('auth_model', 'get_dataUser', $_POST['token']));
        }
        function logout() {
            echo json_encode(common::load_model('auth_model', 'get_logout'));
        }
        function controlUser() {
            echo json_encode(common::load_model('auth_model', 'get_controlUser',$_POST['token']));
        }
        function checkExpirationTokenRefresh() {
            echo json_encode(common::load_model('auth_model', 'get_checkExpirationTokenRefresh', [ $_POST['token_refresh'], $_POST['token_large ']]));
        }
        function controlActivity() {
            echo json_encode(common::load_model('auth_model', 'get_controlActivity', $_POST['token']));
        }
        function changeTokenRefres() {
            echo json_encode(common::load_model('auth_model', 'get_changeTokenRefres', $_POST['token']));
        }
        function verifyAccount() {
            // echo json_encode($_POST['token_email']);
            echo json_encode(common::load_model('auth_model', 'get_verifyAccount', $_POST['token_email']));
        }
        function recoverPassword() {
            // echo json_encode($_POST['username']);
            echo json_encode(common::load_model('auth_model', 'get_recoverPassword', $_POST['username']));
        }
        function changePassword() {
            echo json_encode(common::load_model('auth_model', 'get_changePassword', [ $_POST['token_email'], $_POST['password'] ]));
        }
        function social_login() {
            echo json_encode(common::load_model('auth_model', 'get_social_login', [$_POST['id'], $_POST['username'], $_POST['email'], $_POST['avatar']]));
        }
    }

?>