---
title: Scrapy-cluster分布式爬虫
date: 2018-09-10 20:45:21
tags:
copyright: true
---
> 记录搭建scrapy-cluster以及管理工具scrapyd+spiderkeeper

<!-- more -->

 - 基于Scrapy-cluster库的kafka-monitor可以实现分布式爬虫
 - Scrapyd+Spiderkeeper实现爬虫的可视化管理

## 环境

| IP | Role |
| --- | --- |
| 168.\*.*.118 | Scrapy-cluster,scrapyd,spiderkeeper |
| 168.\*.*.119 | Scrapy-cluster,scrapyd,kafka,redis,zookeeper |

```
# cat /etc/redhat-release 
CentOS Linux release 7.4.1708 (Core) 
# python -V
Python 2.7.5
# java -version
openjdk version "1.8.0_181"
OpenJDK Runtime Environment (build 1.8.0_181-b13)
OpenJDK 64-Bit Server VM (build 25.181-b13, mixed mode)
```

## Zookeeper 单机配置

* 下载并配置

```
# wget http://mirror.bit.edu.cn/apache/zookeeper/zookeeper-3.4.13/zookeeper-3.4.13.tar.gz
# tar -zxvf zookeeper-3.4.13.tar.gz
# cd zookeeper-3.4.13/conf
# cp zoo_sample.cfg zoo.cfg
# cd ..
# PATH=/opt/zookeeper-3.4.13/bin:$PATH
# echo 'export PATH=/opt/zookeeper-3.4.13/bin:$PATH' > /etc/profile.d/zoo.sh
```

* 单节点启动

```
# zkServer.sh status
ZooKeeper JMX enabled by default
Using config: /opt/zookeeper-3.4.13/bin/../conf/zoo.cfg
Error contacting service. It is probably not running.

# zkServer.sh start
```

## kafka 单机配置
* 下载

```
# wget http://mirrors.hust.edu.cn/apache/kafka/2.0.0/kafka_2.12-2.0.0.tgz
# tar -zxvf kafka_2.12-2.0.0.tgz
# cd kafka_2.12-2.0.0/
```

* 配置

```sh
# vim config/server.properties

############################# Server Basics #############################

# The id of the broker. This must be set to a unique integer for each broker.
broker.id=0                     # kafka的机器编号，
host.name = 168.*.*.119         # 绑定ip
port=9092                        # 默认端口9092，
# Switch to enable topic deletion or not, default value is false
delete.topic.enable=true
############################# Zookeeper #############################
zookeeper.connect=localhost:2181
```
* 启动

```
nohup bin/kafka-server-start.sh config/server.properties & 
```
停止命令`bin/kafka-server-stop.sh config/server.properties`

## redis 单机配置
* 安装配置


```
# yum -y install redis
# vim /etc/redis.conf
bind 168.*.*.119
```
* 启动

```
# systemctl start redis.service
```

## scrapy-cluster 单机配置

```
# git clone https://github.com/istresearch/scrapy-cluster.git
# cd scrapy-cluster
# pip install -r requirements.txt
```
* 离线运行单元测试,以确保一切似乎正常

```
# ./run_offline_tests.sh
```
* 修改配置

```
# vim kafka-monitor/settings.py
# vim redis-monitor/settings.py
# vim crawlers/crawling/settings.py
```
* 修改以下

```
# Redis host configuration
REDIS_HOST = '168.*.*.119'
REDIS_PORT = 6379
REDIS_DB = 0

KAFKA_HOSTS = '168.*.*.119:9092'
KAFKA_TOPIC_PREFIX = 'demo'
KAFKA_CONN_TIMEOUT = 5
KAFKA_APPID_TOPICS = False
KAFKA_PRODUCER_BATCH_LINGER_MS = 25  # 25 ms before flush
KAFKA_PRODUCER_BUFFER_BYTES = 4 * 1024 * 1024  # 4MB before blocking

# Zookeeper Settings
ZOOKEEPER_ASSIGN_PATH = '/scrapy-cluster/crawler/'
ZOOKEEPER_ID = 'all'
ZOOKEEPER_HOSTS = '168.*.*.119:2181'
```
* 启动监听

```
# nohup python kafka_monitor.py run >> /root/scrapy-cluster/kafka-monitor/kafka_monitor.log 2>&1 &
# nohup python redis_monitor.py >> /root/scrapy-cluster/redis-monitor/redis_monitor.log 2>&1 &
```

## scrapyd 爬虫管理工具配置
* 安装

```
# pip install scrapyd
```
* 配置


```
# sudo mkdir /etc/scrapyd
# sudo vi /etc/scrapyd/scrapyd.conf
```

```
[scrapyd]
eggs_dir    = eggs
logs_dir    = logs
items_dir   =
jobs_to_keep = 5
dbs_dir     = dbs
max_proc    = 0
max_proc_per_cpu = 10
finished_to_keep = 100
poll_interval = 5.0
bind_address = 0.0.0.0
http_port   = 6800
debug       = off
runner      = scrapyd.runner
application = scrapyd.app.application
launcher    = scrapyd.launcher.Launcher
webroot     = scrapyd.website.Root

[services]
schedule.json     = scrapyd.webservice.Schedule
cancel.json       = scrapyd.webservice.Cancel
addversion.json   = scrapyd.webservice.AddVersion
listprojects.json = scrapyd.webservice.ListProjects
listversions.json = scrapyd.webservice.ListVersions
listspiders.json  = scrapyd.webservice.ListSpiders
delproject.json   = scrapyd.webservice.DeleteProject
delversion.json   = scrapyd.webservice.DeleteVersion
listjobs.json     = scrapyd.webservice.ListJobs
daemonstatus.json = scrapyd.webservice.DaemonStatus
```

* 启动

```
# nohup scrapyd >> /root/scrapy-cluster/scrapyd.log 2>&1 &
```
> 建议做Nginx反向代理

* ***启动异常***

```
File "/usr/local/lib/python3.6/site-packages/scrapyd-1.2.0-py3.6.egg/scrapyd/app.py", line 2, in <module>
from twisted.application.internet import TimerService, TCPServer
File "/usr/local/lib64/python3.6/site-packages/twisted/application/internet.py", line 54, in <module>
from automat import MethodicalMachine
File "/usr/local/lib/python3.6/site-packages/automat/__init__.py", line 2, in <module>
from ._methodical import MethodicalMachine
File "/usr/local/lib/python3.6/site-packages/automat/_methodical.py", line 210, in <module>
    class MethodicalInput(object):
File "/usr/local/lib/python3.6/site-packages/automat/_methodical.py", line 220, in MethodicalInput
    @argSpec.default
builtins.TypeError: '_Nothing' object is not callable


Failed to load application: '_Nothing' object is not callable
```
* ***解决：Automat降级***

```
pip install Automat==0.6.0
```

## Spiderkeeper 爬虫管理界面配置

* 安装


```
pip install SpiderKeeper
```
* 启动


```
mkdir /root/spiderkeeper/
nohup spiderkeeper --server=http://168.*.*.118:6800 --username=admin --password=admin --database-url=sqlite:////root/spiderkeeper/SpiderKeeper.db >> /root/scrapy-cluster/spiderkeeper.log 2>&1 &
```

* 浏览器访问http://168.*.*.118:5000


## 使用Spiderkeeper 管理爬虫
### 使用scrapyd-deploy部署爬虫项目
* 修改scrapy.cfg配置

```
vim /root/scrapy-cluster/crawler/scrapy.cfg
```

```
[settings]
default = crawling.settings

[deploy]
url = http://168.*.*.118:6800/
project = crawling
```

* 添加新的spider


```
cd /root/scrapy-cluster/crawler/crawling/spider
```

* 使用scrapyd-deploy部署项目


```
# cd /root/scrapy-cluster/crawler
# scrapyd-deploy 
Packing version 1536225989
Deploying to project "crawling" in http://168.*.*.118:6800/addversion.json
Server response (200):
{"status": "ok", "project": "crawling", "version": "1536225989", "spiders": 3, "node_name": "ambari"}
```
### spiderkeeper 配置爬虫项目
* 登录Spiderkeeper创建项目

使用scrapy.cfg中配置的项目名
![](media/15362341815397.jpg)
创建后再Spiders->Dashboard中看到所有spider
![](media/15362342524881.jpg)

## Scrapy-cluster 分布式爬虫

Scrapy Cluster需要在不同的爬虫服务器之间进行协调，以确保最大的内容吞吐量，同时控制集群服务器爬取网站的速度。

Scrapy Cluster提供了两种主要策略来控制爬虫对不同域名的攻击速度。这由爬虫的类型与IP地址确定，但他们都作用于不同的域名队列。

Scrapy-cluster分布式爬虫，分发网址是基于IP地址。在不同的机器上启动集群，不同服务器上的每个爬虫去除队列中的所有链接。

### 部署集群中第二个scrapy-cluster
配置一台新的服务器参照[scrapy-cluster 单机配置](scrapy-cluster 单机配置),同时使用第一台服务器配置`kafka-monitor/settings.py` `redis-monitor/settings.py` `crawling/settings.py`

### Current public ip 问题
由于两台服务器同时部署在相同内网，spider运行后即获取相同`Current public ip`，导致scrapy-cluster调度器无法根据IP分发链接

```
2018-09-07 16:08:29,684 [sc-crawler] DEBUG: Current public ip: b'110.90.122.1'
```
参考代码`/root/scrapy-cluster/crawler/crawling/distributed_scheduler.py`第282行：

```python
try:
    obj = urllib.request.urlopen(settings.get('PUBLIC_IP_URL',
                                  'http://ip.42.pl/raw'))
    results = self.ip_regex.findall(obj.read())
    if len(results) > 0:
        # results[0] 获取IP地址即为110.90.122.1
        self.my_ip = results[0]
    else:
        raise IOError("Could not get valid IP Address")
    obj.close()
    self.logger.debug("Current public ip: {ip}".format(ip=self.my_ip))
except IOError:
    self.logger.error("Could not reach out to get public ip")
    pass
```
建议修改代码，获取本机IP

```python
self.my_ip = [(s.connect(('8.8.8.8', 53)), s.getsockname()[0], s.close()) 
                for s in [socket.socket(socket.AF_INET, socket.SOCK_DGRAM)]][0][1]
```

### 运行分布式爬虫
在两个scrapy-cluster中运行相同Spider

```python
execute(['scrapy', 'runspider', 'crawling/spiders/link_spider.py'])
```
使用`python kafka_monitor.py feed`投递多个链接，使用DEBUG即可观察到链接分配情况

## 使用SpiderKeeper管理分布式爬虫
### 配置scrapyd管理集群第二个scrapy-cluster
在第二台scrapy-cluster服务器上安装配置scrapyd，参考[scrapyd 爬虫管理工具配置](scrapyd 爬虫管理工具配置)并修改配置

```
[settings]
default = crawling.settings

[deploy]
url = http://168.*.*.119:6800/
project = crawling
```
启动scrapyd后使用scrapyd-deploy工具部署两个scrapy-cluster上的爬虫项目。

### 使用Spiderkeeper连接多个scrapy-cluster

* 重新启动spiderkeeper，对接两个scrapy-cluster的管理工具scrapyd。

```
nohup spiderkeeper --server=http://168.*.*.118:6800 --server=http://168.*.*.119:6800 --username=admin --password=admin --database-url=sqlite:////root/spiderkeeper/SpiderKeeper.db >> /root/scrapy-cluster/spiderkeeper.log 2>&1 &
```

> 注意：要使用spiderkeeper管理同一个集群，爬虫项目名称必须一致，同时集群中scrapy-cluster配置相同spider任务

* 浏览器访问http://168.*.*.118:5000 启动爬虫时即可看见两个scrapy-cluster集群配置，启动同名爬虫开始scrapy-cluster分布式爬虫
![](images/media/15363140725100.jpg)
* 启动分布式爬虫后状态
![](images/media/15363142039648.jpg)
