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

        
        public function search_data_get_checkStock($db, $cod_car) {
            $sql = "SELECT quantity FROM stock WHERE id_car = $cod_car";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function search_data_get_addToCartFromDetails($db, $username, $cod_car, $quantity) {
            $sql = "CALL addToCartDetails('$username', $cod_car, $quantity, @res);";
            $sql .= "SELECT @res AS 'resultado';";

            return $db -> executeForProcedures($sql);
        }

        public function search_data_get_loadCart($db, $username) {
            $sql = "SELECT tc.*, c.price, b.*, m.*, img.url_image
            FROM temporal_cart tc, car c, model m, brand b, image img
            WHERE tc.cod_car = c.cod_car AND m.cod_model = c.cod_model AND m.cod_brand = b.cod_brand AND img.chassis_number = c.chassis_number AND username LIKE '$username' AND img.url_image LIKE '%prtd-%' ;";
            
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function search_data_get_loadDetailsCheckout($db, $username) {
            $sql = "SELECT SUM(tmp.total_unitario) AS 'total_carrito'
                    FROM (SELECT tc.quantity * c.price AS 'total_unitario'
                            FROM temporal_cart tc, car c
                            WHERE tc.cod_car = c.cod_car AND tc.username LIKE '$username') AS tmp";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function search_data_get_changeCart($db, $username, $cod_car, $quantity) {
            $sql = "CALL changeCart($cod_car, '$username', $quantity, @res);";

            $sql .= "SELECT @res AS 'resultado';";
            return $db -> executeForProcedures($sql);

        }

        public function search_data_get_removeProduct($db, $username, $cod_car) {
            $sql = "DELETE FROM temporal_cart WHERE username LIKE '$username' AND cod_car = $cod_car";
            return $db -> execute($sql);
        }

        public function search_data_get_checkout($db, $username) {
            $sql = "CALL checkout('$username', @res);";

            $sql .= "SELECT @res AS 'resultado';";
            return $db -> executeForProcedures($sql);

        }
    }
?>