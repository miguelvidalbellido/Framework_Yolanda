<?php
    class search_dao {
        static $_instance;

        private function __construct() {
        }

        public static function getInstance() {
            if(!(self::$_instance instanceof self)){
                self::$_instance = new self();
            }
            return self::$_instance;
        }
        public function select_data_brands($db) {
            $sql = "SELECT * FROM `brand` ";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function select_data_all_model($db) {
            $sql = "SELECT * FROM `model` ";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function select_data_searchModelsBrand_model($db, $brandFilter) {
            $sql = "SELECT DISTINCT m.*
            FROM model m, brand b
            WHERE m.cod_brand = b.cod_brand AND b.description LIKE '$brandFilter'";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function select_data_searchDataAutocomplete($db,$arraysdata) {
            $sql = "SELECT DISTINCT  kk.description_population
                FROM (SELECT  p.description 'description_population', b.description 'description_brand', m.description 'description_model'
                    FROM car c, population p, model m, brand b
                    WHERE c.zip_code = p.zip_code AND m.cod_model = c.cod_model AND b.cod_brand = m.cod_brand) kk";
                
                for ($i=0; $i < count($arraysdata); $i++){
                    $i==0 ? $sql.= " WHERE kk." . $arraysdata[$i][0] . " LIKE '" . $arraysdata[$i][1]. "%'" : $sql.= " AND kk." . $arraysdata[$i][0] . " LIKE '" . $arraysdata[$i][1] . "'";
                }
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

    }
?>