const axios = require("axios");
const { format } = require("@fast-csv/format");
const fs = require("fs");

const province = "Cebu";

const urlProvince = `https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusters/myruntimeWeb`;

const ws = fs.createWriteStream("barangay.csv");
const csvStream = format({ headers: true });
csvStream.pipe(ws);

async function getMunicipalities(province) {
  try {
    const response = await axios.get(urlProvince);
    return response.data.data.childOptions[province];
  } catch (error) {
    console.log(error);
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
  const municipalities = await getMunicipalities(province);
  let skipped = [];

  for (const municipality of municipalities) {
    const barangays = await getBarangays(province, municipality, skipped);

    console.log(municipality, barangays);
  }
  console.log("Skipped municipalities: ", skipped);
}

main();
