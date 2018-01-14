$(window).scroll(function() {
    $('.slide-right').each(function(){
        let imagePos = $(this).offset().top;
        let topOfWindow = $(window).scrollTop();
        if (imagePos < topOfWindow+window.innerHeight-50) {
            $(this).addClass("slideRight");
        }
    });
    $('.slide-left').each(function(){
        let imagePos = $(this).offset().top;
        let topOfWindow = $(window).scrollTop();
        if (imagePos < topOfWindow+window.innerHeight-50) {
            $(this).addClass("slideLeft");
        }
    });
});
window.onload = function () {
    $('.slide-right').each(function() {
        let imagePos = $(this).offset().top;
        let topOfWindow = $(window).scrollTop();
        if (imagePos < topOfWindow+window.innerHeight-50) {
            $(this).addClass("slideRight");
        }
    });
    $('.slide-left').each(function(){
        let imagePos = $(this).offset().top;
        let topOfWindow = $(window).scrollTop();
        if (imagePos < topOfWindow+window.innerHeight-50) {
            $(this).addClass("slideLeft");
        }
    });

};
