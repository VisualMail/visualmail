/**
* @method :: $(document).ready(function() { });
* @description :: Función iniciar cuando el Documento HTML está listo  
**/
$(document).ready(function() { 

    // Iniciar el panel móvil del diálogo 
    $('#dialogo-main').css({width: "100%", height: 840}).split({orientation:'horizontal', limit:100}); 
    $("#dialogo-panel").css({width: "100%", height: 340}).split({ orientation:'vertical', limit:10 });
    $(".js-example-basic-single").select2();
    

}); 