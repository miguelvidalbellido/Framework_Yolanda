# FW_Bellicar

![PHP](https://img.shields.io/badge/-PHP-9cf)
![JS](https://img.shields.io/badge/-JS-yellow)
![JQUERY](https://img.shields.io/badge/-JQUERY-orange)
![MYSQL](https://img.shields.io/badge/-MYSQL-lightgrey)

## Descripción

Esta aplicación simula una plataforma de comercio electrónico sobre vehículos nuevos y usados. Con una interfaz de usuario intuitiva y fácil de usar, los usuarios pueden navegar por diferentes categorías de vehículos, ver fotos y especificaciones detalladas, y comparar precios y características antes de realizar una compra. Se han implementado funcionalidades enfocadas a mejorar la experiencia del usuario, tales como los filtros dinámicos, realizar like a los vehículos y consultar aquellas consultas previas que hemos realizado.
En esta versión el proyecto anterior, ha sido migrado al Framework proporcionado por la profesora. Este FW se basa en la arquitectura Modelo -> Vista -> Controlador. 

## Funciones

1. __Sobre la web:__

 A nivel general de la web, tenemos funcionalidades que se puede realizar desde cualquier ventana:
  * Buscador de productos dinámico
  * Acciones sobre nuestra sesión de usuario
  * Comprobación del token del usuario jwt

2. __Home:__ 🏨

 En el modulo Home el usuario tomará contacto con la web:
  * Filtro para buscar dinámicamente
  * Carrousel sobre marcas con salto de página
  * Filtros establecidos con salto de página
  * API sobre libros relacionados con coches
 
 3. __Shop:__ 📃
 
  El módulo de Shop es el más importante de la aplicación, el usuario puede filtrar, ordenar la busqueda, acceder a los detalles del producto y agregarlo al carrito, entre muchas otras cosas.
  * Listado de productos
  * Ordenar productos
  * Filtrar productos
  * Mapa con los vehículos localizados
  * Paginación
  * Infinit scroll
  * Seleccionar la cantidad de productos que queremos añadir al carrito
  * Likes
 
4. __Login/Register:__ 🚪

 Es el módulo con más seguridad de la aplicación, en el podemos darnos de alta o iniciar sesión con nuestra cuenta.
  * Validación de usuarios no dados de alta anteriormente
  * Validación de datos en cliente y servidor
  * Social login implementado (github, google)
  * Recuperar contraseña mediante email, cambiar contraseña.

5. __Dashboard:__ 📈

 En este modulo tendremos control sobre los usuarios dados de alta y estadísticas.
  * CRUD usuarios
  * Ver estadísticas con CHART.js

6. __Cart:__ 👜

 En el veremos nuestra cesta de compra y realizaremos el checkout del carrito.
 * Agregar o eliminar productos
 * Finalizar pedido
 * Seguridad con transacciones para no realizar pedidos erroneos
 * Procedimiento almacenado para procesar la compra
