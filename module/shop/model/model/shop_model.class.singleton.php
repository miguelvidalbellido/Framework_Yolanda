<?php
    // require_once(SITE_ROOT . 'module/shop/model/BLL/shop_bll.class.singleton.php');
    
    class shop_model {
        private $bll;
        static $_instance;
        
        function __construct() {
            $this -> bll = shop_bll::getInstance();
        }

        public static function getInstance() {
            if (!(self::$_instance instanceof self)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function get_cars($args) {
            // return $args;
            return $this -> bll -> get_cars_BLL($args);
        }

        public function count_all_cars() {
            return $this -> bll -> get_count_all_cars_BLL();
        }

        public function count_cars_filter($args) {
            return $this -> bll -> get_count_cars_filter_BLL($args);
        }

        public function load_lateral_menu() {
            return $this -> bll -> get_lateral_menu_BLL();
        }

        public function filters($args) {
            // return $args;
            return $this -> bll -> get_cars_filter_BLL($args);
        }

        public function details_car($args) {
            return $this -> bll -> get_details_car_BLL($args);
        }

        public function similar_cars($args) {
            return $this -> bll -> get_similar_cars_BLL($args);
        }

        public function seeLastFilters($args) {
            return $this -> bll -> get_seeLastFilters_BLL($args);
        }

        public function filters_token($args) {
            // return $args[0][0];
            return $this -> bll -> get_filters_token_BLL($args);
        }

        public function get_likes($args) {
            return $this -> bll -> get_likes_BLL($args);
        }

        public function get_likesUser($args) {
            return $this -> bll -> get_likesUser_BLL($args);
        }

    }
?>