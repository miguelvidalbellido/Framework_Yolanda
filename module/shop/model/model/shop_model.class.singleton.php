<?php
    require_once(SITE_ROOT . 'module/shop/model/BLL/shop_bll.class.singleton.php');
    
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

    }
?>