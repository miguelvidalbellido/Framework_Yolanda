<?php
    class Conf {
        private $_userdb;
        private $_passdb;
        private $_hostdb;
        private $_db;
        static $_instance;

        private function __construct()
        {
            $config = parse_ini_file(MODEL_PATH . "php.ini", true);
            $this->_userdb = $config['db_credentials']['user'];
            $this->_passdb = $config['db_credentials']['pass'];
            $this->_hostdb = $config['db_credentials']['host'];
            $this->_db = $config['db_credentials']['db'];
        }

        private function __clone()
        {
            
        }

        // Si hay una instancia abierta la reutiliza, sino crea una (new self() -> llama a su propio constructor)
        public static function getInstance() {
            if(!(self::$_instance instanceof self))
                self::$_instance = new self();
            return self::$_instance;
            // return "hola";
        }

        // GETTERS
        public function getUserDB() {
            $var = $this->_userdb;
            return $var;
        }

        public function getPassDB() {
            $var = $this->_passdb;
            return $var;
        }

        public function getHostDB() {
            $var = $this->_hostdb;
            return $var;
        }

        public function getDB() {
            $var = $this->_db;
            return $var;
        }
    }
?>