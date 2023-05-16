<?php
    require_once(SITE_ROOT . 'module/shop/model/DAO/shop_dao.class.singleton.php');
	require_once(MODEL_PATH . 'db.class.singleton.php');

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

    }
?>