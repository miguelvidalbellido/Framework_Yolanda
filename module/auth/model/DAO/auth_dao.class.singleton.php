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

        
        public function select_data_register($db, $username, $email, $passwd, $f_birth, $token_email, $avatar) {

            $sql = "CALL registerUser('".$username."','".$passwd."','".$f_birth."','".$email."','".$avatar."','".$token_email."',@res);";
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

        public function select_verifyAccount($db, $token_email) {
            $sql = "UPDATE users SET isActive = 1, token_email = '' WHERE token_email LIKE '$token_email'";
            return $db -> execute($sql);
        }

        public function disableAccount($db, $username, $token_email) {
            $sql = "UPDATE users SET isActive = 0, token_email = '$token_email' WHERE username LIKE '$username'";
            // return $sql;
            return $db -> execute($sql);
        }

        public function changePassword($db, $passwd, $token_email) {
            $sql = "UPDATE users SET password = '$passwd', isActive = 1, token_email = '' WHERE token_email LIKE '$token_email'";
            // return $sql;
            return $db -> execute($sql);
        }

    }
?>