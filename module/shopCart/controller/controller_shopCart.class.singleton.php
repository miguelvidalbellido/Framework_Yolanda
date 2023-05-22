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

        function checkStock() {
            echo json_encode(common::load_model('shopCart_model', 'get_checkStock', $_POST['id_car']));
        }

        function addToCartFromDetails() {
            echo json_encode(common::load_model('shopCart_model', 'get_addToCartFromDetails', [ $_POST['username'], $_POST['cod_car'], $_POST['quantity']]));
        }

        function loadCart() {
            // echo json_encode($_POST['username']);
            echo json_encode(common::load_model('shopCart_model', 'get_loadCart', $_POST['username']));
        }

        function loadDetailsCheckout() {
            echo json_encode(common::load_model('shopCart_model', 'get_loadDetailsCheckout', $_POST['username']));
        }

        function changeCart() {
            echo json_encode(common::load_model('shopCart_model', 'get_changeCart', [ $_POST['username'], $_POST['cod_car'], $_POST['quantity']]));
        }

        function removeProduct() {
            echo json_encode(common::load_model('shopCart_model', 'get_removeProduct', [ $_POST['username'], $_POST['cod_car'] ]));
        }

        function checkout() {
            echo json_encode(common::load_model('shopCart_model', 'get_checkout',  $_POST['username'] ));
            
        }


    }

?>