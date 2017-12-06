
var tabs = require("sdk/tabs");
var { ToggleButton } = require('sdk/ui/button/toggle');
var sdkPanels = require("sdk/panel");
var self = require("sdk/self");
const {Cc,Ci} = require("chrome");
var ui = require("sdk/ui");
var state = {};
var clearAddress;


/*Makes the button appear in the extension bar. If the button is clocked, handleChange is called.*/
var button = ToggleButton({
  id: "my-button",
  label: "my button",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: handleChange
});

/*This is the panel that opens itself either when the add-on button is clicked, or when a redirect happened. If not shown, handleHide does all the things this add-on does in the background. */
var myPanel = sdkPanels.Panel({
  contentURL: self.data.url("panel.html"),
  onHide: handleHide
});

/*Shows the panel if button is pressed.*/
function handleChange(state) {
  if (state.checked) {
    myPanel.show({
      position: button
    });
  }
}

/*If button is not clicked, handleHide receives the url of a newly opnened website and passes it on to getCertificate, if it isn't contained in the state dictionary.*/
function handleHide() {
  button.state('window', {checked: false});
  tabs.on('ready', function(tab) {
    clearAddress = tab.url;
    console.log("state=", state);
    console.log('Following URL is loaded', clearAddress);
    if(!Object.keys(state).includes(clearAddress))
    {
      var onionAddress = getCertificate(clearAddress, tab);
      state[clearAddress] = true;
    }
  });
}

/*redirects the currently open tab to the onionAddress given as argument. Before redirection, makeWebrequestPretty is called to make the url a valid one. Both the onion address and its clear address are added to the "state"-array.*/
function redirect(onionAddress, mytab)
{
  console.log("redirect to this onionaddress: ", onionAddress);
  var prettyOnion = makeWebrequestPretty(onionAddress);
  mytab.url = prettyOnion;
  state[clearAddress] = prettyOnion;
  state[prettyOnion] = true;

}

/*make a non-url include http, so that it's a valid URL*/
function makeWebrequestPretty(inputURL)
{
  if(inputURL.includes("http://"))
  {
    return(inputURL);
  }
  var outputURL = "http://"+ inputURL
  return(outputURL);
}

/*Function that dumps cert information. Taken from  https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/How_to_check_the_secruity_state_of_an_XMLHTTPRequest_over_SSL*/
function dumpSecurityInfo(xhr, error, myTab)
{
  let channel = xhr.channel;
  let secInfo = channel.securityInfo;

  if (secInfo instanceof Ci.nsISSLStatusProvider) {
    var cert = secInfo.QueryInterface(Ci.nsISSLStatusProvider)
    .SSLStatus.QueryInterface(Ci.nsISSLStatus).serverCert;
    var result = searchOnion(cert.subjectName, myTab);
    console.log("onion address: ", result);
    return(result);
  }
}

/*Function that receives the whole subject field of a certificate and searches for the value ".onion". If found, it first splits the entry by ",", as this information is usually presented as "state=DE, location=hamburg, organisation=oniononionaaaaaa.onion". The resulting array, it splits again by "=", and if the second entry, for "state=DE" this would be DE, contains "".onion", it will return this address as onionaddress, otherwise false. */
function searchOnion(word, myTab)
{
  var tld = ".onion";
  var onionAddress = false;
  if(word.includes(tld))
  {
    var searchArray = word.split(",");
    var searchArrayLength = searchArray.length;
    for (var i = 0; i < searchArrayLength; i++)
    {
      var tmpArr = searchArray[i];
      var tmpSplit = tmpArr.split("=");
      if(tmpSplit[1].includes(tld))
      {
        onionAddress = tmpSplit[1];
        myPanel.show({ position: button });
        redirect(onionAddress, myTab);
        return(onionAddress);
      }
    }
  }
  return(onionAddress);
}

/*Function that requests certificate information. Taken from  https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/How_to_check_the_secruity_state_of_an_XMLHTTPRequest_over_SSL*/
function getCertificate(url, myTab) {
  var req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
  req.open('GET', url, true);
  req.addEventListener("error",
  function(e) {
    var error = createTCPErrorFromFailedXHR(req);
    dumpSecurityInfo(req, error, myTab);
  },
  false);

  req.onload = function(e) {
    dumpSecurityInfo(req, "",  myTab);
  };

  req.send();
}
