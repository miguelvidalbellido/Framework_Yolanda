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
                    $email['inputMatter'] = 'Tu cuenta ha sido restringida';
                    $email['inputMessage'] = "<h2>Verifica tu cuenta.</h2><a href='http://localhost/FW_coches_net/auth/view/verify/$email[token]'>Valida tu identidad realizando click en el enlace.</a>";
                    break;
                case 'recover';
                    $email['fromEmail'] = 'bellido.clase@gmail.com';
                    $email['inputEmail'] = 'bellido.clase@gmail.com';
                    $email['inputMatter'] = 'Recuperar contraseña';
                    $email['inputMessage'] = "<h2>Entra en el siguiente enlace para cambiar la contraseña.</h2><h3>En caso de no ser tu no dudes en ponerte en contacto, con el servicio de asistencia de Bellicar</h3><a href='http://localhost/FW_coches_net/auth/view/recover/$email[token]'>Modifica tu contraseña.</a>";
                    break;
                case 'passwd_change_ok';
                    $email['fromEmail'] = 'bellido.clase@gmail.com';
                    $email['inputEmail'] = 'bellido.clase@gmail.com';
                    $email['inputMatter'] = 'Contraseña modificada';
                    $email['inputMessage'] = "<h2>Tu contraseña acaba de ser modificada</h2><h3>En caso de no ser tu no dudes en ponerte en contacto, con el servicio de asistencia de Bellicar</h3><a href='http://localhost/FW_coches_net/home/'>Modifica tu contraseña.</a>";
                    break;
            }
            return self::send_mailgun($email);
        }

        public static function send_mailgun($values){
            $mailgun = parse_ini_file(MODEL_PATH . "php.ini", true);
            $api_key = $mailgun['mailgun_credentials']['api_key'];
            $api_url = $mailgun['mailgun_credentials']['api_url'];


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
