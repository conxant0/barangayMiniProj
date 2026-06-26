const axios = require("axios");
const { format } = require("@fast-csv/format");
const fs = require("fs");

const province = "Cebu";
const municipality = "Lapu-Lapu";

const urlBarangay = `https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusterOptions/myruntimeWeb?parentOption=${encodeURIComponent(province)}&childOption=${encodeURIComponent(municipality)}`;

const ws = fs.createWriteStream("barangay.csv");
const csvStream = format({ headers: true });
csvStream.pipe(ws);

async function main() {
  try {
    const response = await axios.get(urlBarangay);

    const apiError = response.data.error;

    if (apiError === "No cluster options found.") {
      console.error("Invalid province");
      csvStream.end();
      return;
    }

    if (apiError === "No sub options found for the specified category.") {
      console.error(
        "No barangay options found for this province/municipality.",
      );
      csvStream.end();
      return;
    }

    const barangays = response.data.data.map((name, index) => ({
      id: index + 1,
      name,
      parentId: municipality,
    }));

    barangays.forEach((barangay) => {
      csvStream.write(barangay);
    });

    csvStream.end();
  } catch (error) {
    if (error.response) {
      console.error("Request failed:", error.response.status);
      console.error(error.response.data);
    } else {
      console.error("Request failed:", error.message);
    }

    csvStream.end();
  }
}

main();
