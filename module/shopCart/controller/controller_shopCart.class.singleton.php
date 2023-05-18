<?php

@session_start();

    class controller_shopCart {

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
            common::load_view('top_page_shopCart.html', 'C:/xampp/htdocs/FW_coches_net/module/shopCart/view/' . 'shopCart.html');
        }
    }

?>