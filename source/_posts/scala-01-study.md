---
title: Scala学习记录（二）：
date: 2018-10-07 11:28:38
tags: 
  - Scala
copyright: true
mathjax: true
---

> Scala 学习笔记

<!-- more -->

## 高级基础
* 高阶函数
  * Scala作为一门]“函数式编程语言”, 函数是一个值,能被传递和操作
* 模式匹配
  * match表达式的高级应用，样例类
* 类型参数
  * 通过类型参数构建类和函数、方法,使之适应不同类型的参数

## 高阶函数
### 头等函数
==_**函数是一个值**_==

* 实现$\sum_a^bf(n)$
* $f(n)=n$

```
def sum1(a:Int,b:Int):Int={
  if (a>b) 0 else a+sum(a+1,b)
}
```

* $f(n)=n*2$

```
def sum2(a:Int,b:Int):Int={
  if(a>b) 0 else a*2+sum(a+1,b)
}
```
  * `def f(a:Int)=a*2`

```
def sum2(a:Int,b:Int):Int={
  if (a>b) 0 else ==f(a)==+sum(a+1,b)
}
```

* 在Scala中,函数能作为参数进行传递,函数能调用满足参数要求的不同的函数作为参
数

```
def sum(f:Int= > Int,a:Int,b:Int);:Int=
  if(a> b) 0 else f(a)l+sum(f,a+1,b)
  
def f1(a:Int)=a
def sum1(a:Int,b:Int):Int=sum(f1,a,b)

def f2(a:Int)=a*2
def sum2(a:Int,b:Int):Int=sum(f2,a,b)
```

## 匿名函数
* 不命名的函数
* `(x:Int) => x*2`
* `(x1:T1,x2:.2...) => E`
* `def sum1(a:Int,b:Int):Int=sum( (x:Int)=>x,a,b)`
* `def sum2(a:Int,b:Int):Int=sum( (x:Int)=>x*2 ,a,b)`
* 匿名函数的作用域非常小,往往只在参数中使用,其作用范围即是调用该匿名函数参数的函数体
  * `valf2 = (a:Int) => a*2 // val m=f2(a)`
  * `val sum3 = sum2_ // val m=sum3(a,b)`

```
val f1=(a:nt)=>a
val f2=(a:Int)=>a*2
val f3=(a:Int)=>a*3

def mul(a:Int) = (b:Int) => b*a
val f1=mul(1)
val f2=mu|(2)
val f3=mul(3)

def sum4(f:Int= > Int)= (Int,Int) => Int={
  def sum5(a:Int,b:Int):Int=sum(f,a,b) ; sum5 
}
val f4=sum4(f3)
```
## 柯里化

```
def A(a:T1,b:T2,c:T3,d:T4)= E
def A(a:T1)(b:T2)(c:T3)(d:T4)=E
defA= (a:T1) => (b:T2)=> (c:T3) => (d:T4)=> E

def sum4(f:Int= >Int)(a:Int,b:Int)=
  if(a>b) 0 else f(a)+sum4(f)(a+1b)
  
val f5=sum4(f2)(7,12)
val f6=sum4(f3)_
f5:Int=104
f6: (Int,Int) => (Int) =<funtion>
val f7=f6(7,12)
```
## 控制抽象
* 求平方根迭代算法$x_{n+1} = \frac{x_n + \frac{x}{x_n}}{2}$