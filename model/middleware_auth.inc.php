<?php
    require_once 'jwt.class.php';

    class middleware{

    public static function decode_token($token){
        $jwt = parse_ini_file(MODEL_PATH . "php.ini", true);
        $secret = $jwt['jwt_credentials']['secret'];
    
        $JWT = new JWT;
        $token_dec = $JWT->decode($token, $secret);
        $rt_token = json_decode($token_dec, TRUE);
        return $rt_token;
    }
    
    public static function create_token($username){
        $jwt = parse_ini_file(MODEL_PATH . "php.ini", true);
        $header = $jwt['jwt_credentials']['header'];
        $secret = $jwt['jwt_credentials']['secret'];
        $payload = '{"iat":"' . time() . '","exp":"' . time() + (14400) . '","username":"' . $username . '"}';
    
        $JWT = new JWT;
        $token = $JWT->encode($header, $payload, $secret);
        return $token;
    }

    public static function create_token_refresh($username){
        $jwt = parse_ini_file(MODEL_PATH . "php.ini", true);
        $header = $jwt['jwt_credentials']['header'];
        $secret = $jwt['jwt_credentials']['secret'];
        $payload = '{"iat":"' . time() . '","exp":"' . time() + (30) . '","username":"' . $username . '"}'; // EL tiempo para 1 hora es 600
    
        $JWT = new JWT;
        $token = $JWT->encode($header, $payload, $secret);
        return $token;
    }
}
?>