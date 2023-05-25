<?php
    class dashboard_dao {
        static $_instance;

        private function __construct() {
        }

        public static function getInstance() {
            if(!(self::$_instance instanceof self)){
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        
        public function select_data_chartBrandMostVisited($db) {
            $sql = "SELECT b.description, SUM(v.num_visits) AS 'num_visits'
            FROM car c, model m, brand b, visits v
            WHERE c.cod_model = m.cod_model AND m.cod_brand = b.cod_brand AND v.cod_car = c.cod_car
            GROUP BY b.description
            ORDER BY v.num_visits DESC";

            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function select_data_chartBodyworkMostVisited($db) {
            $sql = "SELECT b.description, SUM(v.num_visits) AS 'num_visitas'
            FROM car c, bodywork b, visits v
            WHERE c.cod_bodywork = b.cod_bodywork AND v.cod_car = c.cod_car
            GROUP BY b.cod_bodywork";

            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function select_data_chartUserRegistration($db) {
            $sql = "SELECT u.d_registration, COUNT(u.id_user) AS 'quantity_register'
            FROM users u 
            GROUP BY u.d_registration ASC";

            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function select_data_chartFuelMostVisited($db) {
            $sql = "SELECT t.description, SUM(v.num_visits) AS 'num_visits'
            FROM car c, visits v, type_motor t
            WHERE v.cod_car = c.cod_car AND t.cod_fuel = c.cod_typemotor
            GROUP BY c.cod_typemotor
            ORDER BY v.num_visits DESC";

            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function select_data_dataUsers($db) {
            $sql = "SELECT * FROM users";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function select_data_deleteUser($db, $user) {
            $sql = "DELETE FROM users WHERE username LIKE '$user'";
            return $db -> execute($sql);
        }

        public function select_data_dataOneUser($db, $user) {
            $sql = "SELECT *, (SELECT COUNT(*) FROM historyfilters WHERE token_guest LIKE '_$user%') AS 'num_searchs'
            FROM users 
            WHERE username LIKE '$user' ";
            
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function checkUsernameUpdate($db, $username_new, $username_old) {
            $sql = "SELECT COUNT(*) AS 'existe' FROM users WHERE username LIKE '$username_new' AND username NOT LIKE '$username_old'";

            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function checkEmailUpdate($db, $email_new, $email_old) {
            $sql = "SELECT COUNT(*) AS 'existe_mail' FROM users WHERE email LIKE '$email_new' AND email NOT LIKE '$email_old'";

            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function updateUser($db, $username_old, $username_new, $email , $password, $d_birth){
            $sql = "UPDATE users u SET u.username = '$username_new', u.password = '$password', u.email = '$email', u.d_birth = $d_birth WHERE u.username = '$username_old'; ";
            
            return $db -> execute($sql);
        }

        public function select_data_get_cantUsers($db) {
            $sql = "SELECT COUNT(*) AS 'cantUsers' FROM users";
            
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function select_data_get_cantBusquedasDiarias($db) {
            $sql = "SELECT COUNT(*) AS 'cantSearchs' FROM historyfilters WHERE dateSearch = CURDATE(); ";
            
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }
    }
?>