const { connectToDB, client } = require("../db/db");

async function createBarangayIndex(barangayCollection) {
  await barangayCollection.createIndex(
    {
      parentId: 1,
      barangay: 1,
    },
    {
      unique: true,
    },
  );
}

async function insertBarangays(barangayCollection, allBarangays) {
  let currentParentId = null;
  let currentBatch = [];

  for (const barangay of allBarangays) {
    if (currentParentId === null) {
      currentParentId = barangay.parentId;
    }

    if (barangay.parentId !== currentParentId) {
      try {
        await barangayCollection.insertMany(currentBatch, {
          ordered: false,
        });
      } catch (error) {
        if (error.code === 11000) {
          console.log(`Duplicates found in parentId ${currentParentId}.`);
        } else {
          throw error;
        }
      }

      currentBatch = [];
      currentParentId = barangay.parentId;
    }

    currentBatch.push(barangay);
  }

  if (currentBatch.length) {
    try {
      await barangayCollection.insertMany(currentBatch, {
        ordered: false,
      });
    } catch (error) {
      if (error.code === 11000) {
        console.log(`Duplicates found in parentId ${currentParentId}.`);
      } else {
        throw error;
      }
    }
  }
}

module.exports = {
  connectToDB,
  client,
  createBarangayIndex,
  insertBarangays,
};
