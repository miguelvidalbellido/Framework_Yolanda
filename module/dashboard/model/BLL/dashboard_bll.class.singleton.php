<?php
    // require_once(SITE_ROOT . 'module/dashboard/model/DAO/dashboard_dao.class.singleton.php');
	// require_once(MODEL_PATH . 'db.class.singleton.php');

	class dashboard_bll {
		private $dao;
		private $db;
		static $_instance;

		function __construct() {
			$this -> dao = dashboard_dao::getInstance();
			$this -> db = db::getInstance();
		}

		public static function getInstance() {
			if (!(self::$_instance instanceof self)) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}
		
		public function get_chartBrandMostVisited_BLL() {
			$brandVisits = $this -> dao -> select_data_chartBrandMostVisited($this -> db);

            if(!empty($brandVisits)){
                return $brandVisits; 
            }
            else{
                return "error";
            }
		}

        public function get_chartBodyworkMostVisited_BLL() {
			$bodyworkVisits = $this -> dao -> select_data_chartBodyworkMostVisited($this -> db);

            if(!empty($bodyworkVisits)){
                return $bodyworkVisits; 
            }
            else{
                return "error";
            }
		}

        public function get_chartUserRegistration_BLL() {
			$UserRegistration = $this -> dao -> select_data_chartUserRegistration($this -> db);

            if(!empty($UserRegistration)){
                return $UserRegistration; 
            }
            else{
                return "error";
            }
		}

        public function get_chartFuelMostVisited_BLL() {
			$FuelMostVisited = $this -> dao -> select_data_chartFuelMostVisited($this -> db);

            if(!empty($FuelMostVisited)){
                return $FuelMostVisited; 
            }
            else{
                return "error";
            }
		}

        public function get_dataUsers_BLL() {
			$dataUsers = $this -> dao -> select_data_dataUsers($this -> db);

            if(!empty($dataUsers)){
                return $dataUsers; 
            }
            else{
                return "error";
            }
        }

        public function get_deleteUser_BLL($args) {
            $deleteUser = $this -> dao -> select_data_deleteUser($this -> db, $args);

            if(!empty($deleteUser)){
                return $deleteUser; 
            }
            else{
                return "error";
            }
        }
        
        public function get_dataOneUser_BLL($args) {
            $dataOneUser = $this -> dao -> select_data_dataOneUser($this -> db, $args);

            if(!empty($dataOneUser)){
                return $dataOneUser; 
            }
            else{
                return "error";
            }
        }

        public function get_updateUser_BLL($args) {
            // STRING TO ARRAY
            // $delimiter = "&";
            // $delimiter_intero = '=';
            // $res = explode($delimiter, $args);
            // $resultado = array();
            // foreach ($res as $elemento) {
            //     array_push($resultado, explode($delimiter_intero, $elemento));
            // } 

            // Verificamos el usuario
            $existsUser = $this -> dao -> checkUsernameUpdate($this -> db, $args[0], $args[1]);
            if($existsUser[0]['existe'] == 1){ return 'Username_no_valido'; exit; }

            // Verificamos el email
            $existsMail = $this -> dao -> checkEmailUpdate($this -> db, $args[2], $args[3]);
            if($existsMail[0]['existe_mail'] == 1){ return 'Email_no_valido'; exit; }

            // Verificamos la contraseña
            if($args[4] == $args[5]) {
                $password = $args[5];
            } else {
                $password = password_hash($args[4], PASSWORD_DEFAULT, ['cost' => 12]);
            }
            
            // Aplicamos las modificaciones
            return $this -> dao -> updateUser($this -> db, $args[1], $args[0], $args[2], $password, $args[6]);
        }

        public function get_cantUsers_BLL() {
            return $this -> dao -> select_data_get_cantUsers($this -> db);
        } 

        public function get_cantBusquedasDiarias_BLL() {
            return $this -> dao -> select_data_get_cantBusquedasDiarias($this -> db);
        }
	}
?>