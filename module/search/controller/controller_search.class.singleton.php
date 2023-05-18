<?php

    class controller_search {

        static $_instance;
		function __construct() {   

        }

        public static function getInstance() {  /// Crea el constructor si no exixte
            if (!(self::$_instance instanceof self)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

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