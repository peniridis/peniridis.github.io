---
title: Apache HBase ™ Reference Guide：Hbase官方指南3.0（一）「数据模型」
date: 2018-09-17 13:56:03
tags: 
  - Hbase
  - 翻译
  - Guide
  - 大数据
copyright: true
mathjax: true
---

> 校验Hbase官方指南文档[Apache HBase ™ Reference Guide Version 3.0.0-SNAPSHOT](https://hbase.apache.org/book.html)

> Data Model部分No.20到No.32小节 

<!-- more -->

@toc

## 数据模型
在HBase中，数据存储在具有行和列的表中。关系型数据库（RDBMS）中有相似的概念，这并不是有用的类比。不过，HBase可以被认为是一个多维度的数据映射存储。

**HBase Data Model Terminology Hbase（数据模型术语）**

* Table（表）

HBase表由多行组成。

* Row（列）

HBase中的一行由一个行键和一个或多个具有与之关联的值的列组成。行存储时，行按字母顺序排序。因此，行的key的设计就显得非常重要。数据的存储目标是相近的数据存储到一起。一个常用的行的key的格式是网站域名。如果你的行的key是域名，你应该将域名进行反转(org.apache.www, org.apache.mail, org.apache.jira)再存储。这样的话，所有Apache域名将会存储在一起，而不是基于子域名的首字母分散在各处。

* Column（列）

HBase中的列包含用「:」(冒号)分隔开的列族和列的限定符。

* Column Family（列族）

因为性能的原因，列族物理上包含一组列和它们的值。每一个列族拥有一系列的存储属性，例如值是否缓存在内存中，数据是否要压缩或者他的行key是否要加密等等。表格中的每一行拥有相同的列族，尽管一个给定的行可能没有存储任何数据在一个给定的列族中。

* Column Qualifier（列限定符）

列的限定符是列族中数据的索引。例如给定了一个列族`content`，那么限定符可能是`content:html`，也可以是`content:pdf`。列族在创建表格时是确定的了，但是列的限定符是可变的，并且行之间可能有很大差异。

* Cell（单元）

单元是由行、列族、列限定符、值和代表值版本的时间戳组成的。

* Timestamp（时间戳）

时间戳是写在值旁边的一个用于区分值的版本的数据。默认情况下，时间戳表示的是当数据写入时RegionSever的时间点，但你也可以在写入数据时指定一个不同的时间戳。

## 概念视图
你可以读一下 Jim R写的[Understanding HBase and BigTable](http://jimbojw.com/wiki/index.php?title=Understanding_Hbase_and_BigTable) 博客来简单了解一下HBase的数据模型，另一个好的理解是Amandeep Khurana.的 [Introduction to Basic Schema Design](http://0b4af6cdc2f0c5998459-c0245c5c937c5dedcca3f1764ecc9b2f.r43.cf2.rackcdn.com/9353-login1210_khurana.pdf) 。

学习不同的方面的资料可能会帮助你更透彻地了解HBase的设计。所链接的文章覆盖本部分所讲的信息。

接下来的例子是  取自[BigTable](http://research.google.com/archive/bigtable.html) 中第二页中的例子，在此基础上做了些许的改变。一个名为webable的表格，表格中有两行（com.cnn.www 和 com.example.www）和三个列族（contents, anchor, 和 people）。在这个例子当中，第一行(com.cnn.www)中anchor包含两列（anchor:cssnsi.com, anchor:my.look.ca）和content包含一列（contents:html）。这个例子中com.cnn.www拥有5个版本而com.example.www有一个版本。contents:html列中包含给定网页的整个HTML。anchor限定符包含能够表示行的站点以及链接中文本。People列族表示跟站点有关的人。

> 列名
> 按照所定义好的，一个列名的格式为列族名前缀加限定符。例如，列contents:html由列族contents和html限定符。冒号「:」用于将列族和列限定符分开。

Table 6. Table `webtable`

| 行键           | 时间戳 |       列族contents     | 列族anchor | 列族people |
| ------------- |--- | ------------------------- | ----------------------- |-- |
| "com.cnn.www" | t9 |                           | anchor:cnnsi.com = "CNN" |   |
| "com.cnn.www" | t8 |                           | anchor:cnnsi.com = "CNN" |   |
| "com.cnn.www" | t6 | contents:html = "&lt;html&gt;…​" |    |   |
| "com.cnn.www" | t5 | contents:html = "&lt;html&gt;…​" |    |   |
| "com.cnn.www" | t3 | contents:html = "&lt;html&gt;…​" |    |   |
| "com.example.www" | t5 | contents:html = "&lt;html&gt;…​" |    | people:author = "John Doe" |

在HBase中，表格中的单元如果是空将不占用空间或者事实上不存在。这就使得HBase看起来“稀疏”。表格视图不是唯一方式来查看HBase中数据，甚至不是最精确的。下面的方式以多维度映射的方式来表达相同的信息。这只是一个说明示例的模型可能不是严格准确的。

```
{
  "com.cnn.www": {
    contents: {
      t6: contents:html: "<html>..."
      t5: contents:html: "<html>..."
      t3: contents:html: "<html>..."
    }
    anchor: {
      t9: anchor:cnnsi.com = "CNN"
      t8: anchor:my.look.ca = "CNN.com"
    }
    people: {}
  }
  "com.example.www": {
    contents: {
      t5: contents:html: "<html>..."
    }
    anchor: {}
    people: {
      t5: people:author: "John Doe"
    }
  }
}
```

## 物理视图
尽管在概念层次，表可能看起来是由一些列稀疏的行组成，但他们是通过列族来存储的。一个新建的限定符(column\_family:column\_qualifier)可以随时地添加到已存在的列族中。
_Table 7. 列族 `anchor`_

| 行键      | 时间戳    |  列族anchor | 
| --------- | -------- | :-----: |
| "com.cnn.www"    | t9  | anchor:cnnsi.com = "CNN" |
| "com.cnn.www"     | t8     | anchor:my.look.ca = "CNN.com" | 

_Table 8. 列族 `contents`_

| 行键      | 时间戳    |  列族contents | 
| --------- | -------- | ----- |
| "com.cnn.www"    | t6  | contents:html = "&lt;html&gt;…​" |
| "com.cnn.www"     | t5     | contents:html = "&lt;html&gt;…​" | 
| "com.cnn.www" |   t3  |  contents:html = "&lt;html&gt;…​"  |

概念视图中的空单元实际上是没有进行存储的。因此对于返回时间戳为t8的`contents:html`的值的请求，结果为空。同样的，一个返回时间戳为t9的`anchor:my.look.ca`的值的请求，结果也为空。然而，如果没有指定时间戳的话，那么会返回特定列的最新值。对有多个版本的列，优先返回最新的值，因为时间戳是按照递减顺序存储的。因此对于一个返回`com.cnn.www`里面所有的列的值并且没有指定时间戳的请求，返回的结果会是时间戳为t6的`contents:html`的值、时间戳 t9的`anchor:cnnsi.com`的值和时间戳t8的 `anchor:my.look.ca` 。

关于Apache Hbase如何存储数据的内部细节，请查看  [regions.arch](http://hbase.apache.org/book.html#regions.arch).

## 命名空间

命名空间是一个类似于关系型数据库系统中的数据库的逻辑上的表分组的概念。这个抽象的概念为即将到来的多租户相关特性奠定了基础：

* 配额管理 ([HBASE-8410](https://issues.apache.org/jira/browse/HBASE-8410)) - 限制命名空间可以使用的资源量（即区域，表）。
* 命名空间安全管理 ([HBASE-9206](https://issues.apache.org/jira/browse/HBASE-9206)) - 为租户提供另一级别的安全管理。
* 区域服务器组 ([HBASE-6721](https://issues.apache.org/jira/browse/HBASE-6721)) - 可以将命名空间/表固定到RegionServers的子集上，从而保证粗略的隔离级别。


### 命名空间管理
命名空间可以被创建、移除和修改。命名空间关系的指定是在创建表格通过指定一个完全限定表名的形式完成的：

```xml
<table namespace>:<table qualifier>
```

_Example 7. Examples_

```
#Create a namespace
create_namespace 'my_ns'

#create my_table in my_ns namespace
create 'my_ns:my_table', 'fam'

#drop namespace
drop_namespace 'my_ns'

#alter namespace
alter_namespace 'my_ns', {METHOD => 'set', 'PROPERTY_NAME' => 'PROPERTY_VALUE'}
```

### 预定义命名空间
有两种预定义的特殊的命名空间

* hbase – 系统命名空间, 用于包含HBase内部表
* default – 没有明确指定命名空间的表将会自动落入这个命名空间

_Example 8. Examples_

```
#namespace=foo and table qualifier=bar
create 'foo:bar', 'fam'

#namespace=default and table qualifier=bar
create 'bar', 'fam'
```

## 表
在Schema（模式）定义时预先声明表。

## 行
行键是未解释的字节。行是按照字典顺序进行排序的并且最小的排在前面。空的字节数据用来表示表格的命名空间的开头和结尾。

## 列族
列在HBase中是归入到列族里面的。一个列族的所有列成员都有相同的前缀。例如，列`courses:history`和`cources:math`是cources列族的成员，冒号用于将列族和列限定符分开。列族前缀必须由可打印输出的字符组成。列限定符可以由任意字节组成。列族必须在结构定义阶段预先声明好，而列则不需要在结构设计阶段预先定义，而是可以在表的创建和运行阶段动态生成。

物理上来说，所有的列族成员都是存储在文件系统。因为调试和存储参数都是在列族级别完成，建议所有的列族都要拥有相同的访问模式和大小特征。

## 单元
一个{row,column,version}完全指定了HBase的一个单元。单元内容是未解释的字节

## 数据模型操作
数据模型的四个主要操作是Get，Put，Scan和Delete。可以通过Table实例进行操作。

### Get
[Get](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/Get.html) 返回指定行的属性 Gets 通过 [Table.get](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/Table.html#get(org.apache.hadoop.hbase.client.Get)).执行。

### Put
[Put](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/Put.html) 操作是在行键不存在时添加新行或者行键已经存在时进行更新。 Puts 是通过 [Table.put](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/Table.html#put(org.apache.hadoop.hbase.client.Put)) (写缓存) 或者[Table.batch](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/Table.html#batch(java.util.List,%20java.lang.Object%5B%5D)) (没有写缓存)执行的。

### Scans
[Scan](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/Scan.html) 允许为指定属性迭代多行。

下面是表格实例中Scan的例子。假设一个表格里面有"row1", "row2", "row3"，然后有另外一组行键为"abc1", "abc2",和"abc3"。下面的例子展示如何设置一个Scan实例来返回以“row”开头的行。

```java
public static final byte[] CF = "cf".getBytes();
 
public static final byte[] ATTR = "attr".getBytes();
 
...
 
 
 
Table table = ...      // instantiate a Table instance
 
 
 
Scan scan = new Scan();
 
scan.addColumn(CF, ATTR);
 
scan.setRowPrefixFilter(Bytes.toBytes("row"));
 
ResultScanner rs = table.getScanner(scan);
 
try {
 
  for (Result r = rs.next(); r != null; r = rs.next()) {
 
    // process result...
 
  }
 
} finally {
 
  rs.close();  // always close the ResultScanner!
 
}

```

需要说明的是通常最简单的指定Scan的一个特定停止点的方法是使用[InclusiveStopFilter](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/filter/InclusiveStopFilter.html) 类。

### Delete
[Delete](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/Delete.html) 操作是将一个行从表中移除. Deletes 通过 [Table.delete](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/Table.html#delete(org.apache.hadoop.hbase.client.Delete))执行。

HBase不会立刻对数据的进行操作（可以理解为不对数据执行删除操作），而是为死亡数据创建一个称为墓碑的标签。这个墓碑和死亡数据会在重要精简工作中被删除。

查看 [version.delete](http://hbase.apache.org/book.html#version.delete) 获取更多关于列的版本删除的信息，查看 [compaction](http://hbase.apache.org/book.html#compaction) 获取关于压缩工作的更多信息。

## 版本
A _{row, column, version}_ 在HBase完全指定一个单元。理论上来说行和列都一样的单元的数量是无限的，因为单元的地址是通过版本这个维度来区分的。

行和列使用字节来表达，而版本是通过长整型来指定的。典型来说，这个长时间实例就像`java.util.Date.getTime()` 或者 System.currentTimeMillis()返回的一样，以毫秒为单位，返回当前时间和  _January 1, 1970 UTC的时间差_ 。

HBase的版本维度以递减顺序存储，以致读取一个存储的文件时，返回的是最新版本的数据。

关于单元的版本有许多的困扰，尤其是：

* 如果多个数据写到一个具有相同版本的单元里，只能获取到最后写入的那个
* 以非递增的版本顺序写入也是可以的。

下面我们将描述HBase中版本维度是如何运作的。可以看 [HBASE-2406](https://issues.apache.org/jira/browse/HBASE-2406) 关于HBase版本的讨论。 [Bending time in HBase](http://outerthought.org/blog/417-ot.html) 是关于HBase的版本或者时间维度的好读物。它提供了比这里更多的关于版本的细节信息。正如这里写到的，这里提到的_覆盖存在的时间戳_的限制将不再存在。这部分只是Bruno Dumon所写的关于版本的基本大纲。

### 指定版本的存储数量
版本的最大存储数量是列结构的一个部分并且在表格创建时指定，或者通过`alter`命令行，或者通过 `HColumnDescriptor.DEFAULT_VERSIONS`来修改。HBase0.96之前，默认数量是3，HBase0.96之后改为1.

_Example 13. 修改一个列族的最大版本数_ 

> 这个例子使用HBase Shell来修改列族 f1的最大版本数为5，你也可以使用 [HColumnDescriptor](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/HColumnDescriptor.html)来实现。

```
hbase> alter ‘t1′, NAME => ‘f1′, VERSIONS => 5
```

_Example 14. 修改一个列族的最小版本数Modify_

> 你也可以通过指定最小半本书来存储列族。默认情况下，该值为零，意味着这个属性是禁用的。下面的例子是通过HBase Shell设置列族f1中的所有列的最小版本数为2。你也可以通过 [HColumnDescriptor](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/HColumnDescriptor.html)来实现。

```
hbase> alter ‘t1′, NAME => ‘f1′, MIN_VERSIONS => 2
```

从HBase0.98.2开始，你可以通过设定在_hbase-site.xml_中设置hbase.column.max.version属性为所有新建的列指定一个全局的默认的最大版本数。

### 版本和HBase 操作
在这部分我们来看一下版本维度在HBase的每个核心操作中的表现。
#### Get/Scan
Get是通过获取Scan的第一个数据来实现的。下面的讨论适用于 [Get](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/Get.html) 和 [Scans](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/Scan.html).。

默认情况下，如果你没有指定明确的版本，当你执行一个Get操作时，那个版本为最大值的单元将被返回（可能是也可能不是最新写人的那个）。默认的行为可以通过下面方式来修改：

*   返回不止一个版本 查看 [Get.setMaxVersions()](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/Get.html#setMaxVersions())
*   返回最新版本以外的版本, 查看 [Get.setTimeRange()](http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/Get.html#setTimeRange(long,%20long))

想要获得小于或等于固定值的最新版本，仅仅通过使用一个0到期望版本的范围和设置最大版本数为1就可以实现获得一个特定时间点的最新版本的记录。

#### 默认的Get 例子

下面例子仅仅返回行的当前版本。
```java
public static final byte[] CF = "cf".getBytes();
 
public static final byte[] ATTR = "attr".getBytes();
 
...
 
Get get = new Get(Bytes.toBytes("row1"));
 
Result r = table.get(get);
 
byte[] b = r.getValue(CF, ATTR);  // returns current version of value

```

#### Get版本的例

下面是获得行的最新3个版本的例子：
```java
public static final byte[] CF = "cf".getBytes();
 
public static final byte[] ATTR = "attr".getBytes();
 
...
 
Get get = new Get(Bytes.toBytes("row1"));
 
get.setMaxVersions(3);  // will return last 3 versions of row
 
Result r = table.get(get);
 
byte[] b = r.getValue(CF, ATTR);  // returns current version of value
 
List<KeyValue> kv = r.getColumn(CF, ATTR);  // returns all versions of this column

```

#### Put
Put操作常常是以固定的时间戳来创建一个新单元。默认情况下，系统使用服务的 currentTimeMillis，但是你也可以为每一个列自己指定版本（长整型）。这就意味着你可以指定一个过去或者未来的时间点，或者不是时间格式的长整型。

为了覆盖已经存在的值，对和那个你想要覆盖的单元完全一样的row、column和version进行put操作。

 _隐式版本例子_
下面Put是以当前时间为版本的隐式操作
```java
public static final byte[] CF = "cf".getBytes();
 
public static final byte[] ATTR = "attr".getBytes();
 
...
 
Put put = new Put(Bytes.toBytes(row));
 
put.add(CF, ATTR, Bytes.toBytes( data));
 
table.put(put);

```
 _显示版本例子_

下面的put是显示指定时间戳的操作。

```java
public static final byte[] CF = "cf".getBytes();
 
public static final byte[] ATTR = "attr".getBytes();
 
...
 
Put put = new Put( Bytes.toBytes(row));
 
long explicitTimeInMs = 555;  // just an example
 
put.add(CF, ATTR, explicitTimeInMs, Bytes.toBytes(data));
 
table.put(put);

```

警告: 版本时间戳是HBase内部用来计算数据的存活时间的。它最好避免自己设置。最好是将时间戳作为行的单独属性或者作为key的一部分，或者两者都有。

#### Delete
There are three different types of internal delete markers. See Lars Hofhansl’s blog for discussion of his attempt adding another, [Scanning in HBase: Prefix Delete Marker](http://hadoop-hbase.blogspot.com/2012/01/scanning-in-hbase.html).

有三种不同的删除类型。可以看看Lars Hofhansl所写的博客 [Scanning in HBase: Prefix Delete Marker](http://hadoop-hbase.blogspot.com/2012/01/scanning-in-hbase.html).

* Delete:列的指定版本
* Delete column:列的所有版本
* Delete family:特定列族里面的所有列。

当要删除整个行时，HBase将会在内部为每一个列族创建一个墓碑。

删除通过创建一个墓碑标签来工作的。例如，让我们来设想我们要删除一个行。为此你可指定一个版本，或者使用默认的currentTimeMillis 。这就是删除小于等于该版本的所有单元。HBase不会修改数据，例如删除操作将不会立刻删除满足删除条件的文件。相反的，称为墓碑的会被写入，用来掩饰被删除的数据。当HBase执行一个压缩操作，墓碑将会执行一个真正地删除死亡值和墓碑自己的删除操作。如果你的删除操作指定的版本大于目前所有的版本，那么可以认为是删除整个行的数据。

你可以在 [Put w/timestamp → Deleteall → Put w/ timestamp fails](http://comments.gmane.org/gmane.comp.java.hadoop.hbase.user/28421) 用户邮件列表中查看关于删除和版本之间的相互影响的有益信息。

keyvalue也可以到[keyvalue](http://hbase.apache.org/book.html#keyvalue) 查看更多关于内部KeyValue格式的信息。

删除标签会在下一次仓库压缩操作中被清理掉，除非为列族设置了 KEEP\_DELETED\_CELLS (查看 [Keeping Deleted Cells](http://hbase.apache.org/book.html#cf.keep.deleted))。为了保证删除时间的可配置性，你可以通过在  _hbase-site.xml_ 。中hbase.hstore.time.to.purge.deletes属性来设置TTL（生存时间）。如果 hbase.hstore.time.to.purge.deletes没有设置或者设置为0，所有的删除标签包括哪些墓碑都会在下一次精简操作中被干掉。此外，未来带有时间戳的删除标签将会保持到发生在hbase.hstore.time.to.purge.deletes加上代表标签的时间戳的时间和的下一次精简操作。

> This behavior represents a fix for an unexpected change that was introduced in HBase 0.94, and was fixed in [HBASE-10118](https://issues.apache.org/jira/browse/HBASE-10118). The change has been backported to HBase 0.94 and newer branches.

### Optional New Version and Delete behavior in HBase-2.0.0

In `hbase-2.0.0`, the operator can specify an alternate version and delete treatment by setting the column descriptor property`NEW_VERSION_BEHAVIOR` to true (To set a property on a column family descriptor, you must first disable the table and then alter the column family descriptor; see [Keeping Deleted Cells](https://hbase.apache.org/book.html#cf.keep.deleted) for an example of editing an attribute on a column family descriptor).

The 'new version behavior', undoes the limitations listed below whereby a `Delete` ALWAYS overshadows a `Put` if at the same location — i.e. same row, column family, qualifier and timestamp — regardless of which arrived first. Version accounting is also changed as deleted versions are considered toward total version count. This is done to ensure results are not changed should a major compaction intercede. See `HBASE-15968` and linked issues for discussion.

Running with this new configuration currently costs; we factor the Cell MVCC on every compare so we burn more CPU. The slow down will depend. In testing we’ve seen between 0% and 25% degradation.

If replicating, it is advised that you run with the new serial replication feature (See `HBASE-9465`; the serial replication feature did NOT make it into `hbase-2.0.0` but should arrive in a subsequent hbase-2.x release) as now the order in which Mutations arrive is a factor.

### 当前的局限性
#### Deletes mask Puts删除覆盖插入/更新
删除操作覆盖插入/更新操作，即使put在delete之后执行的。可以查看 [HBASE-2256](https://issues.apache.org/jira/browse/HBASE-2256). 还记得一个删除写入一个墓碑，只有当下一次精简操作发生时才会执行真正地删除操作。假设你执行了一个删除全部小于等于T的操作。在此之外又做了一个时间戳为T的put操作。这个put操作即使是发生在delete之后，也会被delete墓碑所覆盖。执行put的时候不会报错，不过当你执行一个get的时候会发现执行无效。你会在精简操作之后重新开始工作。如果你在put的使用的递增的版本，那么这些问题将不会出现。但如果你不在意时间，在执行delelte后立刻执行put的话，那么它们将有可能发生在同一时间点，这将会导致上述问题的出现。
#### 精简操作影响查询结果
创建三个版本为t1,t2,t3的单元，并且设置最大版本数为2.所以当我们查询所有版本时，只会返回t2和t3。但是当你删除版本t2和t3的时候，版本t1会重新出现。显然，一旦重要精简工作运行之后，这样的行为就不会再出现。（查看 [Bendingtime in HBase](http://outerthought.org/blog/417-ot.html).）

## 排序次序
HBase中所有的数据模型操作返回的数据都是经过排序的。首先是行排序，其次是列族，接着是列限定符，最后是时间戳（递减排序，左右最新的记录最先返回）

## 列元数据
所有列的元数据都存储在一个列族的内部KeyValue实例中。因此，HBsase不仅支持一行中有多列，而且支持行之间的列的差异多样化。跟踪列名是你的责任。

唯一获取一个列族的所有列的方法是处理所有的行。查看 [keyvalue](http://hbase.apache.org/book.html#keyvalue)获得更多关于HBase内部如何存储数据的信息。

## Joins
HBase是否支持join是一个常见的问题，答案是没有，至少没办法像RDBMS那样支持（例如等价式join或者外部join）。正如本章节所阐述的，HBase中读取数据的操作是Get和Scan。

然而，这不意味着等价式join功能没办法在你的应用中实现，但是你必须自己实现。两种主要策略是将数据非结构化地写到HBase中，或者查找表格然后在应用中或者MapReduce代码中实现join操作（正如RDBMS所演示的，将根据表格的大小会有几种不同的策略，例如嵌套使循环和hash-join）。哪个是最好的方法？这将依赖于你想做什么，没有一种方案能够应对各种情况。

## ACID
查看 [ACID Semantics](http://hbase.apache.org/acid-semantics.html). Lars Hofhansl也写了一份报告 [ACID in HBase](http://hadoop-hbase.blogspot.com/2012/03/acid-in-hbase.html).
