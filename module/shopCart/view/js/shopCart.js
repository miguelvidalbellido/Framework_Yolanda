const loadCart = () => {
    // LIMPIAMOS LA PLANTILLA
    $('#hero').remove();
    $('#footer').remove();
    $('.navbar_search').remove();
    $('#contentCart').empty();
      let token = localStorage.getItem('token');
      // console.log(token);
  
      ajaxPromise(friendlyURL('?module=auth&op=dataUser'), 'POST', 'JSON', { 'token': token })
      .then(function (data) { 
          let username = data[0]['username'];
        //   console.log(username);
  
          ajaxPromise(friendlyURL('?module=shopCart&op=loadCart'), 'POST', 'JSON', { 'username': username })
          .then(function (data) { 
            //   console.log(data);
              if(data != "error ctrl loadCart"){
                for(row in data) {
                  $('<div class="row mb-4 d-flex justify-content-between align-items-center"></div>').appendTo('#contentCart')
                  .html(
                        '<div class="col-md-2 col-lg-2 col-xl-2">'+
                          '<img  src="'+data[row].url_image+'" id="rediret-details" data-codcar="'+data[row].cod_car+'" alt="Cotton T-shirt" style="max-width: 130%; cursor:pointer;">'+
                        '</div>'+
                        '<div class="col-md-3 col-lg-3 col-xl-3">'+
                          '<h6 class="text-muted">Shirt</h6>'+
                          '<h6 class="text-black mb-0">Cotton T-shirt</h6>'+
                        '</div>'+
                        '<div class="col-md-3 col-lg-3 col-xl-2 d-flex">'+
                        "<div class='quantity-field' >"+
                        "<button class='value-button decrease-button' data-codcar='"+data[row].cod_car+"' id='lessProduct' title='Azalt'>-</button>"+
                        "<div class='number' data-codCar='"+data[row].cod_car+"' id='quantityProductDetails'>"+data[row].quantity+"</div>"+
                        "<button class='value-button increase-button' data-codcar='"+data[row].cod_car+"' id='moreProduct' title='Arrtır'>+</button>"+
                          "</div>"+
                        '</div>'+
                        '<div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">'+
                          '<h6 class="mb-0">'+data[row].price+' €</h6>'+
                        '</div>'+
                        '<div class="col-md-1 col-lg-1 col-xl-1 text-end">'+
                          '<a id="deleteProduct" style="cursor:pointer;" data-codcar="'+data[row].cod_car+'" class="text-muted"><i class="fas fa-times"></i></a>'+
                        '</div>'
                  )
                }
  
  
                $('<div class="pt-5"></div>').appendTo('#contentCart')
                .html(
                    '<hr class="my-4">'+
                    '<h6 class="mb-0"><a href="index.php?page=ctrl_shop&op=list" class="text-body"><i class="fas fa-long-arrow-alt-left me-2"></i>Volver a la tienda</a></h6>'
                )
                $('#loadDetailsCheckout').empty();
              
              // LOAD CHECKOUT LATERAL MENU 
              ajaxPromise(friendlyURL('?module=shopCart&op=loadDetailsCheckout'), 'POST', 'JSON', { 'username': username })
              .then(function (data) { 
              $('#loadDetailsCheckout').append(
                '<div class="p-5">'+
                    '<h3 class="fw-bold mb-5 mt-2 pt-1">Subtotal</h3>'+
                    '<hr class="my-4">'+
                    // '<div class="d-flex justify-content-between mb-4">'+
                    //   '<h5 class="text-uppercase">Precio total:</h5>'+
                    //   '<h5>'+data.total_carrito+'€</h5>'+
                    // '</div>'+
                    '<h5 class="text-uppercase mb-3">Shipping</h5>'+
                    '<div class="mb-4 pb-2">'+
                      '<select class="select">'+
                        '<option value="1">Standard-Delivery- €5.00</option>'+
                        '<option value="2">Two</option>'+
                        '<option value="3">Three</option>'+
                        '<option value="4">Four</option>'+
                      '</select>'+
                    '</div>'+
                    '<h5 class="text-uppercase mb-3">Añadir codigo promocional</h5>'+
                    '<div class="mb-5">'+
                      '<div class="form-outline">'+
                        '<input type="text" id="form3Examplea2" class="form-control form-control-lg" />'+
                        '<label class="form-label" for="form3Examplea2">Introduce tu codigo</label>'+
                      '</div>'+
                    '</div>'+
                    '<hr class="my-4">'+
                    '<div class="d-flex justify-content-between mb-5">'+
                      '<h5 class="text-uppercase">Precio Total</h5>'+
                      '<h5>'+data[0].total_carrito+'€</h5>'+
                    '</div>'+
  
                    '<button type="button" class="btn btn-info btn-block btn-lg" id="checkout" data-mdb-ripple-color="dark">Checkout</button>'
              );
              });
              } else {
                $('<div class="row mb-4 d-flex justify-content-between align-items-center"></div>').appendTo('#contentCart')
                .html(
                  '<div class="col text-center">'+
                    '<img src="view/assets/img/empty-cart.png" class="mx-auto d-block img-fluid" alt="Imagen no disponible">'+
                    '<p class="mt-3">Tu carrito se encuentra vacío</p>'+
                  '</div>'+
                  '<div class="pt-5">'+
                  '<hr class="my-4">'+
                    '<h6 class="mb-0"><a href="index.php?page=ctrl_shop&op=list" class="text-body"><i class="fas fa-long-arrow-alt-left me-2"></i>Volver a la tienda</a></h6>'+
                  '</div>'
                );
              }
              
          });
      });
}

const controlButtons = () => {

    let token = localStorage.getItem('token');

    $(document).on("click", "#moreProduct", function() {
        let id_car = $(this).data('codcar');
        let value = parseInt($('#quantityProductDetails[data-codCar="'+id_car+'"]').text()) + 1;

        ajaxPromise(friendlyURL('?module=auth&op=dataUser'), 'POST', 'JSON', { 'token': token })
        .then(function (data) { 
          let username = data[0]['username'];

          ajaxPromise(friendlyURL('?module=shopCart&op=changeCart'), 'POST', 'JSON', { 'username': username, 'cod_car': id_car, 'quantity': value })
          .then(function (data) { 
            let res = data[0][0].resultado;
            res == "UpdateOk" ? loadCart() : toastr.warning('El stock es insuficiente, modifica la cantidad ');
          });

        });
    });

    $(document).on("click", "#lessProduct", function() {
      let id_car = $(this).data('codcar');
      let value = parseInt($('#quantityProductDetails[data-codCar="'+id_car+'"]').text()) - 1;

      if(value >= 1) {
        ajaxPromise(friendlyURL('?module=auth&op=dataUser'), 'POST', 'JSON', { 'token': token })
        .then(function (data) { 
          let username = data[0]['username'];

          ajaxPromise(friendlyURL('?module=shopCart&op=changeCart'), 'POST', 'JSON', { 'username': username, 'cod_car': id_car, 'quantity': value })
          .then(function (data) { 
            let res = data[0][0].resultado;
            res == "UpdateOk" ? loadCart() : toastr.error('El stock es insuficiente, modifica la cantidad ');
          });

        });
      }
    });

    $(document).on("click", "#deleteProduct", function () {
      let id_car = $(this).data('codcar');
      console.log(id_car);

      ajaxPromise(friendlyURL('?module=auth&op=dataUser'), 'POST', 'JSON', { 'token': token })
      .then(function (data) { 
        let username = data[0]['username'];
        
        ajaxPromise(friendlyURL('?module=shopCart&op=removeProduct'), 'POST', 'JSON', { 'username': username, 'cod_car': id_car})
        .then(function (data) { 
          console.log(data);
          data == true ? loadCart() : toastr.error('Se ha producido un error, intentalo de nuevo en unos segundos');
        });
      
      });
    });

    $(document).on("click", "#checkout", function () {
        ajaxPromise(friendlyURL('?module=auth&op=dataUser'), 'POST', 'JSON', { 'token': token })
        .then(function (data) { 
            let username = data[0]['username'];
            // console.log(username);
            ajaxPromise(friendlyURL('?module=shopCart&op=checkout'), 'POST', 'JSON', { 'username': username })
            .then(function (data) { 
                res = data[0][0]['resultado'];
                res == 'CHECKOUT_OK' ? pedidoOK() : console.log('Se ha producido un error');
            });
        
        });
    });

    $(document).on("click", "#rediret-details", function () {
        let id_car = $(this).data('codcar');
        localStorage.setItem('codCarPreAddToCart', id_car);
        window.location.href = friendlyURL('?module=shop');
    });
    
}

const pedidoOK = () =>{
    $('#hero').remove();
    $('#footer').remove();
    $('.navbar_search').remove();
    $('#contentCart').empty();
    $('#loadDetailsCheckout').empty();

    $('<div class="row mb-4 d-flex justify-content-between align-items-center"></div>').appendTo('#contentCart')
                .html(
                '<div class="col text-center">'+
                    '<img src="view/assets/img/pedidorealizado.png" class="mx-auto d-block img-fluid" alt="Imagen no disponible">'+
                    '<p class="mt-3">El pedido se ha realizado de forma exitosa</p>'+
                '</div>'+
                '<div class="pt-5">'+
                '<hr class="my-4">'+
                    '<h6 class="mb-0"><a href="index.php?page=ctrl_shop&op=list" class="text-body"><i class="fas fa-long-arrow-alt-left me-2"></i>Volver a la tienda</a></h6>'+
                '</div>'
            );
}


  $(document).ready(function() {
    loadCart();
    // console.log("ye batiste");
    controlButtons();
});