# node-red-contrib-mc-protocol
node-red-contrib-mc-protocolは、三菱電機（mitsubishielectric）のPLC(MELSEC Qseries)とイーサネットプロトコルを利用して通信を可能にするライブラリです。このソフトウェアは、三菱電機（mitsubishielectric）と一切提携していません。MELSEC Qseriesは三菱の商標です。  
  

## CAUTION
これはベータ版のソフトウェアであり、想定外の値が意図しないアドレスに書き込まれる可能性があります。
「A互換1Eフレーム」のみサポートしています。
  
## 三菱PLC(MELSEC Q4A)の検証結果
|No|device type|device name|type|dec/hec|device|range|code|rest(read)|res(write)|res(range)|note|
|:-|:----------|:----------|:---|:------|:-----|----:|---:|:--------:|:--------:|:--------:|:---|
|1|input|input Relay|bit|hex|X|0-7FF|5820H|△|△||device address(hex) non support|
|2|output|output Relay|bit|hex|Y|0-7FF|5920H|△|-||device address(hex) non support|
|3|relay|Auxiliary/Latch/Step Relay|bit|0-8191,9000-9255(SM1000-SM1255)|dec|M/L/SM|4D20H|△|△||non support L/S|
|4|relay|Link Relay|bit|hex|B|0-FFF|4220H|-|-|||
|5|annunciator|annunciator|bit|dec|F|0-2047|4620H|-|-|||
|6|Timer|Timer current value|word|dec|TN|0-2047|544EH|〇|〇|〇||
|7|Timer|Timer contact|bit|dec|TS|0-2047|5453H|×|×|×||
|8|Counter|Counter current value|word|dec|CN|0-1023|434EH|〇|〇|△|CN1023 NG|
|9|Counter|Counter contact|bit|dec|CS|0-1023|4353H|×|×|×||
|10|register|Data register|word|dec|D|0-6143|4420H|〇|△|〇|non support bit write|
|11|register|link register|word|hex|W|0-FFF|5720H|〇|△|〇|non support bit write|
|12|register|File register|word|dec|Z(R)|0-8191|5220H|-|-||QnACPU:Not access|

## install
```
npm install node-red-contrib-mc-protocol
```