<?php
    // require_once(SITE_ROOT . 'module/auth/model/BLL/auth_bll.class.singleton.php');
    class auth_model {

        private $bll;
        static $_instance;
        
        function __construct() {
            $this -> bll = auth_bll::getInstance();
        }

        public static function getInstance() {
            if (!(self::$_instance instanceof self)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function get_register($args) {
            return $this -> bll -> get_register_BLL($args);
        }
        
        public function get_login($args) {
            // return $args;
            return $this -> bll -> get_login_BLL($args);
        }

        public function get_dataUser($args) {
            return $this -> bll -> get_dataUser_BLL($args);
            // return $args;
        }

        public function get_logout() {
            return $this -> bll -> get_logout_BLL();
        }

        public function get_controlUser($args) {
            return $this -> bll -> get_control_user_BLL($args);
        }

        public function get_checkExpirationTokenRefresh($args) {
            return $this -> bll -> get_checkExpirationTokenRefresh_BLL($args);
        }

        public function get_controlActivity($args) {
            return $this -> bll -> get_controlActivity_BLL($args);
        }

        public function get_changeTokenRefres($args) {
            return $this -> bll -> get_changeTokenRefres_BLL($args);
        }

    }
?>