const axios = require("axios");

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

module.exports = { getProvinces, getMunicipalities, getBarangays };
