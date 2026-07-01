const { getMunicipalities, getBarangays } = require("./api");
const {
  connectToDB,
  client,
  createBarangayIndex,
  insertBarangays,
} = require("./db");

async function main() {
  try {
    const db = await connectToDB();
    const barangayCollection = db.collection("barangaysSG1");
    const province = "Rizal";
    const allBarangays = [];

    await createBarangayIndex(barangayCollection);

    const municipalities = await getMunicipalities(province);
    if (!municipalities) {
      console.error("Invalid Province");
    } else {
      const skipped = [];

      let id = 1;

      for (const municipality of municipalities) {
        const barangays = await getBarangays(province, municipality, skipped);

        const docs = barangays.map((barangay) => ({
          id: id++,
          name: barangay,
          parentId: municipality,
        }));

        allBarangays.push(...docs);
      }

      await insertBarangays(barangayCollection, allBarangays);
      console.log("Skipped locations: ", skipped);

      console.log("Completed Barangay Crawl!");
    }
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

main();
