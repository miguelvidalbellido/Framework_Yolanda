<?php
    class controller_shop {
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
    }
?>