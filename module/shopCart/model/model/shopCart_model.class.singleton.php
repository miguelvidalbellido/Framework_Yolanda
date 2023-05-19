<?php
    require_once(SITE_ROOT . 'module/shopCart/model/BLL/shopCart_bll.class.singleton.php');
    class shopCart_model {

        private $bll;
        static $_instance;
        
        function __construct() {
            $this -> bll = shopCart_bll::getInstance();
        }

        public static function getInstance() {
            if (!(self::$_instance instanceof self)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function get_checkStock($args) {
            return $this -> bll -> get_checkStock_BLL($args);
        }

        public function get_addToCartFromDetails($args) {
            return $this -> bll -> get_addToCartFromDetails_BLL($args);
        }

        public function get_loadCart($args) {
            return $this -> bll -> get_loadCart_BLL($args);
        }

        public function get_loadDetailsCheckout($args) {
            return $this -> bll -> get_loadDetailsCheckout_BLL($args);
        }

        public function get_changeCart($args) {
            return $this -> bll -> get_changeCart_BLL($args);
        }

        public function get_removeProduct($args) {
            return $this -> bll -> get_removeProduct_BLL($args);
        }

        public function get_checkout($args) {
            return $this -> bll -> get_checkout_BLL($args);
        }
    }
?>