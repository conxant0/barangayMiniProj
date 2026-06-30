const axios = require("axios");
const { connectToDB, client } = require("./db.js");

const urlProvince = `https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusters/myruntimeWeb`;

async function getProvinces() {
  try {
    const response = await axios.get(urlProvince);
    return response.data.data.parentOptions;
  } catch (error) {
    console.error(error);
  }
}

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
    const barangayCollection = db.collection("barangaySG2");

    await barangayCollection.createIndex(
      {
        parentId: 1,
        name: 1,
      },
      {
        unique: true,
      },
    );

    let skipped = [];

    let id = 1;

    const provinces = await getProvinces();

    for (const province of provinces) {
      const municipalities = await getMunicipalities(province);
      for (const municipality of municipalities) {
        const barangays = await getBarangays(province, municipality, skipped);

        const docs = barangays.map((barangay) => ({
          id: id++,
          name: barangay,
          parentId: `${province}/${municipality}`,
        }));

        try {
          if (docs.length > 0) {
            await barangayCollection.insertMany(docs, {
              ordered: false,
            });
          }
        } catch (error) {
          if (error.code === 11000) {
            console.log(`Duplicates found in ${municipality}.`);
          } else {
            throw error;
          }
        }
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
