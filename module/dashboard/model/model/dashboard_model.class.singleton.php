<?php
    // require_once(SITE_ROOT . 'module/dashboard/model/BLL/dashboard_bll.class.singleton.php');
    class dashboard_model {

        private $bll;
        static $_instance;
        
        function __construct() {
            $this -> bll = dashboard_bll::getInstance();
        }

        public static function getInstance() {
            if (!(self::$_instance instanceof self)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        ///////////////////// STATS //////////////////////

        public function get_chartBrandMostVisited() {
            return $this -> bll -> get_chartBrandMostVisited_BLL();
        }

        public function get_chartBodyworkMostVisited() {
            return $this -> bll -> get_chartBodyworkMostVisited_BLL();
        }

        public function get_chartUserRegistration() {
            return $this -> bll -> get_chartUserRegistration_BLL();
        }

        public function get_chartFuelMostVisited() {
            return $this -> bll -> get_chartFuelMostVisited_BLL();
        }
        
        public function get_dataUsers() {
            return $this -> bll -> get_dataUsers_BLL();
        }

        public function get_deleteUser($args) {
            return $this -> bll -> get_deleteUser_BLL($args);
        }

        public function get_dataOneUser($args) {
            return $this -> bll -> get_dataOneUser_BLL($args);
        }

        public function get_updateUser($args) {
            return $this -> bll -> get_updateUser_BLL($args);
        }

        public function get_cantUsers() {
            return $this -> bll -> get_cantUsers_BLL();
        }

        public function get_cantBusquedasDiarias() {
            return $this -> bll -> get_cantBusquedasDiarias_BLL();
        }
    }
?>