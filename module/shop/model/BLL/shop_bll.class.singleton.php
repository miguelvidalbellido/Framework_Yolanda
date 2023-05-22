<?php
    // require_once(SITE_ROOT . 'module/shop/model/DAO/shop_dao.class.singleton.php');
	// require_once(MODEL_PATH . 'db.class.singleton.php');

    class shop_bll {
        private $dao;
		private $db;
		static $_instance;

		function __construct() {
			$this -> dao = shop_dao::getInstance();
			$this -> db = db::getInstance();
		}

		public static function getInstance() {
			if (!(self::$_instance instanceof self)) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}

        public function get_cars_BLL($args) {
			// return $args;
            return $this -> dao -> select_data_cars($this -> db, $args[0], $args[1]);
        }

		public function get_count_all_cars_BLL() {
            return $this -> dao -> select_data_count_all_cars($this -> db);
		}

		public function get_count_cars_filter_BLL($args) {
			return $this -> dao -> select_data_count_filter_cars($this -> db, $args);
		}

		public function get_details_car_BLL($args) {
			$this -> dao -> search_data_visits($this -> db, $args);
			$rdo = array();
			$rdo[0][] =  $this -> dao -> search_data_details_car($this -> db, $args);
			$rdo[1][] = $this -> dao -> search_data_img_details_car($this -> db, $args);
			return $rdo;
		}

		// LATERAL MENU
		public function get_lateral_menu_BLL() {
			$rdo = array();
            $rdo[0] = $this -> dao -> search_data_fuel($this -> db);
            $rdo[1][] = $this -> dao -> search_data_brand($this -> db);
			$rdo[2][] = $this -> dao -> search_data_shifter($this -> db);
			$rdo[3][] = $this -> dao -> search_environmental_label_brand($this -> db);
            return $rdo;
		}

		public function get_cars_filter_BLL($args) {
			return $this -> dao -> search_data_filters($this -> db, $args[0], $args[1], $args[2]);
		}

		public function get_similar_cars_BLL($args) {
			return $this -> dao -> search_data_similar_cars($this -> db, $args[0]);
		}

		public function get_seeLastFilters_BLL($args) {
			return $this -> dao -> search_data_seeLastFilters($this -> db, $args);
		}

		public function get_filters_token_BLL($args) {
			$this -> dao -> saveFilters($this -> db, $args[0]); // Almacenamos en history
			return $this -> dao -> search_data_filters($this -> db, $args[0][1], $args[1], $args[2]);
		}

		public function get_likes_BLL($args) {
			return $this -> dao -> search_data_get_likes($this -> db, $args[0], $args[1]);
		}

		public function get_likesUser_BLL($args) {
			return $this -> dao -> search_data_get_likesUser($this -> db, $args);
		}
    }
?>