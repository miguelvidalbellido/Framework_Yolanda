-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 31-05-2023 a las 19:26:31
-- Versión del servidor: 10.4.27-MariaDB
-- Versión de PHP: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `coches_net`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `addToCartDetails` (IN `username_E` VARCHAR(255), IN `cod_car_E` INT(255), IN `quantity_E` INT(255), OUT `resultado` VARCHAR(255))   BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `changeCart` (IN `cod_car_e` INT(255), IN `username_e` VARCHAR(255), IN `quantity_e` INT(255), OUT `resultado` VARCHAR(255))   BEGIN
    	DECLARE stock_total INT(255);
        SELECT quantity INTO stock_total FROM stock WHERE id_car = cod_car_e;
        IF quantity_e <= stock_total THEN
        	UPDATE temporal_cart SET quantity = quantity_e WHERE cod_car = cod_car_e AND username LIKE username_e;
            SET resultado = "UpdateOk";
        ELSE
        	SET resultado = "moreQuantityThanStock";
        END IF;
    END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `checkout` (IN `username_e` VARCHAR(255), OUT `res` VARCHAR(255))   BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `count_all_cars` (OUT `cant_coches` INT)   BEGIN
    	SELECT COUNT(*) as 'cant_coches'
        FROM car c, image i, model m, brand b, state s, population p, province pr, type_motor ty, location loc
        WHERE c.chassis_number = i.chassis_number AND m.cod_model = c.cod_model AND b.cod_brand = m.cod_brand AND c.zip_code = p.zip_code AND p.cod_province = pr.cod_province AND c.cod_typemotor = ty.cod_fuel AND s.cod_state = c.cod_state AND c.cod_location = loc.cod_location AND i.url_image  LIKE '%/prtd-%';
    END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `increment_visits` (IN `cod_car_cli` INT)   BEGIN
    	DECLARE existe INT;
        SELECT @existe := COUNT(*) FROM visits WHERE cod_car = cod_car_cli ;
        
        IF @existe = 1 THEN
        	UPDATE visits SET num_visits = (num_visits + 1) WHERE cod_car = cod_car_cli;
        ELSE
        	INSERT INTO visits VALUES(cod_car_cli, 1);
        END IF;
    END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `likeOrDislike` (IN `username_e` VARCHAR(255), IN `cod_car_e` INT(255), OUT `resultado` VARCHAR(255))   BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `loginUser` (IN `username_e` VARCHAR(255), IN `password_e` VARCHAR(255), OUT `resultado` VARCHAR(255))   BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `loginUserSinPassword` (IN `username_e` VARCHAR(255), IN `password_e` VARCHAR(255), OUT `resultado` VARCHAR(255))   BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `registerUser` (IN `username_e` VARCHAR(255), IN `passwd_e` VARCHAR(255), IN `f_nacimiento_e` DATE, IN `email_e` VARCHAR(255), IN `avatar_e` VARCHAR(255), IN `token_email_e` VARCHAR(255), OUT `resultado` VARCHAR(100))   BEGIN
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bodywork`
--

CREATE TABLE `bodywork` (
  `cod_bodywork` int(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `img_bodywork` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `bodywork`
--

INSERT INTO `bodywork` (`cod_bodywork`, `description`, `img_bodywork`) VALUES
(1, 'pick up', 'view/img/bodywork/body-pick-up.png'),
(2, 'monovolumen', 'view/img/bodywork/body-monovolumen.png'),
(3, 'familiar', 'view/img/bodywork/body-familiar.png'),
(4, 'coupe', 'view/img/bodywork/body-coupe.png'),
(5, 'cabrio', 'view/img/bodywork/body-cabrio.png'),
(6, 'berlina', 'view/img/bodywork/body-berlina.png'),
(7, '4x4-suv', 'view/img/bodywork/body-4x4-suv.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `brand`
--

CREATE TABLE `brand` (
  `cod_brand` int(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `img_brand` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `brand`
--

INSERT INTO `brand` (`cod_brand`, `description`, `img_brand`) VALUES
(1, 'audi', 'view/img/brand/audi.svg'),
(2, 'bmw', 'view/img/brand/bmw.svg'),
(3, 'citroen', 'view/img/brand/citroen.svg'),
(4, 'fiat', 'view/img/brand/fiat.svg'),
(5, 'ford', 'view/img/brand/ford.svg'),
(6, 'nissan', 'view/img/brand/nissan.svg'),
(7, 'opel', 'view/img/brand/opel.svg'),
(8, 'peugeot', 'view/img/brand/peugeot.svg'),
(9, 'renault', 'view/img/brand/renault.svg'),
(10, 'seat', 'view/img/brand/seat.svg'),
(11, 'toyota', 'view/img/brand/toyota.svg'),
(12, 'volkswagen', 'view/img/brand/volkswagen.svg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `car`
--

CREATE TABLE `car` (
  `cod_car` int(255) NOT NULL,
  `chassis_number` varchar(255) NOT NULL,
  `license_plate` varchar(255) NOT NULL,
  `km` int(255) NOT NULL,
  `price` float DEFAULT NULL,
  `enrollment_date` date NOT NULL,
  `publication_date` date NOT NULL,
  `doors` int(255) NOT NULL,
  `places` int(255) NOT NULL,
  `color` varchar(255) NOT NULL,
  `trunk_capacity` varchar(255) NOT NULL,
  `power` int(255) NOT NULL,
  `cod_shifter` int(255) NOT NULL,
  `cod_state` int(255) NOT NULL,
  `cod_model` int(255) NOT NULL,
  `zip_code` int(255) NOT NULL,
  `cod_location` int(255) NOT NULL,
  `cod_label` int(255) NOT NULL,
  `cod_typemotor` int(255) NOT NULL,
  `cod_cylinder` int(255) NOT NULL,
  `cod_bodywork` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `car`
--

INSERT INTO `car` (`cod_car`, `chassis_number`, `license_plate`, `km`, `price`, `enrollment_date`, `publication_date`, `doors`, `places`, `color`, `trunk_capacity`, `power`, `cod_shifter`, `cod_state`, `cod_model`, `zip_code`, `cod_location`, `cod_label`, `cod_typemotor`, `cod_cylinder`, `cod_bodywork`) VALUES
(1, 'JM1BK343195318282', '4901GJC', 9999, 25000, '2022-05-10', '2023-01-31', 5, 5, 'White', '481', 110, 1, 4, 4, 46870, 1, 3, 3, 6, 6),
(2, 'MVBBK343195318789', '4921TYR', 142000, 44100, '2022-07-10', '2023-01-25', 5, 5, 'White', '481', 120, 1, 4, 3, 46870, 2, 3, 5, 6, 6),
(3, '2G1WC551167339739', '3133LFL', 9999, 25000, '2022-05-10', '2023-01-10', 5, 5, 'White', '120', 130, 1, 4, 1, 28931, 3, 3, 5, 6, 6),
(4, '3G1JC544829237112', '5223JBC', 9999, 25000, '2022-05-10', '2023-01-12', 5, 5, 'White', '481', 160, 1, 4, 2, 46890, 4, 3, 5, 6, 6),
(5, '2GTGK24T923821327', '3782NCJ', 9999, 25000, '2022-05-10', '2023-01-19', 5, 5, 'White', '700', 140, 1, 4, 5, 44413, 5, 3, 5, 6, 6),
(6, '1GNSC2E01B4886286', '8532JGD', 9999, 25000, '2022-05-10', '2023-01-22', 5, 5, 'White', '300', 160, 1, 4, 6, 19442, 1, 3, 5, 6, 6),
(7, 'WVWMA83B9W4376627', '8465MDJ', 9999, 25000, '2022-05-10', '2023-01-30', 5, 5, 'White', '350', 150, 1, 4, 7, 27240, 1, 3, 3, 6, 6),
(8, '1YVHP80C588518426', '1670LDC', 9999, 25000, '2022-05-10', '2023-01-03', 5, 5, 'White', '481', 110, 1, 4, 8, 19442, 1, 3, 5, 6, 6),
(9, '1D7YD6GT3B6999553', '6927NLC', 9999, 25000, '2022-05-10', '2023-01-09', 5, 5, 'White', '481', 75, 1, 4, 9, 27240, 1, 3, 5, 6, 6),
(10, '1GC0KXEL8B7524982', '1157GFJ', 9999, 25000, '2022-05-10', '2023-01-02', 5, 5, 'White', '481', 190, 1, 4, 10, 19442, 1, 3, 5, 6, 6),
(11, '2GTGC79T331393240', '8911MGH', 0, 85000, '2023-02-14', '2023-02-14', 5, 5, 'Negro', '584', 250, 2, 4, 11, 46870, 1, 2, 2, 12, 7),
(12, '1GCZGJDL7A4194288', '1214NLF', 0, 56000, '2023-03-01', '2023-03-07', 5, 5, 'White', '435', 150, 1, 4, 13, 46635, 6, 3, 5, 4, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `car_extras`
--

CREATE TABLE `car_extras` (
  `cod_extra` int(255) NOT NULL,
  `chassis_number` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `car_extras`
--

INSERT INTO `car_extras` (`cod_extra`, `chassis_number`) VALUES
(1, 'JM1BK343195318282'),
(2, 'MVBBK343195318789'),
(3, 'JM1BK343195318282'),
(4, 'JM1BK343195318282'),
(5, 'JM1BK343195318282'),
(6, 'JM1BK343195318282'),
(7, 'JM1BK343195318282'),
(8, 'MVBBK343195318789'),
(9, 'MVBBK343195318789'),
(10, 'MVBBK343195318789'),
(11, 'MVBBK343195318789'),
(12, 'MVBBK343195318789');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `control_token_email`
--

CREATE TABLE `control_token_email` (
  `token` varchar(255) DEFAULT NULL,
  `expire_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `control_token_email`
--

INSERT INTO `control_token_email` (`token`, `expire_time`) VALUES
('3b82b9e184dc9cef888a', '2023-05-31 18:37:04'),
('0d59ed74d2ac845ba12b', '2023-05-31 19:38:36'),
('fc6d60cf692b12f9251b', '2023-05-31 20:05:24'),
('96ca0cf6055fde16635e', '2023-05-31 20:24:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cylinder_capacity`
--

CREATE TABLE `cylinder_capacity` (
  `cod_cylinder` int(255) NOT NULL,
  `description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `cylinder_capacity`
--

INSERT INTO `cylinder_capacity` (`cod_cylinder`, `description`) VALUES
(1, '1000'),
(2, '1200'),
(3, '1400'),
(4, '1600'),
(5, '1800'),
(6, '1900'),
(7, '2000'),
(8, '2200'),
(9, '2400'),
(10, '2600'),
(11, '2800'),
(12, '3000'),
(13, '3200'),
(14, '3600'),
(15, '3800'),
(16, '4000'),
(17, '4200'),
(18, '4400'),
(19, '4600'),
(20, '4800'),
(21, '5000');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `data_details_car`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `data_details_car` (
`cod_car` int(255)
,`chassis_number` varchar(255)
,`license_plate` varchar(255)
,`km` int(255)
,`price` float
,`enrollment_date` date
,`publication_date` date
,`doors` int(255)
,`places` int(255)
,`color` varchar(255)
,`trunk_capacity` varchar(255)
,`power` int(255)
,`model` varchar(255)
,`brand` varchar(255)
,`state` varchar(255)
,`shifter` varchar(255)
,`population` varchar(255)
,`province` varchar(255)
,`cylinder_capacity` varchar(255)
,`bodywork` varchar(255)
,`environmental_label` varchar(255)
,`type_motor` varchar(255)
,`lon` float
,`lat` float
,`img` varchar(255)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `data_similar_cars`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `data_similar_cars` (
`cod_car` int(255)
,`year` int(4)
,`km` int(255)
,`publication_date` date
,`enrollment_date` date
,`color` varchar(255)
,`price` float
,`power` int(255)
,`doors` int(255)
,`image` varchar(255)
,`cod_brand` int(255)
,`cod_fuel` int(255)
,`cod_typemotor` int(255)
,`model` varchar(255)
,`brand` varchar(255)
,`state` varchar(255)
,`province` varchar(255)
,`fuel` varchar(255)
,`type_shifter` varchar(255)
,`environmental_label` varchar(255)
,`lat` float
,`lon` float
,`cod_bodywork` int(255)
,`population` varchar(255)
,`num_visits` int(255)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `environmental_label`
--

CREATE TABLE `environmental_label` (
  `cod_label` int(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `img_label` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `environmental_label`
--

INSERT INTO `environmental_label` (`cod_label`, `description`, `img_label`) VALUES
(1, 'B', 'view/img/environmental_label/b.png'),
(2, 'C', 'view/img/environmental_label/c.png'),
(3, 'CERO', 'view/img/environmental_label/0.png'),
(4, 'ECO', 'view/img/environmental_label/e.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `extras`
--

CREATE TABLE `extras` (
  `cod_extra` int(255) NOT NULL,
  `description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `extras`
--

INSERT INTO `extras` (`cod_extra`, `description`) VALUES
(1, 'Sistema de frenado automático'),
(2, 'Camara de aparcamiento trasera'),
(3, 'Camara de aparcamiento delantera'),
(4, 'Climatización bizona'),
(5, 'Aparcar con manos libres'),
(6, 'Luces automaticas'),
(7, 'Asientos calefactables'),
(8, 'Tapiceria de cuero'),
(9, 'Kit de altavoces Bose'),
(10, 'Rueda de repuesto'),
(11, 'Kit de pinchazos'),
(12, 'Luces adaptativas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id_fact` int(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `fecha_compra` datetime DEFAULT NULL,
  `precio_total` int(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `facturas`
--

INSERT INTO `facturas` (`id_fact`, `username`, `fecha_compra`, `precio_total`) VALUES
(21, 'admin11', '2023-04-25 02:49:26', 75000),
(22, 'admin11', '2023-04-25 02:49:37', 176400),
(23, 'admin11', '2023-04-25 02:51:36', 255000),
(27, 'admin11', '2023-04-25 03:06:12', 100000),
(28, 'admin11', '2023-04-25 12:04:29', 50000),
(29, 'admin11', '2023-04-25 12:05:32', 50000),
(30, 'admin11', '2023-04-25 12:05:57', 100000),
(31, 'admin11', '2023-04-25 12:06:16', 150000),
(32, 'admin11', '2023-04-25 12:06:40', 75000),
(33, 'admin11', '2023-04-25 12:07:03', 100000),
(38, 'admin11', '2023-04-25 12:16:26', 125000),
(42, 'admin11', '2023-04-25 12:38:43', 100000),
(43, 'admin11', '2023-04-25 12:41:05', 507300),
(44, 'admin11', '2023-04-25 12:43:21', 75000),
(47, 'admin11', '2023-04-25 12:49:54', 100000),
(49, 'admin11', '2023-04-25 13:08:14', 201400),
(50, 'admin11', '2023-04-25 18:53:15', 295500),
(63, 'admin11', '2023-04-27 20:38:21', 238200),
(64, 'admin11', '2023-04-27 20:39:20', 88200),
(65, 'admin11', '2023-05-02 18:30:35', 50000),
(66, 'admin11', '2023-05-02 18:35:30', 88200),
(67, 'admin11', '2023-05-02 18:35:53', 50000),
(68, 'admin11', '2023-05-02 18:47:41', 50000),
(69, 'admin11', '2023-05-02 18:48:21', 88200),
(70, 'admin11', '2023-05-19 14:18:40', 300000),
(71, 'admin11', '2023-05-19 14:20:24', 88200),
(72, 'admin11', '2023-05-19 14:21:06', 50000),
(73, 'admin11', '2023-05-21 17:18:06', 100000),
(74, 'gancas', '2023-05-21 20:51:18', 138200),
(75, 'admin11', '2023-05-25 20:42:46', 50000),
(76, 'pruebesita', '2023-05-25 21:04:01', 75000),
(77, 'admin11', '2023-05-25 21:18:18', 138200),
(78, 'mbellido13', '2023-05-30 00:00:14', 75000),
(79, 'admin11', '2023-05-30 19:40:55', 257300);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historyfilters`
--

CREATE TABLE `historyfilters` (
  `token_guest` varchar(255) NOT NULL,
  `filters` varchar(255) NOT NULL,
  `dateSearch` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `historyfilters`
--

INSERT INTO `historyfilters` (`token_guest`, `filters`, `dateSearch`) VALUES
(' 79.143.132.181 ', 'fuel,diesel:brand,bmw:type_shifter,Automatico', '2023-02-22'),
(' 79.143.132.181 ', 'fuel,electrico:brand,bmw', '2023-02-22'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-02-22'),
(' 79.143.132.181 ', 'fuel,gas natural', '2023-02-22'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-02-22'),
(' 79.143.132.181 ', 'fuel,diesel:brand,bmw', '2023-02-22'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-02-22'),
(' 79.143.132.181 ', 'brand,audi:type_shifter,Automatico', '2023-02-22'),
(' 79.143.132.181 ', 'brand,audi:type_shifter,Manual', '2023-02-22'),
(' 213.0.87.134 ', 'fuel,diesel:brand,bmw', '2023-02-22'),
(' 213.0.87.134 ', 'fuel,electrico', '2023-02-22'),
(' 213.0.87.134 ', 'fuel,diesel:brand,bmw', '2023-02-22'),
(' 213.0.87.134 ', 'fuel,diesel:type_shifter,Manual', '2023-02-22'),
(' 213.0.87.134 ', 'fuel,diesel:brand,bmw', '2023-02-22'),
(' 213.0.87.134 ', 'fuel,diesel:type_shifter,Manual', '2023-02-22'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-02-22'),
(' 213.0.87.134 ', 'fuel,diesel,:brand,bmw,', '2023-02-22'),
(' 213.0.87.134 ', 'fuel,diesel:brand,bmw', '2023-02-22'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-02-22'),
(' 79.143.132.109 ', 'fuel,diesel', '2023-02-23'),
(' 79.143.132.109 ', 'fuel,diesel:brand,bmw', '2023-02-23'),
(' 79.116.121.132 ', 'fuel,diesel:brand,bmw', '2023-02-23'),
(' 79.116.121.132 ', 'fuel,electrico:type_shifter,Automatico', '2023-02-23'),
(' 79.116.121.132 ', 'fuel,diesel', '2023-02-23'),
(' 79.116.121.132 ', 'fuel,diesel', '2023-02-23'),
(' 79.116.121.132 ', 'fuel,diesel', '2023-02-23'),
(' 79.116.121.132 ', 'fuel,diesel', '2023-02-23'),
(' 213.0.87.134 ', 'fuel,diesel:brand,audi:type_shifter,Manual', '2023-02-23'),
(' 213.0.87.134 ', 'brand,bmw', '2023-02-23'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-02-23'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-02-23'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-02-23'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-02-24'),
(' 79.143.132.181 ', 'fuel,diesel:type_shifter,Automatico', '2023-02-26'),
(' 79.143.132.181 ', 'brand,bmw', '2023-02-26'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-02-26'),
(' 79.143.132.181 ', 'brand,bmw', '2023-02-26'),
('  ', 'fuel,diesel', '2023-02-28'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-03-01'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-02'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-02'),
(' 213.0.87.134 ', 'fuel,diesel:type_shifter,Manual', '2023-03-06'),
(' 213.0.87.134 ', 'fuel,diesel:type_shifter,Automatico', '2023-03-06'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-07'),
(' 213.0.87.134 ', 'fuel,diesel:brand,bmw', '2023-03-07'),
(' 213.0.87.134 ', 'fuel,electrico', '2023-03-07'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-07'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-03-07'),
(' 213.0.87.134 ', 'fuel,diesel:brand,bmw', '2023-03-07'),
(' 213.0.87.134 ', 'fuel,diesel:brand,bmw:type_shifter,Manual', '2023-03-07'),
(' 213.0.87.134 ', 'fuel,hibrido enchufable', '2023-03-07'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-03-07'),
(' 213.0.87.134 ', 'fuel,diesel:brand,bmw', '2023-03-07'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-03-08'),
(' 213.0.87.134 ', 'fuel,electrico', '2023-03-08'),
(' 213.0.87.134 ', 'fuel,diesel:brand,bmw', '2023-03-08'),
(' 213.0.87.134 ', 'fuel,diesel:brand,bmw', '2023-03-08'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-08'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-08'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-03-08'),
(' 213.0.87.134 ', 'fuel,electrico', '2023-03-08'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-08'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-03-09'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-09'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-09'),
(' 213.0.87.134 ', 'fuel,electrico', '2023-03-09'),
(' 213.0.87.134 ', 'fuel,gas natural', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-03-16'),
(' 213.0.87.134 ', 'brand,bmw', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,electrico:brand,bmw', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,electrico', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,electrico', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,gasolina', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-03-16'),
(' 213.0.87.134 ', 'fuel,diesel', '2023-03-16'),
(' 79.143.132.181 ', 'fuel,gasolina', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,gasolina', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,gasolina', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,gasolina', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,gasolina', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,gasolina', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,gasolina', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,gasolina', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,gasolina', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-20'),
(' 213.0.87.134 ', 'fuel,electrico', '2023-03-20'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-21'),
('  ', 'fuel,diesel', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,gas natural', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-21'),
(' 79.143.132.181 ', 'brand,bmw', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,diesel:brand,bmw', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,diesel:brand,bmw', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,diesel:brand,bmw', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-03-21'),
(' 79.143.132.181 ', 'brand,volkswagen', '2023-03-21'),
(' 213.0.87.134 ', 'fuel,electrico', '2023-03-21'),
(' 213.0.87.134 ', 'fuel,electrico', '2023-03-21'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-04-02'),
(' 79.143.132.181 ', 'fuel,electrico', '2023-04-02'),
(' 79.143.132.181 ', 'fuel,diesel', '2023-04-02'),
(' admin11 ', 'fuel,diesel', '2023-04-02'),
(' admin11 ', 'fuel,diesel:brand,bmw', '2023-04-02'),
(' admin11 ', 'fuel,electrico', '2023-04-02'),
(' pruebas12 ', 'fuel,electrico', '2023-04-02'),
(' pruebas12 ', 'brand,bmw', '2023-04-02'),
(' pruebas12 ', 'type_shifter,Manual', '2023-04-02'),
(' admin11 ', 'fuel,diesel', '2023-04-03'),
(' admin11 ', 'fuel,electrico', '2023-04-04'),
(' admin11 ', 'fuel,electrico', '2023-04-04'),
(' admin11 ', 'fuel,electrico', '2023-04-11'),
(' admin11 ', 'fuel,diesel', '2023-04-11'),
(' admin11 ', 'fuel,gasolina', '2023-04-12'),
(' admin11 ', 'fuel,diesel', '2023-04-19'),
(' admin11 ', 'fuel,electrico', '2023-04-19'),
(' admin11 ', 'fuel,diesel', '2023-05-18'),
(' admin11 ', 'fuel,electrico', '2023-05-18'),
(' admin11 ', 'brand,audi', '2023-05-18'),
(' gancas ', 'fuel,gasolina', '2023-05-21'),
(' admin11 ', 'fuel,electrico', '2023-05-25'),
(' mbellido13 ', 'fuel,electrico', '2023-05-29'),
(' mbellido13 ', 'fuel,diesel', '2023-05-30'),
(' mbellido13 ', 'fuel,gasolina:type_shifter,Manual', '2023-05-30'),
(' admin11 ', 'brand,audi', '2023-05-30'),
(' admin11 ', 'fuel,electrico:brand,bmw', '2023-05-30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `image`
--

CREATE TABLE `image` (
  `cod_image` int(255) NOT NULL,
  `url_image` varchar(255) NOT NULL,
  `chassis_number` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `image`
--

INSERT INTO `image` (`cod_image`, `url_image`, `chassis_number`) VALUES
(1, 'view/img/car_image/prtd-N1_id4-v2.png', 'JM1BK343195318282'),
(2, 'view/img/car_image/prtd-N1-taigo.png', 'MVBBK343195318789'),
(3, 'view/img/car_image/id4-1.png', 'JM1BK343195318282'),
(4, 'view/img/car_image/id4-2.png', 'JM1BK343195318282'),
(5, 'view/img/car_image/id4-5.png', 'JM1BK343195318282'),
(6, 'view/img/car_image/prtd-N1_Tiguan.png', '2G1WC551167339739'),
(8, 'view/img/car_image/prtd-N1_t-cross.png', '3G1JC544829237112'),
(9, 'view/img/car_image/prtd-N1-polo.png', '2GTGK24T923821327'),
(10, 'view/img/car_image/prtd-N1_golf.png', '1GNSC2E01B4886286'),
(11, 'view/img/car_image/prtd-N1_touran.png', 'WVWMA83B9W4376627'),
(12, 'view/img/car_image/prtd-N1_nuevo-golf-variant.png', '1YVHP80C588518426'),
(13, 'view/img/car_image/prtd-N1_t-roc-cabrio-pa.png', '1D7YD6GT3B6999553'),
(14, 'view/img/car_image/prtd-N1_id3.png', '1GC0KXEL8B7524982'),
(15, 'view/img/car_image/id4-6.png', 'JM1BK343195318282'),
(16, 'view/img/car_image/id4-7.png', 'JM1BK343195318282'),
(17, 'view/img/car_image/id4-8.png', 'JM1BK343195318282'),
(18, 'view/img/car_image/MVBBK343195318789-1.png', 'MVBBK343195318789'),
(19, 'view/img/car_image/MVBBK343195318789-2.png', 'MVBBK343195318789'),
(20, 'view/img/car_image/MVBBK343195318789-3.png', 'MVBBK343195318789'),
(21, 'view/img/car_image/MVBBK343195318789-4.png', 'MVBBK343195318789'),
(22, 'view/img/car_image/MVBBK343195318789-5.png', 'MVBBK343195318789'),
(23, 'view/img/car_image/prtd-790LdBerlina.png', '2GTGC79T331393240'),
(24, 'view/img/car_image/2GTGC79T331393240-1.png', '2GTGC79T331393240'),
(25, 'view/img/car_image/2GTGC79T331393240-2.png', '2GTGC79T331393240'),
(26, 'view/img/car_image/2GTGC79T331393240-3.png', '2GTGC79T331393240'),
(27, 'view/img/car_image/2GTGC79T331393240-4.png', '2GTGC79T331393240'),
(28, 'view/img/car_image/prtd-1GCZGJDL7A4194288.png', '1GCZGJDL7A4194288'),
(29, 'view/img/car_image/1GCZGJDL7A4194288-1.png', '1GCZGJDL7A4194288'),
(30, 'view/img/car_image/1GCZGJDL7A4194288-2.png', '1GCZGJDL7A4194288'),
(31, 'view/img/car_image/1GCZGJDL7A4194288-3.png', '1GCZGJDL7A4194288'),
(32, 'view/img/car_image/1GCZGJDL7A4194288-4.png', '1GCZGJDL7A4194288');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `likes`
--

CREATE TABLE `likes` (
  `username` varchar(255) NOT NULL,
  `cod_car` int(255) NOT NULL,
  `d_like` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `likes`
--

INSERT INTO `likes` (`username`, `cod_car`, `d_like`) VALUES
('admin11', 10, '2023-04-12'),
('admin11', 11, '2023-04-12'),
('admin11', 5, '2023-04-12'),
('admin11', 8, '2023-04-12'),
('test12', 1, '2023-04-12'),
('pruebesita', 1, '2023-05-25'),
('pruebesita', 2, '2023-05-25'),
('mbellido13', 2, '2023-05-29'),
('bellido.clase', 4, '2023-05-30'),
('miguel.vidal.bell', 4, '2023-05-30'),
('miguel.vidal.bell', 8, '2023-05-30'),
('admin11', 1, '2023-05-30'),
('admin11', 2, '2023-05-30'),
('admin11', 4, '2023-05-30'),
('mbellido13', 1, '2023-05-30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lineas_factura`
--

CREATE TABLE `lineas_factura` (
  `username` varchar(255) NOT NULL,
  `id_fact` int(255) NOT NULL,
  `cod_car` int(255) NOT NULL,
  `quantity` int(255) NOT NULL,
  `priceByUnit` float DEFAULT NULL,
  `d_purchase` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `lineas_factura`
--

INSERT INTO `lineas_factura` (`username`, `id_fact`, `cod_car`, `quantity`, `priceByUnit`, `d_purchase`) VALUES
('admin11', 42, 1, 4, 25000, '2023-04-25'),
('admin11', 43, 1, 2, 25000, '2023-04-25'),
('admin11', 43, 2, 3, 44100, '2023-04-25'),
('admin11', 43, 5, 13, 25000, '2023-04-25'),
('admin11', 44, 1, 3, 25000, '2023-04-25'),
('admin11', 47, 1, 4, 25000, '2023-04-25'),
('admin11', 49, 1, 1, 25000, '2023-04-25'),
('admin11', 49, 2, 4, 44100, '2023-04-25'),
('admin11', 50, 2, 5, 44100, '2023-04-25'),
('admin11', 50, 4, 3, 25000, '2023-04-25'),
('admin11', 50, 4, 2, 25000, '2023-04-27'),
('admin11', 63, 1, 6, 25000, '2023-04-27'),
('admin11', 63, 2, 2, 44100, '2023-04-27'),
('admin11', 64, 2, 2, 44100, '2023-04-27'),
('admin11', 65, 1, 2, 25000, '2023-05-02'),
('admin11', 66, 2, 2, 44100, '2023-05-02'),
('admin11', 67, 1, 2, 25000, '2023-05-02'),
('admin11', 68, 1, 2, 25000, '2023-05-02'),
('admin11', 69, 2, 2, 44100, '2023-05-02'),
('admin11', 69, 2, 3, 44100, '2023-05-19'),
('admin11', 70, 1, 12, 25000, '2023-05-19'),
('admin11', 71, 2, 2, 44100, '2023-05-19'),
('admin11', 72, 4, 2, 25000, '2023-05-19'),
('admin11', 73, 4, 4, 25000, '2023-05-21'),
('gancas', 74, 2, 2, 44100, '2023-05-21'),
('gancas', 74, 6, 2, 25000, '2023-05-21'),
('admin11', 75, 7, 2, 25000, '2023-05-25'),
('pruebesita', 76, 4, 3, 25000, '2023-05-25'),
('admin11', 77, 1, 2, 25000, '2023-05-25'),
('admin11', 77, 2, 2, 44100, '2023-05-25'),
('mbellido13', 78, 4, 3, 25000, '2023-05-30'),
('admin11', 79, 2, 3, 44100, '2023-05-30'),
('admin11', 79, 4, 5, 25000, '2023-05-30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `location`
--

CREATE TABLE `location` (
  `cod_location` int(255) NOT NULL,
  `lat` float NOT NULL,
  `lon` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `location`
--

INSERT INTO `location` (`cod_location`, `lat`, `lon`) VALUES
(1, 38.8228, -0.548253),
(2, 38.8796, -0.597633),
(3, 38.8188, -0.610232),
(4, 38.7722, -0.609782),
(5, 43.0166, -7.56209),
(6, 38.7835, -0.785848);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `model`
--

CREATE TABLE `model` (
  `cod_model` int(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `cod_brand` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `model`
--

INSERT INTO `model` (`cod_model`, `description`, `cod_brand`) VALUES
(2, 'Tcross', '12'),
(3, 'Taigo', '12'),
(4, 'ID4', '12'),
(5, 'Polo', '12'),
(6, 'Golf', '12'),
(7, 'Touran', '12'),
(8, 'Golf variant', '12'),
(9, 'T-roc cabrio', '12'),
(10, 'ID3', '12'),
(11, '730Ld Berlina', '2'),
(12, 'Tiguan', '12'),
(13, 'A3 sportback', '1');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `more_visit_cars`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `more_visit_cars` (
`description` varchar(255)
,`num_visits` int(255)
,`url_image` varchar(255)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `population`
--

CREATE TABLE `population` (
  `zip_code` int(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `cod_province` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `population`
--

INSERT INTO `population` (`zip_code`, `description`, `cod_province`) VALUES
(19442, 'Ablanque', 23),
(22440, 'Benasque', 25),
(24413, 'Molinaseca', 30),
(27240, 'Meira', 32),
(28931, 'Mostoles', 33),
(44413, 'Valdenirares', 47),
(46635, 'Fontanars', 49),
(46870, 'Ontinyent', 49),
(46890, 'Agullent', 49);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `province`
--

CREATE TABLE `province` (
  `cod_province` int(255) NOT NULL,
  `description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `province`
--

INSERT INTO `province` (`cod_province`, `description`) VALUES
(1, 'A Coruna'),
(2, 'Alacant'),
(3, 'Albacete'),
(4, 'Almeria'),
(5, 'Alava'),
(6, 'Asturias'),
(7, 'Avila'),
(8, 'Badajoz'),
(9, 'Barcelona'),
(10, 'Vizcaya'),
(11, 'Burgos'),
(12, 'Caceres'),
(13, 'Cadiz'),
(14, 'Cantabria'),
(15, 'Castellon'),
(16, 'Ceuta'),
(17, 'Ciudad Real'),
(18, 'Cordoba'),
(19, 'Cuenca'),
(20, 'Guipuzcua'),
(21, 'Girona'),
(22, 'Granada'),
(23, 'Guadalajara'),
(24, 'Huelva'),
(25, 'Huesca'),
(26, 'Islas Baleares'),
(27, 'Jaen'),
(28, 'La Rioja'),
(29, 'Las Palmas'),
(30, 'Leon'),
(31, 'Lleida'),
(32, 'Lugo'),
(33, 'Madrid'),
(34, 'Málaga'),
(35, 'Melilla'),
(36, 'Murcia'),
(37, 'Navarra'),
(38, 'Ourense'),
(39, 'Palencia'),
(40, 'Pontevedra'),
(41, 'Salamanca'),
(42, 'Santa Cruz De Tenerife'),
(43, 'Segovia'),
(44, 'Sevilla'),
(45, 'Soria'),
(46, 'Tarragona'),
(47, 'Teruel'),
(48, 'Toledo'),
(49, 'Valencia'),
(50, 'Valladolid'),
(51, 'Zamora'),
(52, 'Zaragoza');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `shifter`
--

CREATE TABLE `shifter` (
  `cod_shifter` int(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `shifter`
--

INSERT INTO `shifter` (`cod_shifter`, `description`) VALUES
(1, 'Manual'),
(2, 'Automatico');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `state`
--

CREATE TABLE `state` (
  `cod_state` int(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `state`
--

INSERT INTO `state` (`cod_state`, `description`) VALUES
(1, 'KM0'),
(2, 'Segunda mano'),
(3, 'Renting'),
(4, 'Nuevo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stock`
--

CREATE TABLE `stock` (
  `id_car` int(255) NOT NULL,
  `quantity` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `stock`
--

INSERT INTO `stock` (`id_car`, `quantity`) VALUES
(1, 0),
(2, 91),
(3, 100),
(4, 80),
(5, 87),
(6, 98),
(7, 98),
(8, 100),
(9, 100),
(10, 100),
(11, 100),
(12, 100);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `tabla_filtros`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `tabla_filtros` (
`cod_car` int(255)
,`year` int(4)
,`km` int(255)
,`publication_date` date
,`enrollment_date` date
,`color` varchar(255)
,`price` float
,`power` int(255)
,`doors` int(255)
,`image` varchar(255)
,`cod_brand` int(255)
,`cod_fuel` int(255)
,`model` varchar(255)
,`brand` varchar(255)
,`state` varchar(255)
,`province` varchar(255)
,`fuel` varchar(255)
,`type_shifter` varchar(255)
,`environmental_label` varchar(255)
,`lat` float
,`lon` float
,`cod_bodywork` int(255)
,`population` varchar(255)
,`num_visits` int(255)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `temporal_cart`
--

CREATE TABLE `temporal_cart` (
  `username` varchar(255) NOT NULL,
  `cod_car` int(255) NOT NULL,
  `quantity` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `temporal_cart`
--

INSERT INTO `temporal_cart` (`username`, `cod_car`, `quantity`) VALUES
('99', 99, 101),
('miguel', 1, 2),
('paco', 1, 6),
('test', 1, 6),
('pruebesita', 2, 2);

--
-- Disparadores `temporal_cart`
--
DELIMITER $$
CREATE TRIGGER `tempral_cart_AD` AFTER DELETE ON `temporal_cart` FOR EACH ROW BEGIN
        	DECLARE username VARCHAR(255);
            DECLARE id_fact INT;
            DECLARE priceByUnit INT;
            
            SELECT f1.username INTO username
            FROM facturas f1
            WHERE f1.fecha_compra = (SELECT MAX(f.fecha_compra)
                                     FROM facturas f);
			SELECT f1.id_fact INTO id_fact
            FROM facturas f1
            WHERE f1.fecha_compra = (SELECT MAX(f.fecha_compra)
                                     FROM facturas f);
			
            SELECT c.price INTO priceByUnit
            FROM car c
            WHERE c.cod_car = OLD.cod_car;
            
        	INSERT INTO lineas_factura(username, id_fact, cod_car, quantity, priceByUnit, d_purchase)
            VALUES(username, id_fact, old.cod_car, old.quantity, priceByUnit, NOW());
        END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `type_motor`
--

CREATE TABLE `type_motor` (
  `cod_fuel` int(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `img_fuel` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `type_motor`
--

INSERT INTO `type_motor` (`cod_fuel`, `description`, `img_fuel`) VALUES
(1, 'gas natural', 'view/img/fuel/fuel.png'),
(2, 'diesel', 'view/img/fuel/fuel.png'),
(3, 'electrico', 'view/img/fuel/fuel.png'),
(4, 'gas licuado', 'view/img/fuel/fuel.png'),
(5, 'gasolina', 'view/img/fuel/fuel.png'),
(6, 'hibrido', 'view/img/fuel/fuel.png'),
(7, 'hibrido enchufable', 'view/img/fuel/fuel.png'),
(8, 'otros', 'view/img/fuel/fuel.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `d_birth` date NOT NULL,
  `d_registration` date NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `user_type` varchar(255) NOT NULL,
  `token_email` varchar(255) NOT NULL,
  `isActive` tinyint(1) NOT NULL,
  `uid` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id_user`, `username`, `password`, `email`, `d_birth`, `d_registration`, `avatar`, `user_type`, `token_email`, `isActive`, `uid`) VALUES
(12, 'carmenbell', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'carmen@gmail.com', '0000-00-00', '2023-03-26', 'https://i.pravatar.cc/500?u=1073cd4179e1610ccdaa60d316ebc6c8', 'client', '', 1, NULL),
(15, 'pruebas12', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'pruebas1@gmail.com', '0000-00-00', '2023-03-28', 'https://i.pravatar.cc/500?u=772bd786ab221b0b952b8f55058366a6', 'client', '', 0, NULL),
(18, 'paquito', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'paquito@gmail.com', '2023-04-12', '2023-04-01', 'https://i.pravatar.cc/500?u=93e1388551530368e35fcbf044f55bf8', 'client', '', 0, NULL),
(19, 'joseramon', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'joseramon@gmail.com', '2023-04-12', '2023-04-01', 'https://i.pravatar.cc/500?u=fcdac7d018248639566b80d266df749f', 'client', '', 0, NULL),
(20, 'manolo', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'manolo@gmail.com', '2023-04-12', '2023-04-01', 'https://i.pravatar.cc/500?u=e385b365f3f0eba03ac3d244bdc172db', 'client', '', 0, NULL),
(22, 'admin11', '$2y$12$3Z95tde3Uj7R0KkofMTh1.4mFys8CRnS4/0SL9XXRCWxrxLQyDn4W', 'admin11@gmail.com', '2023-04-06', '2023-04-02', 'https://i.pravatar.cc/500?u=5d58848e2a552421f202f3e397526f4f', 'admin', '', 1, NULL),
(28, 'maricarmen', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'maricarmen@gmail.com', '2023-04-03', '2023-04-04', 'https://i.pravatar.cc/500?u=9100e3ed168e5e259b13276225b23c9c', 'client', '', 0, NULL),
(30, 'miguel', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'miguel@gmail.com', '2023-04-04', '2023-04-25', 'https://i.pravatar.cc/500?u=c952ec83eabde595820603a3ca9d7f54', 'client', '', 0, NULL),
(31, 'dasdasdasd', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'dasdasdasd@gmail.com', '2023-04-24', '2023-05-17', 'https://i.pravatar.cc/500?u=439633f4e010a5a992f5d14fa0f8180a', 'client', '', 0, NULL),
(32, 'tesususrioo', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'estesegurquenoesta@gmail.com', '2023-04-24', '2023-05-17', 'https://i.pravatar.cc/500?u=ca2c27c1d89e5425960ec3466ab37835', 'client', '', 0, NULL),
(33, 'gancas', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'gancas@gmail.com', '2023-05-25', '2023-05-21', 'https://i.pravatar.cc/500?u=d08a2b8328326c361b9d0408709f4b72', 'client', '', 0, NULL),
(35, 'prueba23', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'prueba23@gmail.com', '2023-05-11', '2023-05-22', 'https://i.pravatar.cc/500?u=ad592560df3b3c9b83c550197332ea90', 'client', '', 0, NULL),
(36, 'prueba24', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'prueba24@gmail.com', '2023-05-03', '2023-05-22', 'https://i.pravatar.cc/500?u=f0a22f18a38dc972c7bc47a510109093', 'client', '', 0, NULL),
(37, 'prueba25', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'prueba25@gmial.commoc', '0000-00-00', '2023-05-22', 'https://i.pravatar.cc/500?u=63f7e6c8268a41602e3f899a8b667579', 'client', '', 0, NULL),
(38, 'paquino', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'paquino@gmail.com', '2023-05-02', '2023-05-22', 'https://i.pravatar.cc/500?u=17391c066a195803889529ed8aa94640', 'client', '', 0, NULL),
(39, 'johan21', '$2y$12$Y9426IatR1p8ZaGJ.NHWvugpqJ5YQY1QXsBWJfEmDTkZancrhHxiG', 'johan@gmail.com', '2023-05-03', '2023-05-22', 'https://i.pravatar.cc/500?u=4d4dd049d9b4d9600339346ec266c770', 'client', '', 0, NULL),
(40, 'testmail', '$2y$12$IkoqOLS9V.uh2qRa3XVLkewMgX7eNNWZrIDcHyz38r1ENo5N.CNSq', 'testmail@gmail.com', '2023-05-03', '2023-05-23', 'https://i.pravatar.cc/500?u=e6382df8e62280618c3ef3ab7eff48cc', 'client', '29f9818e238e60f9c413', 0, NULL),
(41, 'pruebita', '$2y$12$jwTGW9N7zBLjNL0M6TmQhe1cXRvE1lm0fBGpkfhYiS5ABYZcp9Zs6', 'p222rueba22@gmail.com', '2023-05-25', '2023-05-23', 'https://i.pravatar.cc/500?u=35bab851c84682f1bb446f1bb80723c2', 'client', 'eaac21b6c2f121622e16', 0, NULL),
(42, 'joseluis', '$2y$12$lyYrNCY5LHnSaEgcjhm.oOZCWtyW8qh6gVTCgQkcBh6Fb3nFROK9C', 'joseluis@gmail.com', '2023-05-09', '2023-05-23', 'https://i.pravatar.cc/500?u=db43beb24df48138cc5762ce54a5824f', 'client', 'dcc7800a4a0e1794ac90', 0, NULL),
(43, 'josepaco', '$2y$12$lRsXNVLbDkPMIAhL1liuI.cHCWncEgLNFwulOzU8lbeunn0uoAyQ2', 'josepaco@gmail.com', '2023-05-04', '2023-05-23', 'https://i.pravatar.cc/500?u=4eeca1424073b395367de01da1ff14ad', 'client', 'be6b591fa4bee2821dfa', 0, NULL),
(44, 'marialuisa', '$2y$12$4B1x/KHjgKzezrsjOFXrPO.hOR1dG4yy11b/73nsN8/fyK58N4tES', 'marialuisa@dfsada.com', '2023-05-10', '2023-05-23', 'https://i.pravatar.cc/500?u=3411c65dc5522f3f4c581c0d665a7c3c', 'client', 'ccc1278d4c7b3c282062', 0, NULL),
(45, 'josepaco22', '$2y$12$QUmH3bSOS/BE3myqni7o1eOXJmLGF15hVj2lO/.g8gh1W0zOrfZpO', 'josepac22o@gmail.com', '2023-05-04', '2023-05-23', 'https://i.pravatar.cc/500?u=4465913e8609ba50fda3275db5430884', 'client', '5cac58b58f9cf333539f', 0, NULL),
(46, 'marialuisa22', '$2y$12$7BDgC86hMxJuisUDurVR/uu3dMoLwSOcROFRLqxav8qOTpjlMY45C', 'marialuisa22@dfsada.com', '2023-05-10', '2023-05-23', 'https://i.pravatar.cc/500?u=4370ae87cddfc9d257ca1008a2f571cf', 'client', '5378883afdd8dea92efb', 0, NULL),
(47, 'vamoajuga', '$2y$12$n6aoCkTlsxGTIa40jGpgReSenKbBVlqek/PBX4yyfvsBZ.hWWxB12', 'vamoajuga@gmail.com', '2023-05-03', '2023-05-23', 'https://i.pravatar.cc/500?u=f2957834b3824100fdb647bcce95aa9e', 'client', 'e07c92407a3f8ab07829', 1, NULL),
(48, 'pruebesita', '$2y$12$casaKlcEPQZhMHbr2YB4kOo6Mhty.tGHggEoInazctbL.fBSHw7/6', 'pruebesita@gmail.com', '2023-05-09', '2023-05-25', 'https://i.pravatar.cc/500?u=2fed982733e4312b6594c6aeef3516bf', 'client', '', 1, NULL),
(49, 'pacocococ', '$2y$12$OyCKMeWc/Y0M6jtaMSenUe5zn0UepbsKn2MIIlicLmJmy5q4aqvCW', 'pacocococ@gmail.com', '2023-05-09', '2023-05-29', 'https://i.pravatar.cc/500?u=a53438264692cada732fbd6de9e77129', 'client', '', 1, NULL),
(54, 'johann', '$2y$12$zYm13GqF335bWxw6XJtMZeIv4cYlWLudqPnRMF0/6R1DiCE1ajFdW', 'johann@gmail.com', '2023-05-10', '2023-05-30', 'https://i.pravatar.cc/500?u=305701b1118cf856d696ea0515d882bf', 'client', '', 1, NULL),
(56, 'mbellido13', '', 'mbellido13@gmail.com', '0000-00-00', '2023-05-31', 'https://avatars.githubusercontent.com/u/46724295?v=4', 'client', '', 1, 'duf1bV5AsrWHwOUejXYglCYaSGi1');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `visits`
--

CREATE TABLE `visits` (
  `cod_car` int(255) DEFAULT NULL,
  `num_visits` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `visits`
--

INSERT INTO `visits` (`cod_car`, `num_visits`) VALUES
(1, 378),
(2, 39),
(5, 8),
(6, 3),
(7, 3),
(12, 4),
(11, 6),
(NULL, 1),
(3, 1),
(4, 20),
(8, 2),
(9, 1),
(10, 3),
(13, 2),
(0, 1);

-- --------------------------------------------------------

--
-- Estructura para la vista `data_details_car`
--
DROP TABLE IF EXISTS `data_details_car`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `data_details_car`  AS SELECT `c`.`cod_car` AS `cod_car`, `c`.`chassis_number` AS `chassis_number`, `c`.`license_plate` AS `license_plate`, `c`.`km` AS `km`, `c`.`price` AS `price`, `c`.`enrollment_date` AS `enrollment_date`, `c`.`publication_date` AS `publication_date`, `c`.`doors` AS `doors`, `c`.`places` AS `places`, `c`.`color` AS `color`, `c`.`trunk_capacity` AS `trunk_capacity`, `c`.`power` AS `power`, `m`.`description` AS `model`, `b`.`description` AS `brand`, `s`.`description` AS `state`, `sh`.`description` AS `shifter`, `p`.`description` AS `population`, `pr`.`description` AS `province`, `cyl`.`description` AS `cylinder_capacity`, `bd`.`description` AS `bodywork`, `e`.`description` AS `environmental_label`, `t`.`description` AS `type_motor`, `loc`.`lon` AS `lon`, `loc`.`lat` AS `lat`, `i`.`url_image` AS `img` FROM ((((((((((((`car` `c` join `model` `m`) join `brand` `b`) join `state` `s`) join `population` `p`) join `province` `pr`) join `environmental_label` `e`) join `type_motor` `t`) join `cylinder_capacity` `cyl`) join `bodywork` `bd`) join `shifter` `sh`) join `location` `loc`) join `image` `i`) WHERE `m`.`cod_model` = `c`.`cod_model` AND `b`.`cod_brand` = `m`.`cod_brand` AND `s`.`cod_state` = `c`.`cod_state` AND `c`.`zip_code` = `p`.`zip_code` AND `pr`.`cod_province` = `p`.`cod_province` AND `c`.`cod_label` = `e`.`cod_label` AND `c`.`cod_typemotor` = `t`.`cod_fuel` AND `c`.`cod_cylinder` <> 0 AND `c`.`cod_cylinder` = `cyl`.`cod_cylinder` AND `c`.`cod_bodywork` = `bd`.`cod_bodywork` AND `c`.`cod_shifter` = `sh`.`cod_shifter` AND `loc`.`cod_location` = `c`.`cod_location` AND `i`.`chassis_number` = `c`.`chassis_number` AND `i`.`url_image` like '%/prtd-%''%/prtd-%'  ;

-- --------------------------------------------------------

--
-- Estructura para la vista `data_similar_cars`
--
DROP TABLE IF EXISTS `data_similar_cars`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `data_similar_cars`  AS SELECT DISTINCT `kk`.`cod_car` AS `cod_car`, `kk`.`year` AS `year`, `kk`.`km` AS `km`, `kk`.`publication_date` AS `publication_date`, `kk`.`enrollment_date` AS `enrollment_date`, `kk`.`color` AS `color`, `kk`.`price` AS `price`, `kk`.`power` AS `power`, `kk`.`doors` AS `doors`, `kk`.`image` AS `image`, `kk`.`cod_brand` AS `cod_brand`, `kk`.`cod_fuel` AS `cod_fuel`, `kk`.`cod_typemotor` AS `cod_typemotor`, `kk`.`model` AS `model`, `kk`.`brand` AS `brand`, `kk`.`state` AS `state`, `kk`.`province` AS `province`, `kk`.`fuel` AS `fuel`, `kk`.`type_shifter` AS `type_shifter`, `kk`.`environmental_label` AS `environmental_label`, `kk`.`lat` AS `lat`, `kk`.`lon` AS `lon`, `kk`.`cod_bodywork` AS `cod_bodywork`, `kk`.`population` AS `population`, `kk`.`num_visits` AS `num_visits` FROM (((select `c`.`cod_car` AS `cod_car`,year(`c`.`enrollment_date`) AS `year`,`c`.`km` AS `km`,`c`.`publication_date` AS `publication_date`,`c`.`enrollment_date` AS `enrollment_date`,`c`.`color` AS `color`,`c`.`price` AS `price`,`c`.`power` AS `power`,`c`.`doors` AS `doors`,`i`.`url_image` AS `image`,`b`.`cod_brand` AS `cod_brand`,`ty`.`cod_fuel` AS `cod_fuel`,`c`.`cod_typemotor` AS `cod_typemotor`,`m`.`description` AS `model`,`b`.`description` AS `brand`,`s`.`description` AS `state`,`pr`.`description` AS `province`,`ty`.`description` AS `fuel`,`sh`.`description` AS `type_shifter`,`env`.`description` AS `environmental_label`,`loc`.`lat` AS `lat`,`loc`.`lon` AS `lon`,`bw`.`cod_bodywork` AS `cod_bodywork`,`p`.`description` AS `population`,`vis`.`num_visits` AS `num_visits` from ((((((((((((`car` `c` join `image` `i`) join `model` `m`) join `brand` `b`) join `state` `s`) join `population` `p`) join `province` `pr`) join `type_motor` `ty`) join `shifter` `sh`) join `environmental_label` `env`) join `location` `loc`) join `bodywork` `bw`) join `visits` `vis`) where `c`.`chassis_number` = `i`.`chassis_number` and `m`.`cod_model` = `c`.`cod_model` and `b`.`cod_brand` = `m`.`cod_brand` and `c`.`zip_code` = `p`.`zip_code` and `p`.`cod_province` = `pr`.`cod_province` and `c`.`cod_typemotor` = `ty`.`cod_fuel` and `s`.`cod_state` = `c`.`cod_state` and `sh`.`cod_shifter` = `c`.`cod_shifter` and `env`.`cod_label` = `c`.`cod_label` and `c`.`cod_location` = `loc`.`cod_location` and `c`.`cod_bodywork` = `bw`.`cod_bodywork` and `c`.`cod_car` = `vis`.`cod_car` and `i`.`url_image` like '%/prtd-%') `kk` join `car` `cf`) join `model` `mf`) WHERE `cf`.`cod_model` = `mf`.`cod_model` AND `kk`.`cod_brand` = `mf`.`cod_brand``cod_brand`  ;

-- --------------------------------------------------------

--
-- Estructura para la vista `more_visit_cars`
--
DROP TABLE IF EXISTS `more_visit_cars`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `more_visit_cars`  AS SELECT DISTINCT `m`.`description` AS `description`, `v`.`num_visits` AS `num_visits`, `i`.`url_image` AS `url_image` FROM (((`model` `m` join `car` `c`) join `visits` `v`) join `image` `i`) WHERE `m`.`cod_model` = `c`.`cod_model` AND `c`.`cod_car` = `v`.`cod_car` AND `i`.`chassis_number` = `c`.`chassis_number` AND `i`.`url_image` like '%/prtd-%' GROUP BY `m`.`cod_model` ORDER BY 2 DESC LIMIT 0, 55  ;

-- --------------------------------------------------------

--
-- Estructura para la vista `tabla_filtros`
--
DROP TABLE IF EXISTS `tabla_filtros`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tabla_filtros`  AS SELECT `c`.`cod_car` AS `cod_car`, year(`c`.`enrollment_date`) AS `year`, `c`.`km` AS `km`, `c`.`publication_date` AS `publication_date`, `c`.`enrollment_date` AS `enrollment_date`, `c`.`color` AS `color`, `c`.`price` AS `price`, `c`.`power` AS `power`, `c`.`doors` AS `doors`, `i`.`url_image` AS `image`, `b`.`cod_brand` AS `cod_brand`, `ty`.`cod_fuel` AS `cod_fuel`, `m`.`description` AS `model`, `b`.`description` AS `brand`, `s`.`description` AS `state`, `pr`.`description` AS `province`, `ty`.`description` AS `fuel`, `sh`.`description` AS `type_shifter`, `env`.`description` AS `environmental_label`, `loc`.`lat` AS `lat`, `loc`.`lon` AS `lon`, `bw`.`cod_bodywork` AS `cod_bodywork`, `p`.`description` AS `population`, `vis`.`num_visits` AS `num_visits` FROM ((((((((((((`car` `c` join `image` `i`) join `model` `m`) join `brand` `b`) join `state` `s`) join `population` `p`) join `province` `pr`) join `type_motor` `ty`) join `shifter` `sh`) join `environmental_label` `env`) join `location` `loc`) join `bodywork` `bw`) join `visits` `vis`) WHERE `c`.`chassis_number` = `i`.`chassis_number` AND `m`.`cod_model` = `c`.`cod_model` AND `b`.`cod_brand` = `m`.`cod_brand` AND `c`.`zip_code` = `p`.`zip_code` AND `p`.`cod_province` = `pr`.`cod_province` AND `c`.`cod_typemotor` = `ty`.`cod_fuel` AND `s`.`cod_state` = `c`.`cod_state` AND `sh`.`cod_shifter` = `c`.`cod_shifter` AND `env`.`cod_label` = `c`.`cod_label` AND `c`.`cod_location` = `loc`.`cod_location` AND `c`.`cod_bodywork` = `bw`.`cod_bodywork` AND `c`.`cod_car` = `vis`.`cod_car` AND `i`.`url_image` like '%/prtd-%''%/prtd-%'  ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `bodywork`
--
ALTER TABLE `bodywork`
  ADD PRIMARY KEY (`cod_bodywork`);

--
-- Indices de la tabla `brand`
--
ALTER TABLE `brand`
  ADD PRIMARY KEY (`cod_brand`);

--
-- Indices de la tabla `car`
--
ALTER TABLE `car`
  ADD PRIMARY KEY (`cod_car`);

--
-- Indices de la tabla `car_extras`
--
ALTER TABLE `car_extras`
  ADD PRIMARY KEY (`cod_extra`);

--
-- Indices de la tabla `cylinder_capacity`
--
ALTER TABLE `cylinder_capacity`
  ADD PRIMARY KEY (`cod_cylinder`);

--
-- Indices de la tabla `environmental_label`
--
ALTER TABLE `environmental_label`
  ADD PRIMARY KEY (`cod_label`);

--
-- Indices de la tabla `extras`
--
ALTER TABLE `extras`
  ADD PRIMARY KEY (`cod_extra`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id_fact`);

--
-- Indices de la tabla `image`
--
ALTER TABLE `image`
  ADD PRIMARY KEY (`cod_image`);

--
-- Indices de la tabla `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`cod_location`);

--
-- Indices de la tabla `model`
--
ALTER TABLE `model`
  ADD PRIMARY KEY (`cod_model`);

--
-- Indices de la tabla `population`
--
ALTER TABLE `population`
  ADD PRIMARY KEY (`zip_code`);

--
-- Indices de la tabla `province`
--
ALTER TABLE `province`
  ADD PRIMARY KEY (`cod_province`);

--
-- Indices de la tabla `shifter`
--
ALTER TABLE `shifter`
  ADD PRIMARY KEY (`cod_shifter`);

--
-- Indices de la tabla `state`
--
ALTER TABLE `state`
  ADD PRIMARY KEY (`cod_state`);

--
-- Indices de la tabla `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`id_car`);

--
-- Indices de la tabla `type_motor`
--
ALTER TABLE `type_motor`
  ADD PRIMARY KEY (`cod_fuel`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `bodywork`
--
ALTER TABLE `bodywork`
  MODIFY `cod_bodywork` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `brand`
--
ALTER TABLE `brand`
  MODIFY `cod_brand` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `car`
--
ALTER TABLE `car`
  MODIFY `cod_car` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `car_extras`
--
ALTER TABLE `car_extras`
  MODIFY `cod_extra` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `cylinder_capacity`
--
ALTER TABLE `cylinder_capacity`
  MODIFY `cod_cylinder` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `environmental_label`
--
ALTER TABLE `environmental_label`
  MODIFY `cod_label` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `extras`
--
ALTER TABLE `extras`
  MODIFY `cod_extra` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id_fact` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT de la tabla `image`
--
ALTER TABLE `image`
  MODIFY `cod_image` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `location`
--
ALTER TABLE `location`
  MODIFY `cod_location` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `model`
--
ALTER TABLE `model`
  MODIFY `cod_model` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `population`
--
ALTER TABLE `population`
  MODIFY `zip_code` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46891;

--
-- AUTO_INCREMENT de la tabla `province`
--
ALTER TABLE `province`
  MODIFY `cod_province` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT de la tabla `shifter`
--
ALTER TABLE `shifter`
  MODIFY `cod_shifter` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `state`
--
ALTER TABLE `state`
  MODIFY `cod_state` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `type_motor`
--
ALTER TABLE `type_motor`
  MODIFY `cod_fuel` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
