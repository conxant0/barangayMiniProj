const axios = require("axios");
const { connectToDB, client } = require("./db");

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
  try {
    const db = await connectToDB();
    const barangayCollection = db.collection("barangaysSG1");
    const province = "Rizal";

    const municipalities = await getMunicipalities(province);
    if (!municipalities) {
      console.error("Invalid Province");
      return;
    }

    let skipped = [];

    let id = 1;

    for (const municipality of municipalities) {
      const barangays = await getBarangays(province, municipality, skipped);

      const docs = barangays.map((barangay) => ({
        id: id++,
        name: barangay,
        parentId: municipality,
      }));

      if (docs.length > 0) {
        await barangayCollection.insertMany(docs);
      }
    }
    console.log("Skipped locations: ", skipped);

    console.log("Completed Barangay Crawl!");
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

main();
