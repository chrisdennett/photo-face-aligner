export const fetchJsonData = (url, callback) => {
  var myHeaders = new Headers();
  myHeaders.append("pragma", "no-cache");
  myHeaders.append("cache-control", "no-cache");

  var myInit = {
    method: "GET",
    headers: myHeaders
  };

  var myRequest = new Request(url);

  // FETCH the latest data from the XML file
  fetch(myRequest, myInit)
    .then((response) => response.json())
    .then((jsonData) => {
      callback(jsonData);
    })
    .catch((error) => console.log("error is", error));
};
