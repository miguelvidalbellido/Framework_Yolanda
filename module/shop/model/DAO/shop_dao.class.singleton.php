<?php
    class shop_dao {
        static $_instance;

        private function __construct() {
        }

        public static function getInstance() {
            if(!(self::$_instance instanceof self)){
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        
        public function select_data_cars($db, $limit, $offset) {
            $sql = "SELECT kk.*
            FROM tabla_filtros kk
            LIMIT $limit, $offset;";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function select_data_count_all_cars($db) {
            $sql = "CALL count_all_cars(@cant_coches); ";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function select_data_count_filter_cars($db, $args) {
            $sql = "SELECT COUNT(*) as 'cant_coches'
            FROM tabla_filtros kk";

            for ($i=0; $i < count($args); $i++){
                if($args[$i][0] === 'ORDER BY'){
                    $sql.= " ORDER BY kk.". $args[$i][1] ;
                }else {
                    if ($i==0){
                        $sql.= " WHERE kk." . $args[$i][0] . " LIKE '" . $args[$i][1]. "'";
                    }else{
                        $sql.= " AND kk." . $args[$i][0] . " LIKE '" . $args[$i][1] . "'";
                    }
                }
            }

            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        // LATERAL MENU
        public function search_data_fuel($db) {
            $sql = "SELECT t.cod_fuel, t.description AS 'type_fuel'
            FROM type_motor t ";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function search_data_brand($db) {
            $sql = "SELECT b.cod_brand, b.description AS 'brand_name'
            FROM brand b; ";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function search_data_shifter($db) {
            $sql = "SELECT s.cod_shifter, s.description AS 'type_shifter' 
            FROM shifter s;";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function search_environmental_label_brand($db) {
            $sql = "SELECT e.cod_label, e.description AS 'environmental_label'
            FROM environmental_label e";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function search_data_filters($db, $args, $limit, $offset) {
            $sql = "SELECT kk.*
            FROM tabla_filtros kk";

            for ($i=0; $i < count($args); $i++){
                if($args[$i][0] === 'ORDER BY'){
                    $sql.= " ORDER BY kk.". $args[$i][1] ;
                }else {
                    if ($i==0){
                        $sql.= " WHERE kk." . $args[$i][0] . " LIKE '" . $args[$i][1]. "'";
                    }else{
                        $sql.= " AND kk." . $args[$i][0] . " LIKE '" . $args[$i][1] . "'";
                    }
                }
            }
            $sql.=" LIMIT $limit, $offset;";

            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        // DETAILS CAR
        public function search_data_details_car($db, $cod_car) {
            $sql = "SELECT *
            FROM data_details_car ddc
            WHERE ddc.cod_car = $cod_car;";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function search_data_img_details_car($db, $cod_car) {
            $sql = "SELECT i.*
            FROM image i
            WHERE i.url_image NOT LIKE '%/prtd-%' AND i.chassis_number = (SELECT c.chassis_number
            FROM car c
            WHERE c.cod_car = $cod_car)";

            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function search_data_similar_cars($db, $cod_car) {
            $sql = "SELECT DISTINCT kk.*
                    FROM (SELECT c.cod_car, YEAR(c.enrollment_date) AS 'year', c.km, c.publication_date, c.enrollment_date, c.color, c.price, c.power, c.doors , i.url_image AS 'image', b.cod_brand, ty.cod_fuel, c.cod_typemotor,
                    m.description AS 'model', b.description AS 'brand', s.description AS 'state', pr.description AS 'province', ty.description AS 'fuel', sh.description AS 'type_shifter',
                    env.description AS 'environmental_label', loc.lat, loc.lon, bw.cod_bodywork, p.description AS 'population', vis.num_visits
                    FROM car c, image i, model m, brand b, state s, population p, province pr, type_motor ty, shifter sh, environmental_label env, location loc, bodywork bw, visits vis
                    WHERE c.chassis_number = i.chassis_number AND m.cod_model = c.cod_model AND b.cod_brand = m.cod_brand AND c.zip_code = p.zip_code AND p.cod_province = pr.cod_province 
                    AND c.cod_typemotor = ty.cod_fuel AND s.cod_state = c.cod_state AND sh.cod_shifter = c.cod_shifter AND env.cod_label = c.cod_label AND c.cod_location = loc.cod_location AND c.cod_bodywork = bw.cod_bodywork AND c.cod_car = vis.cod_car AND i.url_image LIKE '%/prtd-%') as kk, car cf, model mf
                    WHERE cf.cod_car = $cod_car AND cf.cod_model = mf.cod_model AND kk.cod_brand = mf.cod_brand ";

            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        
        }

        public function search_data_seeLastFilters($db, $username) {
            $sql="SELECT his.filters
            FROM historyfilters his
            WHERE his.token_guest LIKE '%$username%' AND his.dateSearch = DATE(NOW())";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

        public function saveFilters($db, $filter) {
            $sql="INSERT INTO `historyfilters` (`token_guest`, `dateSearch`, `filters`) VALUES (' $filter[0] ',NOW(),'";
            for($i=0;$i<count($filter[1]);$i++){
                if($i == count($filter[1]) - 1){
                    $sql.=$filter[1][$i][0].",".$filter[1][$i][1];
                }else if($i == 0){
                    $sql.=$filter[1][$i][0].",".$filter[1][$i][1].":";
                }else{
                    $sql.=$filter[1][$i][0].",".$filter[1][$i][1].":";
                }
            }
            $sql.="' );";

            $stmt = $db -> execute($sql);
        }

        public function search_data_visits($db, $cod_car) {
            $sql = "CALL increment_visits($cod_car);";

            $stmt = $db -> executeForProcedures($sql);
        }

        public function search_data_get_likes($db, $username, $cod_car) {
            $sql = "CALL likeOrDislike('$username',$cod_car,@result); "; 
            $sql.= "SELECT @result AS 'result_operacion';";

            return $db -> executeForProcedures($sql);
        }

        public function search_data_get_likesUser($db, $username) {
            $sql = "SELECT cod_car
                        FROM likes
                        WHERE username LIKE '$username'";
            $stmt = $db -> execute($sql);
            return $db -> list($stmt);
        }

    }
?>