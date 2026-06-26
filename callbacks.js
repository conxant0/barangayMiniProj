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

    if (parsedData.error === "No cluster options found.") {
      console.error("Invalid province");
    } else if (
      parsedData.error === "No sub options found for the specified category."
    ) {
      console.error("Invalid municipality for this province");
    } else {
      console.log("Output:", parsedData.data);
    }
  });
});
