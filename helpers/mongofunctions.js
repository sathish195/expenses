// const { ADMIN_CONTROL } = require("../models/admin/admincontrols");
// const { ADMIN } = require("../models/admin/admin");
// const { CONTRACT } = require("../models/user/contract");
// const { HISTORY } = require("../models/user/history");
// const { ARCHIVE_HISTORY } = require("../models/user/archive_history");
// const { REFERRAL } = require("../models/user/referral");
// const { STATS } = require("../models/admin/stats");
// const { OVERALL_STATS } = require("../models/admin/overall_stats");
// const { TICKET } = require("../models/admin/ticket");
// const { USER } = require("../models/user/user");
// const { CRYPTO_DEPOSIT } = require("../models/user/crypto_deposit");
// const { OTC } = require("../models/user/otc");
// const { CODE } = require("../models/admin/codes");

const { USER } = require("../models/USERS");
const { GROUP } = require("../models/GROUPS");
const { CATEGORY } = require("../models/category");
const { Expenses } = require("../models/EXPENSES");
const { ExpenseCategory } = require("../models/STATS.JS");
const { Common } = require("../models/COMMON");

const { Income } = require("../models/INCOM.JS");
const { Biller } = require("../models/billers");
const { GroupExpense } = require("../models/STATS.JS");
const { Transaction } = require("../models/transactions");
const { Payment } = require("../models/PERSONALGROUPTRANSACTIONS.JS");



const mongoose = require("mongoose");

module.exports = {
  create_new_record: async (collection, data) => {
    console.log(data,"data---->");
    
    try {
      var col = eval(collection);
      console.log("my col -->",col, collection)
      // return "done"
      var new_record = new col(data);
      return await new_record.save();
    } catch (error) {
      throw new Error(
        `❌❌❌❌ err in create new record mongo query \n ${error} \n ❌❌❌❌`
      );
    }
  },

  // Function to save multiple records in the collection
// insert_many: async (collectionName, saveDataArray) => {
//   try {
//     // const collection = mongoose.connection("Billers");
//     //   // Use insertMany to insert an array of documents
//     //   const documents = await collection.insertMany(saveDataArray);
//     //   console.log(documents);
//       console.log(collectionName);
//     const collection = mongoose.connection("Biller");
//     console.log(collection,"collection");
    
//     return await collection.insertMany(saveDataArray);
      
//   } catch (error) {
//       console.error('Error inserting documents:', error);
//       throw error; // Rethrow the error to handle it in the calling context
//   }
// },




 insert_many : async (collectionName, saveDataArray) => {
  try {
    // Get the collection from the connection using the collection name
    const collection = mongoose.connection.collection(collectionName);

    // Use insertMany to insert an array of documents
    const documents = await collection.insertMany(saveDataArray);
    console.log(documents,"poiiiiii"); // Log the inserted documents

    return documents; // Return the inserted documents
  } catch (error) {
    console.error('Error inserting documents:', error);
    throw error; // Rethrow the error to handle it in the calling context
  }
},




 findD : async (collectionName, condition = {}, sort = {}, select = {}, limit = 0) => {
  const collection = mongoose.connection.collection(collectionName);

  try {
    const results = await collection.find(condition)
      .sort(sort)
      .project(select)
      .limit(limit)
      .toArray(); 

    return results;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; 
  }
},


    // Function to Save data in the collection
    // create_new_record: async (collectionName, savedata) => {
    //   let document =await eval(collectionName).create(savedata);
    //   return document;
    // },

  
  find_with_projection: async (
    collection,
    condition,
    projection,
    sort,
    select,
    limit,
    skip
  ) => {
    return await eval(collection)
      .find(condition, projection)
      .select(select)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();
  },
  // find: async (collection, condition, sort, select,skip,limit) => {
  //   return await eval(collection)
  //     .find(condition)
  //     // .select(select)
  //     .sort(sort)
  //     .limit(limit)
  //     .skip(skip)
  //     .lean();
  // },




      // Function to find All document in a collection
      find: async (collection, condition, sort, skip, limit, select) => {
        return await eval(collection)
          .find(condition)
          .sort(sort)
          .skip(skip)
           .limit(limit)
          .select(select)
          // .lean()
        
      },
  find_one: async (collection, condition, select, sort) => {
    return await eval(collection)
      .findOne(condition)
      .select(select)
      .sort(sort)
      .lean();
  },
  find_one_and_update: async (collection, condition, update, options) => {
    if (!options) {
      options = { new: true };
    }
    return await eval(collection)
      .findOneAndUpdate(condition, update, options)
      .lean();
  },
  find_one_and_delete: async (collection, condition, options) => {
    return await eval(collection).findOneAndDelete(condition, options);
  },
  find_one_and_remove: async (collection, condition, options) => {
    return await eval(collection).findOneAndRemove(condition, options);
  },
  find_one_and_replace: async (collection, condition, update, options) => {
    return await eval(collection).findOneAndReplace(condition, update, options);
  },
  update_many: async (collection, condition, update, options) => {
    return await eval(collection).updateMany(condition, update, options);
  },
  delete_many: async (collection, condition) => {
    return await eval(collection).deleteMany(condition);
  },
  // delete_one: async (collection, condition) => {
  //   return await eval(collection).deleteOne(condition);
  // },


  // delete one query
  delete_one: async (collectionName, condition) => {
    let data = eval(collectionName).deleteOne(condition);
    return data;
  },



  replace_one: async (collection, condition, update) => {
    return await eval(collection).replaceOne(condition, update);
  },

  update_one: async (collection, condition, update, options = {}) => {
    return await eval(collection).updateOne(condition, update, options);
  },
  lazy_loading: async (collection, condition, select, sort, limit, skip) => {
    return await eval(collection)
      .find(condition)
      .select(select)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();
  },
  aggregate: async (collection, pipeline) => {
    return await eval(collection).aggregate(pipeline);
  },
};
