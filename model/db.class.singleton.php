<?php
    class db{
        // Atributtes
        private $server;
        private $user;
        private $password;
        private $database;
        private $link;
        private $stmt;
        private $array;
        static $_instance;

        private function __construct()
        {
            $this->setConnection();
            $this->connect();
        }

        private function setConnection() {
            require_once 'Conf.class.singleton.php';
            $conf = Conf::getInstance();

            $this->server = $conf->getHostDB();
            $this->database = $conf->getDB();
            $this->user = $conf->getUserDB();
            $this->password = $conf->getPassDB();
        }

        private function __clone()
        {
            
        }

        public static function getInstance() {
            if(!(self::$_instance instanceof self))
                self::$_instance = new self();
            return self::$_instance;
        }

        private function connect() {
            // $this->link = new mysqli('localhost', 'root', '');
            $this->link = new mysqli($this->server, $this->user, $this->password);
            // $this->link->select_db('coches_net');
            $this->link->select_db($this->database);

        }

        public function execute($sql) {
            $this->stmt = $this->link->query($sql);
            return $this -> stmt;
        }

        public function executeForProcedures($sql) {
                $this->stmt = $this->link->multi_query($sql);
                
                $results = [];
                do {
                    if ($result = mysqli_store_result($this->link)) {
                        $rows = [];
                        while ($row = mysqli_fetch_assoc($result)) {
                            $rows[] = $row;
                        }
                        $results[] = $rows;
                        mysqli_free_result($result);
                    }
                } while (mysqli_next_result($this->link));
                
                return $results;
            }

        public function list($stmt) {
            $this->array = array();
            while ($row = $stmt->fetch_array(MYSQLI_ASSOC)) {
                array_push($this->array, $row);
            }
            return $this -> array;
        }
    }
?>