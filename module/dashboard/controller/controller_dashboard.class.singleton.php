<?php
@session_start();
	class controller_dashboard {
		static $_instance;
		function __construct() {   

        }

        public static function getInstance() {  /// Crea el constructor si no exixte
            if (!(self::$_instance instanceof self)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

		function view(){
			common::load_view('top_page_dashboard.html', 'C:/xampp/htdocs/FW_coches_net/module/dashboard/view/' . 'dashboard.html');
		}

        /////////// STATS /////////

		function chartBrandMostVisited(){
            echo json_encode(common::load_model('dashboard_model', 'get_chartBrandMostVisited'));
        }

        function chartBodyworkMostVisited(){
            echo json_encode(common::load_model('dashboard_model', 'get_chartBodyworkMostVisited'));
        }

        function chartUserRegistration(){
            echo json_encode(common::load_model('dashboard_model', 'get_chartUserRegistration'));
        }
        
        function chartFuelMostVisited(){
            echo json_encode(common::load_model('dashboard_model', 'get_chartFuelMostVisited'));
        }
        // CONTROL USERS //
        function dataUsers() {
            echo json_encode(common::load_model('dashboard_model', 'get_dataUsers'));
        }
        function deleteUser() {
            echo json_encode(common::load_model('dashboard_model', 'get_deleteUser', $_POST['username']));
        }
        function dataOneUser() {
            echo json_encode(common::load_model('dashboard_model', 'get_dataOneUser', $_POST['username']));
        }
        function updateUser() {
            // echo json_encode($_POST['dataForm']);
            echo json_encode(common::load_model('dsashboard_model', 'get_updateUser', $_POST['dataForm']));
        }
	}
?>