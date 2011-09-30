$(document).ready(function() {
  var x;
  x = Math.floor(Math.random() * 3) + 1;
  return $("a#main-img-0" + x).css("display", "block");
});