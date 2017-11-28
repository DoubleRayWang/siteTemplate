/* HTML document is loaded. DOM is ready.
-------------------------------------------*/
$(function () {
    /* FlexSlider */
    $('.flexslider').flexslider({
        animation: "fade",
        directionNav: true,
        controlNav: true
    });
    
    $(".rotate").textrotator();
    new WOW().init();
});