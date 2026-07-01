const https = require("https");

const province = "Agusan Del Norte";
const municipality = "Jabonga";

const urlBarangay = `https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusterOptions/myruntimeWeb?parentOption=${encodeURIComponent(province)}&childOption=${encodeURIComponent(municipality)}`;

const req = https.get(urlBarangay, (res) => {
  let responseBody = "";

  res.on("data", (incomingData) => {
    responseBody += incomingData;
  });

  res.on("end", () => {
    let parsedData;
    try {
      parsedData = JSON.parse(responseBody);
    } catch (error) {
      console.error(error);
      return;
    }

    if (parsedData.error === "No cluster options found.") {
      console.error("Invalid province");
    } else if (
      parsedData.error === "No sub options found for the specified category."
    ) {
      console.error(
        "No barangay options found for this province/municipality.",
      );
    } else {
      const allBarangays = [];
      const barangays = parsedData.data.map((name, index) => ({
        id: index + 1,
        name: name,
        parentId: municipality,
      }));

      allBarangays.push(...barangays);

      const outputBarangays = [];
      for (const barangay of allBarangays) {
        outputBarangays.push(barangay);
      }

      console.log("Output:", outputBarangays);
    }
  });
});

req.on("error", (error) => {
  console.error("Request failed:", error.message);
});
