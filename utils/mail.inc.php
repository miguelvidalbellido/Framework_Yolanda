<?php
    class mail {

        public static function test(){
            echo json_encode("Hemos entrado al test");
        }
        public static function send_email($email) {
            switch ($email['type']) {
                case 'contact';
                    $email['toEmail'] = 'bellido.clase@gmail.com';
                    $email['fromEmail'] = 'bellidel.info@gmail.com';
                    $email['inputEmail'] = 'bellidel.info@gmail.com';
                    $email['inputMatter'] = 'Email verification';
                    $email['inputMessage'] = "<h2>Email verification.</h2><a href='http://localhost/FW_coches_net/index.php?module=contact&op=view'>Click here for verify your email.</a>";
                    break;
                case 'validate';
                    $email['fromEmail'] = 'bellidel.info@gmail.com';
                    $email['inputEmail'] = 'bellidel.info@gmail.com';
                    $email['inputMatter'] = 'Email verification';
                    $email['inputMessage'] = "<h2>Email verification.</h2><a href='http://localhost/FW_coches_net/index.php?module=contact&op=view'>Click here for verify your email.</a>";
                    break;
                case 'recover';
                    $email['fromEmail'] = 'bellido.clase@gmail.com';
                    $email['inputEmail'] = 'bellido.clase@gmail.com';
                    $email['inputMatter'] = 'Recover password';
                    $email['inputMessage'] = "<a href='http://localhost/FW_coches_net/index.php?module=contact&op=view'>Click here for recover your password.</a>";
                    break;
            }
            return self::send_mailgun($email);
        }

        public static function send_mailgun($values){
            $mailgun = parse_ini_file(MODEL_PATH . "php.ini", true);
            $api_key = $mailgun['mailgun_credentials']['api_key'];
            $api_url = $mailgun['mailgun_credentials']['api_url'];

            // echo json_encode($values);

            // $api_key = 'f491add11b5010cad988d8c4b460fd1e-102c75d8-d0471a18';
            // $api_url = 'https://api.mailgun.net/v3/sandbox58b45662302e48728242aa6d110275f0.mailgun.org/messages';

            $config = array();
            $config['api_key'] = $api_key; 
            $config['api_url'] = $api_url;

            $message = array();
            $message['from'] = $values['fromEmail'];
            // $message['to'] = $values['toEmail'];
            $message['to'] = 'bellido.clase@gmail.com';
            $message['h:Reply-To'] = $values['inputEmail'];
            $message['subject'] = $values['inputMatter'];
            $message['html'] = $values['inputMessage'];
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $config['api_url']);
            curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
            curl_setopt($ch, CURLOPT_USERPWD, "api:{$config['api_key']}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch, CURLOPT_POST, true); 
            curl_setopt($ch, CURLOPT_POSTFIELDS,$message);
            // echo json_encode($ch);
            $result = curl_exec($ch);
            curl_close($ch);
            return $result;
        }
        
    }