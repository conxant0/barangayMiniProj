const axios = require("axios");
const { format } = require("@fast-csv/format");
const fs = require("fs");

const province = "Rizal";
const municipality = "Cebu";

const urlBarangay = `https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusterOptions/myruntimeWeb?parentOption=${province}&childOption=${municipality}`;

const ws = fs.createWriteStream("barangay.csv");
const csvStream = format({ headers: true });
csvStream.pipe(ws);

axios
  .get(urlBarangay)
  .then((response) => {
    const barangays = response.data.data.map((name, index) => ({
      id: index + 1,
      name: name,
      parentId: municipality,
    }));

    barangays.forEach(({ id, name, parentId }) => {
      csvStream.write({
        id,
        name,
        parentId,
      });
    });
    csvStream.end();
  })
  .catch((error) => {
    console.error(error.message);
  });
