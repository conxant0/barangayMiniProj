const axios = require("axios");
const { format } = require("@fast-csv/format");
const fs = require("fs");

const province = "Cebu";
const municipality = "Lapu-Lapu";

const urlBarangay = `https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusterOptions/myruntimeWeb?parentOption=${encodeURIComponent(province)}&childOption=${encodeURIComponent(municipality)}`;

const ws = fs.createWriteStream("barangay.csv");
const csvStream = format({ headers: true });
csvStream.pipe(ws);

let completedSuccessfully = false;

ws.on("finish", () => {
  if (completedSuccessfully) {
    console.log("Completed Barangay Crawl!");
  }
});

async function main() {
  try {
    const response = await axios.get(urlBarangay);

    const apiError = response.data.error;

    if (apiError) {
      throw new Error(apiError);
    }

    const allBarangays = [];
    const barangays = response.data.data.map((name, index) => ({
      id: index + 1,
      name,
      parentId: municipality,
    }));

    allBarangays.push(...barangays);

    for (const barangay of allBarangays) {
      csvStream.write(barangay);
    }

    completedSuccessfully = true;
  } catch (error) {
    if (error.message === "No cluster options found.") {
      console.error("Invalid province");
    } else if (
      error.message === "No sub options found for the specified category."
    ) {
      console.error(
        "No barangay options found for this province/municipality.",
      );
    } else if (error.response) {
      console.error("Request failed:", error.response.status);
      console.error(error.response.data);
    } else {
      console.error("Request failed:", error.message);
    }
  } finally {
    csvStream.end();
  }
}

main();
