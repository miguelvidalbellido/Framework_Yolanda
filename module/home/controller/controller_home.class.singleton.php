<?php

@session_start();

    class controller_home {

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
            // echo "hemos entrado a home";s
            common::load_view('top_page_home.html', 'C:/xampp/htdocs/FW_coches_net/module/home/view/' . 'home.html');
        }
        function brands(){
            echo json_encode(common::load_model('home_model', 'get_brands'));
        }
        function categories(){
            echo json_encode(common::load_model('home_model', 'get_categories'));
        }
        function fuel(){
            echo json_encode(common::load_model('home_model', 'get_fuel'));
        }
        function more_visited(){
            echo json_encode(common::load_model('home_model', 'get_more_visited'));
        }
    }

?>