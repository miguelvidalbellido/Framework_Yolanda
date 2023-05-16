<?php
	class controller_contact {
		
		function view(){
			// echo "hola";
			common::load_view('top_page_contact.html', VIEW_PATH_CONTACT . 'contact_list.html');
		}
		
		function send_contact_us(){
			// echo json_encode("ESTAMOS DENTRO DE send_contact_us");
			$message = ['type' => 'contact',
						'inputName' => $_POST['name'], 
						'fromEmail' => $_POST['email'], 
						'inputMatter' => $_POST['matter'], 
						'inputMessage' => $_POST['message']];
			// $email = json_decode(mail::test(), true);
			$email = json_decode(mail::send_email($message), true);
			if (!empty($email)) {
				echo json_encode('Done!');
				return;  
			} else {
				echo json_encode('Error!');
			}
		}
	}
?>
