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
		
		public function get_checkStock_BLL($args) {
			$quantityStock =  $this -> dao -> search_data_get_checkStock($this -> db, $args);
			if (!empty($quantityStock)) {
                return $quantityStock;
            }
            else {
                return "error ctrl checkStock";
            }
		}

		public function get_addToCartFromDetails_BLL($args) {
			$resAddCart =  $this -> dao -> search_data_get_addToCartFromDetails($this -> db, $args[0],$args[1], $args[2]);

			if (!empty($resAddCart)) {
                return $resAddCart;
            }
            else {
                return "error ctrl addToCartFromDetails";
            }
		}

		public function get_loadCart_BLL($args) {
			$resultLoadCart = $this -> dao -> search_data_get_loadCart($this -> db, $args);

			if(!empty($resultLoadCart)){
                return $resultLoadCart;
            }else {
                return "error ctrl loadCart";
            }
		}

		public function get_loadDetailsCheckout_BLL($args) {
			$resultCheckoutDetails = $this -> dao -> search_data_get_loadDetailsCheckout($this -> db, $args);

			if(!empty($resultCheckoutDetails)){
                return $resultCheckoutDetails;
            }else {
                return "error ctrl DeleteProduct";
            }
		}

		public function get_changeCart_BLL($args) {
			$resultChangeCart = $this -> dao -> search_data_get_changeCart($this -> db, $args[0],$args[1], $args[2]);

			if(!empty($resultChangeCart)){
                return $resultChangeCart;
            }else {
                return "error ctrl changeCart";
            }
		}

		public function get_removeProduct_BLL($args) {
			$resultDeleteProduct = $this -> dao -> search_data_get_removeProduct($this -> db, $args[0],$args[1]);

			if(!empty($resultDeleteProduct)){
                return $resultDeleteProduct;
            }else {
                return "error ctrl changeCart";
            }
		}

		public function get_checkout_BLL($args) {
			$resultCheckout = $this -> dao -> search_data_get_checkout($this -> db, $args);

			if(!empty($resultCheckout)){
                return $resultCheckout;
            }else {
                return "error ctrl resultCheckout";
            }
		}
		
	}
?>