<?php
    class shop_dao {
        static $_instance;

        private function __construct() {
        }

        public static function getInstance() {
            if(!(self::$_instance instanceof self)){
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        
        public function select_data_cars($db, $limit, $offset) {
            $sql = "SELECT c.cod_car, YEAR(c.enrollment_date) AS 'year', c.km, c.publication_date, c.color, c.price, c.power, c.doors , i.url_image AS 'image', m.description AS 'model', b.description AS 'brand', s.description AS 'state', pr.description AS 'province', ty.description AS 'fuel', loc.lat, loc.lon
            FROM car c, image i, model m, brand b, state s, population p, province pr, type_motor ty, location loc
            WHERE c.chassis_number = i.chassis_number AND m.cod_model = c.cod_model AND b.cod_brand = m.cod_brand AND c.zip_code = p.zip_code AND p.cod_province = pr.cod_province AND c.cod_typemotor = ty.cod_fuel AND s.cod_state = c.cod_state AND c.cod_location = loc.cod_location AND i.url_image  LIKE '%/prtd-%' 
            LIMIT $limit, $offset;";

            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function select_data_count_all_cars($db) {
            $sql = "CALL count_all_cars(@cant_coches); ";

            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }
    }
?>