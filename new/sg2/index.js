const { getProvinces, getMunicipalities, getBarangays } = require("./api");
const {
  connectToDB,
  client,
  createBarangayIndex,
  insertBarangays,
} = require("./db");

async function main() {
  try {
    const db = await connectToDB();
    const barangayCollection = db.collection("barangaySG2");
    const allBarangays = [];
    const parentIds = new Map();
    let nextParentId = 1;

    function getParentId(province, municipality) {
      const key = `${province}|${municipality}`;

      if (!parentIds.has(key)) {
        parentIds.set(key, nextParentId++);
      }

      return parentIds.get(key);
    }

    await createBarangayIndex(barangayCollection);

    const skipped = [];

    let id = 1;

    const provinces = await getProvinces();

    for (const province of provinces) {
      const municipalities = await getMunicipalities(province);
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
    }

    await insertBarangays(barangayCollection, allBarangays);

    console.log("Skipped locations: ", skipped);

    console.log("Completed Barangay Crawl!");
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

main();
