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
    const parentIds = new Map();
    let nextParentId = 1;

    function getParentId(provinceName, municipality) {
      const key = `${provinceName}|${municipality}`;

      if (!parentIds.has(key)) {
        parentIds.set(key, nextParentId++);
      }

      return parentIds.get(key);
    }

    await createBarangayIndex(barangayCollection);

    const municipalities = await getMunicipalities(province);
    if (!municipalities) {
      console.error("Invalid Province");
    } else {
      const skipped = [];

      let id = 1;

      for (const municipality of municipalities) {
        const barangays = await getBarangays(province, municipality, skipped);
        const parentId = getParentId(province, municipality);

        const docs = barangays.map((barangay) => ({
          id: id++,
          name: barangay,
          parentId,
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
