$(".main-menu-btn").on("click", function() {
    var v = $(window).width(), 
        a = $("#main-content"),
        b = $("#main-menu"),
        c = $("#main-content > nav"),
        d = $(".main-logo"),
        e = $(".main-logo-hover"),
        ax, 
        ok = (a.css("right") === 0 ? false : (a.css("right") !== "0px"));
        
    if(v < 480) 
        ax = (ok ? "0px" : "82%"); 
    else if(v < 992 && v >= 480) 
        ax = (ok ? "0px" : "50%"); 
    else 
        ax = (ok ? "0px" : "34%");

    if (ax !== "0px")
        b.css({ width: ax }); 

    a.animate({ "right": ax }, "fast"); 
    b.animate({ "right": (ok ? "-100%" : "0px") }, "fast"); 
    c.animate({ "right": ax }, "fast");
    d.animate({ "left": (ok ? "0px" : "-600px") }, "fast"); 
    e.animate({ "left": (ok ? "16px" : "-600px") }, "fast"); 
}); 