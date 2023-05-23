<?php
    // require_once(SITE_ROOT . 'module/auth/model/DAO/auth_dao.class.singleton.php');
	// require_once(MODEL_PATH . 'db.class.singleton.php');

	class auth_bll {
		private $dao;
		private $db;
		static $_instance;

		function __construct() {
			$this -> dao = auth_dao::getInstance();
			$this -> db = db::getInstance();
		}

		public static function getInstance() {
			if (!(self::$_instance instanceof self)) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}
		
		public function get_register_BLL($args) {
            $hashed_pass = password_hash($args[2], PASSWORD_DEFAULT, ['cost' => 12]);
            $hashavatar = md5(strtolower(trim($args[1]))); 
            $avatar = "https://i.pravatar.cc/500?u=$hashavatar";
            $token_email = common::generate_Token_secure(20);
			$rdo = $this -> dao -> select_data_register($this -> db, $args[0], $args[1], $hashed_pass, $args[3], $token_email, $avatar);

            if($rdo[0][0]['resultado'] == "ok_insert") {
                $message = [ 'type' => 'validate', 
                				    'token' => $token_email, 
                					'toEmail' =>  $args[1]];
                $email = json_decode(mail::send_email($message), true); 
                return $rdo;
            }else {
                return $rdo;
            }

            // Comprobe si el return es ok i faig el email
            // $message = [ 'type' => 'validate', 
			// 					'token' => $token_email, 
			// 					'toEmail' =>  $args[0]];
			// 	$email = json_decode(mail::send_email($message), true); 
		}
        public function get_login_BLL($args) {
            $response = Array();
            $response = ['error_username','error_password','login_ok', 'unverified_email'];

			$rdo = $this -> dao -> select_data_login($this -> db, $args[0], $args[1]);
            if($rdo[0][0]['resultado'] == "unverified_email"){
                return $response[3];
            } else if($rdo[0][0]['resultado'] == "error_username"){ 
                return $response[0];
                exit;
            } else if(password_verify($args[1], $rdo[0][0]['resultado'])) {
                $token = middleware::create_token_refresh($args[0]);
                $_SESSION['username'] = $args[0];
                $_SESSION['tiempo'] = time();
                $token_large = middleware::create_token($args[0]);
                $output = [
                    'token_large' => $token_large,
                    'token_refresh' => $token,
                ];
                return $output;
                exit;
            } else {
                return $response[1];
                exit;
            }

		}

        public function get_dataUser_BLL($args) {
            $credentials = middleware::decode_token($args);
			return $this -> dao -> select_data_user($this -> db, $credentials['username']);
		}

        public function get_logout_BLL() {
            unset($_SESSION['username']);
            unset($_SESSION['tiempo']);
            session_destroy();

            return 'Done';
        }

        // ACTIVITY USER
        public function get_control_user_BLL($args) {
            $parseToken = middleware::decode_token($args);

            if($parseToken['exp'] < time()){
                return 'wrongUser';
                exit;
            }
    
            if(isset($_SESSION['username']) && ($_SESSION['username']) == $parseToken['username']){
                return 'correctUser';
                exit;
            } else {
                return 'wrongUser';
                exit;
            }
        }

        public function get_checkExpirationTokenRefresh_BLL($args) {
            $tokenRefreshDec = middleware::decode_token($args[0]);
            $tokenLargeDec = middleware::decode_token($args[1]);
    
            
            // Comprobamos si Token Refresh ha caducado
            if ($tokenRefreshDec['exp'] < time()) {
                if ($tokenLargeDec['exp'] > time()) {
                    // Devolvemos que hay que generar token nuevo
                    return "ExpiredJWTRefresh";
                } else {
                    // Devolvemos que han caducado los dos y hay que hacer logout
                    return "ExpiredJWTToken";
                }
            } else {
                return "NotExpiredJWTRefresh";
            }
        }

        public function get_controlActivity_BLL($args) {
            if (!isset($_SESSION["tiempo"])) {
                return 'inactivo';
                exit();
            } else {
                if ((time() - $_SESSION["tiempo"]) >= 1800) { //1800s=30min
                    return 'inactivo';
                    exit();
                } else {
                    return 'activo';
                    exit();
                }
            }
        }

        public function get_changeTokenRefres_BLL($tokenOld) {
            // Comprobamos que el usuario del token es el mismo que el de la session
            $parseToken = middleware::decode_token($tokenOld);
            if(isset($_SESSION['username']) && ($_SESSION['username']) == $parseToken['username']){
                $token = middleware::create_token_refresh($_SESSION['username']);
                return $token;
                exit;
            } else {
                return "wrongUser";
                exit;
            }
        }

        public function get_verifyAccount_BLL($token_email) {
            return $this -> dao -> select_verifyAccount($this -> db, $token_email);
            // return $token_email;
        }

        public function get_recoverPassword_BLL($username) {
            // Deshabilitar inicio de sesion y añadir token_email
            $token_email = common::generate_Token_secure(20);
            $rdo = $this -> dao -> disableAccount($this -> db, $username, $token_email);
            

            if($rdo == true) {
                $message = [ 'type' => 'recover', 
                				    'token' => $token_email, 
                					'toEmail' =>  $username];
                $email = json_decode(mail::send_email($message), true); 
                return $rdo;
            }else {
                return $rdo;
            }
        }

        public function get_changePassword_BLL($args) {
            $hashed_pass = password_hash($args[1], PASSWORD_DEFAULT, ['cost' => 12]);

            return $this -> dao -> changePassword($this -> db, $hashed_pass, $args[0]);
            // return $args;
        }
	}
?>