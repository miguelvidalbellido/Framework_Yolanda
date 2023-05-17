<?php

    class controller_search {

        function searchbrands(){
            echo json_encode(common::load_model('search_model', 'get_brands'));
        }
        function searchAllModel(){
            echo json_encode(common::load_model('search_model', 'get_allmodel'));
        }
        function searchModelsBrand(){
            echo json_encode(common::load_model('search_model', 'get_searchModelsBrand', $_POST['brand']));
        }
        function searchDataAutocomplete(){
            echo json_encode(common::load_model('search_model', 'get_searchDataAutocomplete', $_POST['arraysdata']));
        }
    }

?>