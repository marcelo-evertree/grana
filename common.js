var menu_options = [{
  "label": "Dashboard",
  "url": "dashboard.html"
}, {
  "label": "Transactions",
  "url": "transactions.html"
}, {
  "label": "Settings",
  "url": "settings.html"
}, {
  "label": "Tags",
  "url": "tags.html"
}]


function header(pageName) {

  $("<div class='title'/>").text("Demo").appendTo($("#header"));

  var $menu = $("<div class='menu'>");

  $menu.appendTo($("#header"));

  for (var i = 0; i < menu_options.length; i++) {
    var $item = $("<div class='menu-item'>");
    $item.appendTo($menu);

    if (pageName === menu_options[i].label) {
      $("<span/>")
      .text(menu_options[i].label)
      .appendTo($item)
    } else {
      $("<a/>")
      .text(menu_options[i].label)
      .attr("href", menu_options[i].url)
      .appendTo($item)
    }

  }


}
