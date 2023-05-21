<?php
    require_once(SITE_ROOT . 'module/dashboard/model/DAO/dashboard_dao.class.singleton.php');
	require_once(MODEL_PATH . 'db.class.singleton.php');

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
            $delimiter = "&";
            $delimiter_intero = '=';
            $res = explode($delimiter, $args);
            $resultado = array();
            foreach ($res as $elemento) {
                array_push($resultado, explode($delimiter_intero, $elemento));
            } 

            
            return $args;
        }
	}
?>