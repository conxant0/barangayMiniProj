const https = require("https");

const province = "Cebu";
const municipality = "Mandaue";

const urlBarangay = `https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusterOptions/myruntimeWeb?parentOption=${province}&childOption=${municipality}`;

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
