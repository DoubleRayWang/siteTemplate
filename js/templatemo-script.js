/* HTML document is loaded. DOM is ready.
-------------------------------------------*/
$(function () {
    /* FlexSlider */
    /*$('.flexslider').flexslider({
        animation: "fade",
        directionNav: false,
        controlNav: true
    });*/
    $(".rotate").textrotator();
});
window.onload=function () {
    new WOW().init();
    $('#loading').fadeOut(200,function () {
        $(this).parent().removeClass('modal-open')
            .end().remove();
    });
}