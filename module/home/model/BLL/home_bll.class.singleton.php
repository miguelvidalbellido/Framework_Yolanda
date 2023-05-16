<?php
    require_once(SITE_ROOT . 'module/home/model/DAO/home_dao.class.singleton.php');
	require_once(MODEL_PATH . 'db.class.singleton.php');

	class home_bll {
		private $dao;
		private $db;
		static $_instance;

		function __construct() {
			$this -> dao = home_dao::getInstance();
			$this -> db = db::getInstance();
		}

		public static function getInstance() {
			if (!(self::$_instance instanceof self)) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}
		
		public function get_fuel_BLL() {
			return $this -> dao -> select_data_fuel($this -> db);
		}
		
		public function get_categories_BLL() {
			return $this -> dao -> select_data_category($this -> db);
		}

		public function get_brands_BLL() {
			return $this -> dao -> select_data_brands($this -> db);
		}
		public function get_more_visited_BLL() {
			return $this -> dao -> select_data_moreVisited($this -> db);
		}
	}
?>