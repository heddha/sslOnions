#sslOnion

This is an add-on with which we aim to prove, that it's possible to read out information from the ssl certificate. When a .onion-address is stored in the C/O/S/L fields, this add-on detects it and redirects the user automatically. 

As the web-extension api doesn't contain a possibility to read out certificate information, the only way to prove this concept was to use the deprecated add-on technology. Once the API request in the [bugzilla forum] is implemented, it will be possible to prove the concept as a web-extension as well. 

To try out this add-on, follow the instructions on [this webpage] to install node and jpm. Once done, change to the directory in which the package.json file is, and type "jpm run". Once an instance of firefox is launched, click on the add-on button in the tool bar (a lock in front of onions!). This will start the add-on. You can then surf to a webpage that contains an onion address in the C/O/S/L or CN fields, and the webextension will detect it and automatically redirect you to it.   


[bugzilla forum]: https://bugzilla.mozilla.org/show_bug.cgi?id=1322748
[this webpage]: https://developer.mozilla.org/en-US/docs/Archive/Add-ons/Add-on_SDK/Tools/jpm#Installation
