const https = require("https");

const province = "Rizal";
const municipality = "Tanay";

const urlBarangay =
  "https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusterOptions/myruntimeWeb?parentOption=Rizal&childOption=Tanay";

https.get(urlBarangay, (res) => {
  let responseBody = "";

  res.on("data", (incomingData) => {
    responseBody += incomingData;
  });

  res.on("end", () => {
    const parsedData = JSON.parse(responseBody);
    console.log("Output: ", parsedData.data);
  });
});
