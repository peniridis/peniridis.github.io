---
title:  Hexo+NexT v6.4.1博客优化日志
date: 2018-09-19 19:54:58
tags:
  - Hexo
  - NexT
  - 优化
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

