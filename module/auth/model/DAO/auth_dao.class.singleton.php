<?php
    class auth_dao {
        static $_instance;

        private function __construct() {
        }

        public static function getInstance() {
            if(!(self::$_instance instanceof self)){
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        
        public function select_data_register($db, $username, $email, $passwd, $f_birth) {
            $hashed_pass = password_hash($passwd, PASSWORD_DEFAULT, ['cost' => 12]);
            $hashavatar = md5(strtolower(trim($email))); 
            $avatar = "https://i.pravatar.cc/500?u=$hashavatar";
            $sql = "CALL registerUser('".$username."','".$hashed_pass."','".$f_birth."','".$email."','".$avatar."',@res);";
            $sql .= " SELECT @res AS resultado;";

            return $db -> executeForProcedures($sql);
        }

        public function select_data_login($db, $username, $passwd) {
            $hashed_pass = password_hash($passwd, PASSWORD_DEFAULT, ['cost' => 12]);

            $sql = "CALL loginUserSinPassword('".$username."','".$hashed_pass."',@res);";
            $sql .= "SELECT @res AS resultado;";

            return $db -> executeForProcedures($sql);
        }

        public function select_data_user($db, $username) {
            $sql = "SELECT users.* FROM users WHERE users.username LIKE '".$username."'";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }
    }
?>