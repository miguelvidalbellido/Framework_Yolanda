<?php
    class shopCart_dao {
        static $_instance;

        private function __construct() {
        }

        public static function getInstance() {
            if(!(self::$_instance instanceof self)){
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        
        // public function select_data_fuel($db) {
        //     $sql = "SELECT * FROM type_motor";
        //     $stmt = $db -> execute($sql);
        //     return $db -> list($stmt);
        // }
        // public function select_data_category($db) {
        //     $sql = "SELECT * FROM bodywork";
        //     $stmt = $db -> execute($sql);
        //     return $db -> list($stmt);
        // }
        // public function select_data_brands($db) {
        //     $sql = "SELECT * FROM `brand` ";
        //     $stmt = $db -> execute($sql);
        //     return $db -> list($stmt);
        // }
        // public function select_data_moreVisited($db) {
        //     $sql = "SELECT * FROM `more_visit_cars`  ";
        //     $stmt = $db -> execute($sql);
        //     return $db -> list($stmt);
        // }
    }
?>