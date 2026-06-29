const axios = require("axios");
const { format } = require("@fast-csv/format");
const fs = require("fs");

const urlProvince = `https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusters/myruntimeWeb`;

async function getMunicipalities(province) {
  try {
    const response = await axios.get(urlProvince);
    return response.data.data.childOptions[province];
  } catch (error) {
    console.error(error);
  }
}

async function getBarangays(province, municipality, skipped) {
  const urlBarangay = `https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusterOptions/myruntimeWeb?parentOption=${encodeURIComponent(province)}&childOption=${encodeURIComponent(municipality)}`;

  try {
    const response = await axios.get(urlBarangay);
    return response.data.data;
  } catch (error) {
    skipped.push({
      province,
      municipality,
      reason: error.message,
    });

    return [];
  }
}

async function main() {
  const ws = fs.createWriteStream("barangay.csv");
  const csvStream = format({ headers: true });
  csvStream.pipe(ws);

  const province = "Rizal";

  const municipalities = await getMunicipalities(province);
  if (!municipalities) {
    console.error("Invalid Province");
    csvStream.end();
    return;
  }

  let skipped = [];

  let id = 1;

  for (const municipality of municipalities) {
    const barangays = await getBarangays(province, municipality, skipped);

    barangays.forEach((barangay) => {
      csvStream.write({
        id: id++,
        name: barangay,
        parentId: municipality,
      });
    });
  }
  csvStream.end();
  console.log("Skipped locations: ", skipped);

  console.log("Completed Barangay Crawl!");
}

main();
