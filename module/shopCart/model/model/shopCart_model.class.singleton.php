<?php
    // require_once(SITE_ROOT . 'module/shopCart/model/BLL/shopCart_bll.class.singleton.php');
    class shopCart_model {

        private $bll;
        static $_instance;
        
        function __construct() {
            // $this -> bll = shopCart_bll::getInstance();
        }

        public static function getInstance() {
            if (!(self::$_instance instanceof self)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        

        

    }
?>