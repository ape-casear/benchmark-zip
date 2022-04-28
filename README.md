## speed benchmark for zip by many way

[zip-addon-zip](https://github.com/ape-casear/zip-node-addon#readme)
[JsZip](https://github.com/Stuk/jszip)
[kuba--/zip](https://github.com/kuba--/zip)

### install and run
```
npm install
node index.js
```

### env
OS: macos 
Node: v12.10.0
CPU: CPU-i5 3 GHz 6 core

### result
**unzip one time**
```
C++插件解压1次  : 98.126ms

JS解压1次       : 217.211ms

js_woker解压1份: 200.17ms

C++插件压缩1次  : 609.897ms

JS压缩1次       : 1.255s
```

**unzip four time**
```
C++插件解压4次  : 123.589ms

JS解压4次       : 647.896ms

js_woker解压4份 : 381.178ms

C++插件压缩4次  : 606.958ms

JS压缩4次       : 4.579s
```

**unzip six time**
```
C++插件解压6次  : 119.716ms

JS解压6次       : 945.282ms

js_woker解压6份: 439.471ms

C++插件压缩6次  : 726.877ms

JS压缩6次       : 7022.351ms
```

> Look, when the concurrency exceeds the number of cpu cores, the c++ plugin starts to slow down

**unzip eight time**
```
C++插件解压8次  : 155.199ms

JS解压8次       : 1.208s

js_woker解压8份: 602.301ms

C++插件压缩8次  : 942.039ms

JS压缩8次       : 9.447s
```