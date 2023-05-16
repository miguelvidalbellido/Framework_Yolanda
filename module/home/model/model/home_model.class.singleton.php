<?php
    require_once(SITE_ROOT . 'module/home/model/BLL/home_bll.class.singleton.php');
    class home_model {

        private $bll;
        static $_instance;
        
        function __construct() {
            $this -> bll = home_bll::getInstance();
        }

        public static function getInstance() {
            if (!(self::$_instance instanceof self)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        // public function get_carrusel() {
        //     return $this -> bll -> get_carrusel_BLL();
        // }

        public function get_categories() {
            return $this -> bll -> get_categories_BLL();
        }

        public function get_brands() {
            // return 'hola car type';
            return $this -> bll -> get_brands_BLL();
        }

        public function get_fuel() {
            return $this -> bll -> get_fuel_BLL();
        }
        public function get_more_visited() {
            return $this -> bll -> get_more_visited_BLL();
        }

        

    }
?>