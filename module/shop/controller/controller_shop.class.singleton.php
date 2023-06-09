<?php

@session_start();

    class controller_shop {

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
            common::load_view('top_page_shop.html', 'C:/xampp/htdocs/FW_coches_net/module/shop/view/' . 'shop.html');
        }
        
        function cars() {
            // echo json_encode($_POST['items_page']);
            echo json_encode(common::load_model('shop_model', 'get_cars', [$_POST['total_prod'], $_POST['items_page']]));
        }

        // PAGINATION
        function count_all_cars() {
            echo json_encode(common::load_model('shop_model', 'count_all_cars'));
        }

        function count_cars_filter() {
            // echo json_encode($_POST['filter']);
            echo json_encode(common::load_model('shop_model', 'count_cars_filter', $_POST['filter']));
        }

        function lateral_menu() {
            echo json_encode(common::load_model('shop_model', 'load_lateral_menu'));
        }
        
        function filter() {
            // echo json_encode($_POST['items_page']);
            echo json_encode(common::load_model('shop_model', 'filters', [$_POST['filter'], $_POST['total_prod'], $_POST['items_page']]));
        }

        function details_car() {
            // echo json_encode($_POST['cod_car']);
            echo json_encode(common::load_model('shop_model', 'details_car', $_POST['cod_car']));
        }

        function similar_cars() {
            // echo json_encode($_POST['id']);
            echo json_encode(common::load_model('shop_model', 'similar_cars', $_POST['id']));
        }

        function seeLastFilters() {
            echo json_encode(common::load_model('shop_model', 'seeLastFilters', $_POST['token']));
        }

        function filters_token() {
            echo json_encode(common::load_model('shop_model', 'filters_token', [ $_POST['filter'], $_POST['total_prod'],$_POST['items_page'] ]));
        }

        function likes() {
            echo json_encode(common::load_model('shop_model', 'get_likes', [ $_POST['token'], $_POST['cod_car']]));
        }

        function likesUser() {
            echo json_encode(common::load_model('shop_model', 'get_likesUser', $_POST['token']));
        }
    }
?>