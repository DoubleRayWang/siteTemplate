/* HTML document is loaded. DOM is ready.
-------------------------------------------*/
$(function () {
    /* FlexSlider */
    $('.flexslider').flexslider({
        animation: "fade",
        directionNav: false,
        controlNav: true
    });
    
    $(".rotate").textrotator();
    new WOW().init();
});