<?php
    // require_once(SITE_ROOT . 'module/search/model/BLL/search_bll.class.singleton.php');
    class search_model {

        private $bll;
        static $_instance;
        
        function __construct() {
            $this -> bll = search_bll::getInstance();
        }

        public static function getInstance() {
            if (!(self::$_instance instanceof self)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function get_brands() {
            return $this -> bll -> get_brands_BLL();
        }

        public function get_allmodel() {
            return $this -> bll -> get_allModel_BLL();
        }

        public function get_searchModelsBrand($args) {
            return $this -> bll -> get_searchModelsBrand_BLL($args);
        }

        public function get_searchDataAutocomplete($args) {
            return $this -> bll -> get_searchDataAutocomplete_BLL($args);
        }
    }
?>