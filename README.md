# node-red-contrib-mc-protocol
node-red-contrib-mc-protocolは、三菱電機（mitsubishielectric）のPLC(MELSEC Qseries)とイーサネットプロトコルを利用して通信を可能にするライブラリです。このソフトウェアは、三菱電機（mitsubishielectric）と一切提携していません。MELSEC Qseriesは三菱の商標です。  
  

## CAUTION
これはベータ版のソフトウェアであり、想定外の値が意図しないアドレスに書き込まれる可能性があります。
本ソフトウェアは@plcpeople様のnode.jsライブラリ(mcprotocol)をNode-Red用にラッパーしています。詳細な仕様についてはnode.jsライブラリ(mcprotocol)を参照してください。
  
## 三菱PLC(MELSEC Qseries)の検証結果
|No|device type|device name|address|result|
|:-|:----------|:----------|:------|:----:|
|1|bit device|入力リレー|X|-|
|2|bit device|出力リレー|Y|-|
|3|bit device|内部補助リレー|M|〇|
|4|bit device|リンクリレー|B|-|
|5|bit device|ラッチリレー|L|-|
|6|bit device|特殊リレー|SM|-|
|7|bit device|タイマ接点|T|-|
|8|bit device|カウンタ接点|C|-|
|9|word device|データレジスタ|D|〇|
|10|word device|リンクレジスタ|W|-|
|11|word device|ファイルレジスタ|Z(R)|-|
|12|word device|特殊レジスタ|SD|-|
  
## install
```
npm install node-red-contrib-mc-protocol
```