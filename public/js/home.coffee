$(document).ready ->
        x = Math.floor(Math.random() * 3) + 1
        $("a#main-img-0#{x}").css("display", "block")