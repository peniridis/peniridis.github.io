---
title:  Hexo+NexT v6.4.1博客优化日志
date: 2018-09-19 19:54:58
description: 
tags:
  - Hexo
  - NexT
  - 优化
  - 折腾
copyright: true
---

> 记录Hexo优化及主题NexT美化

<!-- more -->

@toc

## 主题插件
### 「盘古之白」
> 為什麼你們就是不能加個空格呢？
> by **[pangu.js](https://github.com/vinta/pangu.js)**

「盤古之白」，它劈開了全形字和半形字之間的混沌。另有研究顯示，打字的時候不喜歡在中文和英文之間加空格的人，感情路都走得很辛苦，有七成的比例會在 34 歲的時候跟自己不愛的人結婚，而其餘三成的人最後只能把遺產留給自己的貓。畢竟愛情跟書寫都需要適時地留白。

與大家共勉之。

```
$ cd themes/next
$ git clone https://github.com/theme-next/theme-next-pangu.git source/lib/pangu
```

_themes/next/\_config.yaml_修改

```yaml
# Pangu Support
# Dependencies: https://github.com/theme-next/theme-next-pangu
# For more information: https://github.com/vinta/pangu.js
# pangu: false
pangu: true
```

### 静态资源压缩

常规的做法是使用`gulp`来进行压缩，`gulp`是`Node.js`下的自动构建工具，通过一列的task执行步骤进行自动流程化处理。

这里使用`hexo-neat`压缩插件，配置简单，可以自动完成静态资源的压缩

```
$ npm install hexo-neat --save
```

添加以下配置到站点配置文件`_config.yml`的末尾

```
# hexo-neat
# 博文压缩
neat_enable: true
# 压缩html
neat_html:
  enable: true
  exclude:
# 压缩css  
neat_css:
  enable: true
  exclude:
    - '**/*.min.css'
# 压缩js
neat_js:
  enable: true
  mangle: true
  output:
  compress:
  exclude:
    - '**/*.min.js'
    - '**/jquery.fancybox.pack.js'
    - '**/index.js'  
```

### 更换Pandoc引擎解析数学公式
默认Marked引擎渲染数学公式时与Latex冲突，换用比较重量级的插件Pandoc

npm uninstall hexo-renderer-marked --save

```
$ npm uninstall hexo-renderer-marked --save
$ npm install hexo-renderer-pandoc@0.2.3 --save 
```

注：hexo-renderer-pandoc最新version 0.2.4仍有bug详见[issue #21](https://github.com/wzpan/hexo-renderer-pandoc/issues/21)

## 增加功能
### 运行时间
修改文件位置：`~/blog/themes/next/layout/_custom/sidebar.swig`

```javascript
<div id="days"></div>
<script>
function show_date_time(){
window.setTimeout("show_date_time()", 1000);
BirthDay=new Date("09/10/2018 00:00:00");
today=new Date();
timeold=(today.getTime()-BirthDay.getTime());
sectimeold=timeold/1000
secondsold=Math.floor(sectimeold);
msPerDay=24*60*60*1000
e_daysold=timeold/msPerDay
daysold=Math.floor(e_daysold);
e_hrsold=(e_daysold-daysold)*24;
hrsold=setzero(Math.floor(e_hrsold));
e_minsold=(e_hrsold-hrsold)*60;
minsold=setzero(Math.floor((e_hrsold-hrsold)*60));
seconds=setzero(Math.floor((e_minsold-minsold)*60));
document.getElementById('days').innerHTML="已运行"+daysold+"天"+hrsold+"小时"+minsold+"分"+seconds+"秒";
}
function setzero(i){
if (i<10)
{i="0" + i};
return i;
}
show_date_time();
</script>
```

修改样式文件位置：`~/blog/themes/next/source/css/_custom/custom.styl`

```css
// 自定义的侧栏时间样式
#days {
  display: block;
  color: rgb(7, 179, 155);
  font-size: 13px;
  margin-top: 15px;
  text-align: center;
}
```
效果
![Xnip2018-09-22_20-56-44](images/media/Xnip2018-09-22_20-56-44.jpg)

