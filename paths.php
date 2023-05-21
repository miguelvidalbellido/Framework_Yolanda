<?php

    define('PROJECT', '/FW_coches_net/');

    //SITE_ROOT
    define('SITE_ROOT', $_SERVER['DOCUMENT_ROOT'] . PROJECT);

    //SITE_PATH
    define('SITE_PATH', 'http://' . $_SERVER['HTTP_HOST'] . PROJECT);

    //PRODUCTION
    define('PRODUCTION', true);

    //MODEL
    define('MODEL_PATH', SITE_ROOT . 'model/');

    //MODULES
    define('MODULES_PATH', SITE_ROOT . 'module/');

    //RESOURCES
    define('RESOURCES', SITE_ROOT . 'resources/');

    //UTILS
    define('UTILS', SITE_ROOT . 'utils/');

    //VIEW
    define('VIEW_PATH_INC', SITE_ROOT . 'view/inc/');

    //CSS
    define('CSS_PATH', SITE_ROOT . 'view/css/');

    //JS
    define('JS_PATH', SITE_ROOT . 'view/js/');

    //IMG
    define('IMG_PATH', SITE_ROOT . 'view/images/');

    // MODEL_CONTACT //
    define('JS_VIEW_CONTACT', SITE_PATH . 'module/contact/view/js/');
    define('VIEW_PATH_CONTACT', SITE_ROOT . 'module/contact/view/');

    // MODEL_HOME // 
    define('JS_VIEW_HOME', SITE_PATH . 'module/home/view/js/');
    define('MODEL_HOME', SITE_ROOT. 'module/home/model/model/');
    define('VISTA_HOME', SITE_PATH.'module/home/view/home.html');

    // MODEL_SHOP
    define('MODEL_SHOP', SITE_ROOT. 'module/shop/model/model/');
    define('JS_SHOP', SITE_PATH . 'module/shop/view/js/');
    define('VIEW_HOME', SITE_PATH . 'module/shop/view/');

    // MODEL_SEARCH
    define('MODEL_SEARCH', SITE_ROOT. 'module/search/model/model/');
    define('JS_SEARCH', SITE_PATH . 'module/search/view/js/');

    // MODEL AUTH
    define('MODEL_AUTH', SITE_ROOT . '/module/auth/model/model/');
    define('JS_AUTH', SITE_PATH . 'module/auth/view/js/');
    
    // MODEL SHOPCART
    define('MODEL_SHOPCART', SITE_ROOT . '/module/shopCart/model/model/');
    define('JS_SHOPCART', SITE_PATH . 'module/shopCart/view/js/');

    // MODEL DASHBOARD
    define('MODEL_DASHBOARD', SITE_ROOT . '/module/dashboard/model/model/');
    define('JS_DASHBOARD', SITE_PATH . 'module/dashboard/view/js/');

    // TEMPLATE //
    define('JS_TEMPLATE', SITE_PATH . 'view/assets/js/');
    define('VENDOR_TEMPLATE', SITE_PATH . 'view/assets/vendor/');
    define('IMG_TEMPLATE', SITE_PATH . 'view/assets/img/');
    define('CSS_TEMPLATE', SITE_PATH . 'view/assets/css/');

     // Friendly
    define('URL_FRIENDLY', TRUE);

?>