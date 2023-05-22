<?php
    // require_once(SITE_ROOT . 'module/search/model/DAO/search_dao.class.singleton.php');
	// require_once(MODEL_PATH . 'db.class.singleton.php');

	class search_bll {
		private $dao;
		private $db;
		static $_instance;

		function __construct() {
			$this -> dao = search_dao::getInstance();
			$this -> db = db::getInstance();
		}

		public static function getInstance() {
			if (!(self::$_instance instanceof self)) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}

		public function get_brands_BLL() {
			return $this -> dao -> select_data_brands($this -> db);
		}

        public function get_allModel_BLL() {
			return $this -> dao -> select_data_all_model($this -> db);
		}

        public function get_searchModelsBrand_BLL($args) {
			return $this -> dao -> select_data_searchModelsBrand_model($this -> db, $args);
		}
        public function get_searchDataAutocomplete_BLL($args) {
            return $this -> dao -> select_data_searchDataAutocomplete($this -> db, $args);
        }
	}
?>