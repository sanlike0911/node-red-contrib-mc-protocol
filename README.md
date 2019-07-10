# node-red-contrib-mc-protocol
node-red-contrib-mc-protocolは、三菱電機（mitsubishielectric）のPLC(MELSEC Qseries)とイーサネットプロトコルを利用して通信を可能にするライブラリです。このソフトウェアは、三菱電機（mitsubishielectric）と一切提携していません。MELSEC Qseriesは三菱の商標です。  
  

## CAUTION
これはベータ版のソフトウェアであり、想定外の値が意図しないアドレスに書き込まれる可能性があります。
本ソフトウェアは@plcpeople様のnode.jsライブラリ(mcprotocol)をNode-Red用にラッパーしています。詳細な仕様についてはnode.jsライブラリ(mcprotocol)を参照してください。
  
## 三菱PLC(MELSEC Qseries)の検証結果
|No|device type|device name|type|dec/hec|device|code|result(read)|result(write)|note|
|:-|:----------|:----------|:---|:------|:-----|---:|:----------:|:----------:|:---|
|1|input|input Relay|bit|hex|X|5820H|〇|〇|device address(hex) non support|
|2|output|output Relay|bit|hex|Y|5920H|〇|-|device address(hex) non support|
|3|relay|Auxiliary/Latch/Step Relay|bit|dec|M/L/S|4D20H|〇|〇|L/S non support|
|4|relay|Link Relay|bit|hex|B|4220H|-|-||
|5|annunciator|annunciator|bit|dec|F|4620H|-|-||
|6|Timer|Timer current value|word|dec|TN|544EH|〇|-||
|7|Timer|Timer contact|bit|dec|TS|5453H|〇|〇||
|8|Counter|Counter current value|word|dec|CN|434EH|〇|-||
|9|Counter|Counter contact|bit|dec|CS|4353H|〇|〇||
|10|register|Data register|word|dec|D|4420H|〇|〇|bit access read only(example:D2000.1)|
|11|register|link register|word|hex|W|5720H|〇|〇|device address(hex) non support|
|12|register|File register|word|dec|Z(R)|5220H|-|-||
  
## install
```
npm install node-red-contrib-mc-protocol
```