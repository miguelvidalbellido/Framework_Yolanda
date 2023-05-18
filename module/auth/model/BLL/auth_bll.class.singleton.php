<?php
    require_once(SITE_ROOT . 'module/auth/model/DAO/auth_dao.class.singleton.php');
	require_once(MODEL_PATH . 'db.class.singleton.php');

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
			return $this -> dao -> select_data_register($this -> db, $args[0], $args[1], $args[2], $args[3]);
		}
        public function get_login_BLL($args) {
            $response = Array();
            $response = ['error_username','error_password','login_ok'];

			$rdo = $this -> dao -> select_data_login($this -> db, $args[0], $args[1]);
            if($rdo[0][0]['resultado'] == "error_username"){ 
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
	}
?>