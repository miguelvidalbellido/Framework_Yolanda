DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `addToCartDetails`(IN `username_E` VARCHAR(255), IN `cod_car_E` INT(255), IN `quantity_E` INT(255), OUT `resultado` VARCHAR(255))
BEGIN
    	# VARIABLES
        DECLARE estaAgregado INT(10);
        DECLARE cantidadAgregado INT(255);
        DECLARE cantidadSumada INT(255);
        DECLARE cantidadStock INT(255);
    	# COMPROBAMOS SI YA LO TIENE AGREGADO AL CARRITO
        SELECT COUNT(*) INTO estaAgregado FROM temporal_cart WHERE username LIKE username_E AND cod_car = cod_car_E;
        
       	IF 1 = estaAgregado THEN
        	# ESTA YA EN EL CARRITO
            # ALMACENAMOS LA SUMA DE CANTIDADES DEL MISMO PRODUCTO
            SELECT quantity INTO cantidadAgregado FROM temporal_cart WHERE username LIKE username_E AND cod_car = cod_car_E;
            SET cantidadSumada = cantidadAgregado + quantity_E;
            
            SELECT quantity INTO cantidadStock FROM stock WHERE id_car = cod_car_E;
            IF cantidadSumada <= cantidadStock THEN
            	UPDATE temporal_cart SET quantity = cantidadSumada WHERE username LIKE username_E AND cod_car = cod_car_E;
            	SET resultado = "addCartOK";
            ELSE
            	SET resultado = "moreQuantityThanStock";
            END IF;
        ELSE
        	# NO ESTA EN EL CARRITO
        	SELECT quantity INTO cantidadStock FROM stock WHERE id_car = cod_car_E;
            IF quantity_E <= cantidadStock THEN
            	INSERT INTO temporal_cart(username,cod_car,quantity) VALUES(username_E,cod_car_E,quantity_E);
            	SET resultado = "addCartOK";
            ELSE
            	SET resultado = "moreQuantityThanStock";
            END IF;
        END IF;
        
    END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `changeCart`( IN cod_car_e INT(255), IN username_e VARCHAR(255), IN quantity_e INT(255), OUT resultado VARCHAR(255))
BEGIN
    	DECLARE stock_total INT(255);
        SELECT quantity INTO stock_total FROM stock WHERE id_car = cod_car_e;
        IF quantity_e <= stock_total THEN
        	UPDATE temporal_cart SET quantity = quantity_e WHERE cod_car = cod_car_e AND username LIKE username_e;
            SET resultado = "UpdateOk";
        ELSE
        	SET resultado = "moreQuantityThanStock";
        END IF;
    END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `checkout`(IN `username_e` VARCHAR(255), OUT `res` VARCHAR(255))
BEGIN
        	## DECLARAMOS LAS VARIABLES
        	DECLARE stock_tmp INT;
        	DECLARE quantity_tmp INT;
            DECLARE cant_productos INT;
            DECLARE contador INT;
            DECLARE precio_total INT;
			DECLARE id_fact_tmp INT;
            DECLARE cod_car_tmp INT;
            DECLARE quantity_tmp_lf INT;
            DECLARE price_x_unit_tmp INT;

        	## DECLARAMOS LOS ROLLBACK PARA EVITAR ERRORES
        	DECLARE exit handler FOR SQLEXCEPTION
            	BEGIN
                	-- ERROR
                    ROLLBACK;
                END;
            DECLARE exit handler FOR SQLWARNING
            	BEGIN
                	-- WARNING
                    ROLLBACK;
                END;
             
            START TRANSACTION;
            	SET contador = 0;
                ## OBTENEMOS EL VALOR TOTAL DE LA COMPRA NECESARIO PARA LA FACTURA
                SELECT SUM(tmp.total_unitario) INTO precio_total
                    FROM (SELECT tc.quantity * c.price AS 'total_unitario'
                            FROM temporal_cart tc, car c
                            WHERE tc.cod_car = c.cod_car AND tc.username LIKE username_e) AS tmp;
                ## CREAMOS LA FACTURA
                INSERT INTO facturas(username, fecha_compra,precio_total) VALUES(username_e, NOW(), precio_total);
                SELECT last_insert_id() INTO id_fact_tmp;
       
                ## OBTENEMOS LAS ITERACIONES PARA EL LOOP
                SELECT COUNT(*) INTO cant_productos
                FROM temporal_cart 
                WHERE username LIKE username_e;
                
                WHILE contador < cant_productos DO
	                ## OBTENEMOS STOCK DE X VEHICULO
                    SELECT quantity INTO stock_tmp
                    FROM stock 
                    WHERE id_car = (SELECT MIN(cod_car)
                                    FROM temporal_cart
                                    WHERE username LIKE username_e);
                                    
					## Cantidad de stock que desea el cliente de x vehiculo
					SELECT quantity INTO quantity_tmp
                    FROM temporal_cart
                    WHERE cod_car = (SELECT MIN(cod_car)
                                   FROM temporal_cart
                                   WHERE username LIKE username_e) AND username LIKE username_e;
					IF quantity_tmp <= stock_tmp THEN
                    	
                    	SELECT MIN(tc1.cod_car) INTO cod_car_tmp
                        FROM temporal_cart tc1
                        WHERE tc1.username LIKE username_e;
                        
                        ## MODIFICAMOS EL STOCK
                        UPDATE stock SET quantity = (stock_tmp - quantity_tmp) WHERE id_car = cod_car_tmp;
                        
                        SELECT quantity INTO quantity_tmp_lf
                        FROM temporal_cart
                        WHERE username LIKE username_e AND cod_car = (SELECT MIN(tc1.cod_car)
                                                                     FROM temporal_cart tc1
                                                                     WHERE tc1.username LIKE username_e);
                        
                        SELECT price INTO price_x_unit_tmp
                        FROM car
                        WHERE cod_car = cod_car_tmp;
                        
                        ## INSERT SE REALIZA MEDIANTE TRIGGER
						#INSERT INTO lineas_factura
                        #VALUES(username_e, id_fact_tmp, cod_car_tmp, quantity_tmp_lf, price_x_unit_tmp, NOW());
                        
                    	DELETE FROM temporal_cart
                        WHERE username LIKE username_e AND cod_car = (SELECT MIN(tc1.cod_car)
                                                                     FROM temporal_cart tc1
                                                                     WHERE tc1.username LIKE username_e);
						SET res = 'CHECKOUT_OK';
					ELSE
                        SET res = 'ERROR_QUANTITY';
                    	ROLLBACK;
                    END IF;
                    SET contador = contador + 1;
                END WHILE;
            COMMIT;

        END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `count_all_cars`(OUT cant_coches INT)
BEGIN
    	SELECT COUNT(*) as 'cant_coches'
        FROM car c, image i, model m, brand b, state s, population p, province pr, type_motor ty, location loc
        WHERE c.chassis_number = i.chassis_number AND m.cod_model = c.cod_model AND b.cod_brand = m.cod_brand AND c.zip_code = p.zip_code AND p.cod_province = pr.cod_province AND c.cod_typemotor = ty.cod_fuel AND s.cod_state = c.cod_state AND c.cod_location = loc.cod_location AND i.url_image  LIKE '%/prtd-%';
    END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `increment_visits`(IN cod_car_cli INT)
BEGIN
    	DECLARE existe INT;
        SELECT @existe := COUNT(*) FROM visits WHERE cod_car = cod_car_cli ;
        
        IF @existe = 1 THEN
        	UPDATE visits SET num_visits = (num_visits + 1) WHERE cod_car = cod_car_cli;
        ELSE
        	INSERT INTO visits VALUES(cod_car_cli, 1);
        END IF;
    END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `likeOrDislike`(IN `username_e` VARCHAR(255), IN `cod_car_e` INT(255), OUT `resultado` VARCHAR(255))
BEGIN
        	DECLARE result INT;
            	SELECT COUNT(*) FROM likes WHERE username LIKE username_e AND cod_car = cod_car_e INTO result;
            CASE result
            	WHEN 0 THEN
                INSERT INTO likes(username,cod_car,d_like) VALUES(username_e,cod_car_e, NOW());
                	SET resultado = "LIKE";
                WHEN 1 THEN
                DELETE FROM likes WHERE username LIKE username_e AND cod_car = cod_car_e;
                	SET resultado = "DISLIKE";
           END CASE;
        END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `loginUser`(IN username_e VARCHAR(255),IN password_e VARCHAR(255),OUT resultado VARCHAR(255))
BEGIN
    	DECLARE existe_alm INT;
    	DECLARE pass_alm VARCHAR(255);
        
        SELECT COUNT(*) FROM users WHERE username LIKE username_e INTO existe_alm ;
        
        IF existe_alm <> 0 THEN
        	SELECT password FROM users WHERE username LIKE username_e INTO pass_alm;
        	IF pass_alm = password_e THEN
            	SET resultado = "login_ok";
            ELSE
            	SET resultado = "error_password";
            END IF;
        ELSE 
        	SET resultado = "error_username";
		END IF;
    END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `loginUserSinPassword`(IN `username_e` VARCHAR(255), IN `password_e` VARCHAR(255), OUT `resultado` VARCHAR(255))
BEGIN
    	DECLARE existe_alm INT;
    	DECLARE pass_alm VARCHAR(255);
        DECLARE status_acount boolean;
        SELECT COUNT(*) FROM users WHERE username LIKE username_e INTO existe_alm ;
        SELECT isActive FROM users WHERE username LIKE username_e INTO status_acount;
        IF status_acount = 0 THEN
        	SET resultado = "unverified_email";
        ELSEIF existe_alm <> 0 THEN
        	SELECT password FROM users WHERE username LIKE username_e INTO resultado;
        ELSE 
        	SET resultado = "error_username";
		END IF;
    END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `registerUser`(IN `username_e` VARCHAR(255), IN `passwd_e` VARCHAR(255), IN `f_nacimiento_e` DATE, IN `email_e` VARCHAR(255), IN `avatar_e` VARCHAR(255), IN `token_email_e` VARCHAR(255), OUT `resultado` VARCHAR(100))
BEGIN
    DECLARE check_mail INT;
    DECLARE check_user INT;

    SELECT COUNT(*) INTO check_mail FROM users WHERE email LIKE email_e;
    SELECT COUNT(*) INTO check_user FROM users WHERE username LIKE username_e;

    IF check_mail != 0 THEN 
        SET resultado = "error_mail";
    ELSE 
        IF check_user != 0 THEN
            SET resultado = "error_username";
        ELSE
            SET resultado = "ok_insert";
            INSERT INTO users (username, password, email, d_birth, d_registration, avatar, user_type, token_email, isActive) VALUES (username_e, passwd_e, email_e, f_nacimiento_e, NOW(), avatar_e,'client', token_email_e, 0) ;
        END IF;
    END IF;
END$$
DELIMITER ;
