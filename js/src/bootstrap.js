// build time:Sat Sep 22 2018 21:36:30 GMT+0800 (CST)
$(document).ready(function(){var e=["https://i.loli.net/2018/09/21/5ba44c011bc55.jpg"];var o=Math.floor(Math.random()*(e.length+1));if(o==e.length){$("body").css({"background-color":"white"})}else{var t="url("+e[o]+")";$("body").css({background:t,"background-attachment":"fixed","background-size":"cover"})}$(document).trigger("bootstrap:before");CONFIG.fastclick&&NexT.utils.isMobile()&&window.FastClick.attach(document.body);CONFIG.lazyload&&NexT.utils.lazyLoadPostsImages();NexT.utils.registerESCKeyEvent();NexT.utils.registerBackToTop();$(".site-nav-toggle button").on("click",function(){var e=$(".site-nav");var o="site-nav-on";var t=e.hasClass(o);var a=t?"slideUp":"slideDown";var i=t?"removeClass":"addClass";e.stop()[a]("fast",function(){e[i](o)})});CONFIG.fancybox&&NexT.utils.wrapImageWithFancyBox();CONFIG.tabs&&NexT.utils.registerTabsTag();NexT.utils.embeddedVideoTransformer();NexT.motion.integrator.add(NexT.motion.middleWares.logo).add(NexT.motion.middleWares.menu).add(NexT.motion.middleWares.postList).add(NexT.motion.middleWares.sidebar);$(document).trigger("motion:before");CONFIG.motion.enable&&NexT.motion.integrator.bootstrap();$(document).trigger("bootstrap:after")});
//rebuild by neat 