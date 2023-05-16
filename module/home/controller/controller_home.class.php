<?php

    class controller_home {
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