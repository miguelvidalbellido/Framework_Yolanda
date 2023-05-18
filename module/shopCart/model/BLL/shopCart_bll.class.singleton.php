<?php
    require_once(SITE_ROOT . 'module/shopCart/model/DAO/shopCart_dao.class.singleton.php');
	require_once(MODEL_PATH . 'db.class.singleton.php');

	class shopCart_bll {
		private $dao;
		private $db;
		static $_instance;

		function __construct() {
			$this -> dao = shopCart_dao::getInstance();
			$this -> db = db::getInstance();
		}

		public static function getInstance() {
			if (!(self::$_instance instanceof self)) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}
		
		
	}
?>