// build time:Fri Sep 21 2018 11:09:53 GMT+0800 (CST)
$(document).ready(function(){var t=$(".sidebar-inner");var e=CONFIG.sidebar.offset?CONFIG.sidebar.offset:12;function i(){return $(".header-inner").height()+e}function r(){var t=$(".footer-inner");var e=t.outerHeight(true)-t.outerHeight();var i=t.outerHeight(true)+e;return i}function n(t){return $("#sidebar").css({"margin-top":t})}function a(){var a=i();var f=r();var o=$("#sidebar").height()+NexT.utils.getSidebarb2tHeight();var s=$("#content").height();if(a+o<s){t.affix({offset:{top:a-e,bottom:f}})}n(a).css({"margin-left":"initial"})}function f(){$(window).off(".affix");t.removeData("bs.affix").removeClass("affix affix-top affix-bottom");a()}function o(){var t=window.matchMedia("(min-width: 991px)");t.addListener(function(t){if(t.matches){f()}})}a();o()});
//rebuild by neat 