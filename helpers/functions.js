const axios = require("axios");
const crypto = require("crypto");
const mongofunctions = require("./mongofunctions");
const rediscon = require("./redisFunctions");

module.exports = {
  get_random_string: (str, length) => {
    //this function will take two parameters as input str and length if you
    //pass str was something string and length is a number of characters you
    // want then a random string will be generated having that length and
    //that str is appened at front, else str is 0 then only random string
    // will be generated
    if (str === "0")
      return crypto
        .randomBytes(Number(length / 2))
        .toString("hex")
        .toUpperCase();
    return (
      str +
      crypto
        .randomBytes(Number(length / 2))
        .toString("hex")
        .toUpperCase()
    );
  },
  getExactLength: (value, length) => {
    //this function takes value and a length to provide number of values after decimal point
    if (isNaN(value)) return 0;
    let zeros = String(0).padStart(length, "0");
    var divider = 1 + zeros;
    return (Math.floor(divider * value) / divider).toFixed(length);
  },
  hasDuplicates: (array) => {
    //check that array has any duplicates are not
    return new Set(array).size !== array.length;
  },

  updateGroupExpenseStatistics: async (groupName, amount, category) => {
    console.log(groupName, "sathish");
    console.log(amount, "sathish");
    console.log(category, "sathish");
  
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // Current month (1-12)
    const year = currentDate.getFullYear();    // Current year
  
    // Find the group expense entry
    const groupExpense = await mongofunctions.find_one("GroupExpense", {
      groupName: groupName.toLowerCase(),
    });
    console.log(groupExpense, "groupExpense------groupExpense");
  
    // Initialize the new expense record if it doesn't exist
    if (!groupExpense) {
      const newGroupExpense = {
        groupName: groupName.toLowerCase(),
        overallTotal: amount,
        yearlyData: [{
          year: year,
          yearAmount: amount,
          monthlyData: [{
            month,
            totalAmount: amount,
            categoryData: [{ category, totalAmount: Number(amount) }],
          }],
        }],
      };
      const stats = await mongofunctions.create_new_record("GroupExpense", newGroupExpense);
      console.log(stats.yearlyData);
      return stats;
    }
  
    // Update existing group expense data
    groupExpense.overallTotal += Number(amount);
    const yearlyData = groupExpense.yearlyData.find(y => y.year === year);
  
    if (yearlyData) {
      yearlyData.yearAmount += Number(amount);
      const monthlyData = yearlyData.monthlyData.find(m => m.month === month);
  
      if (monthlyData) {
        const categoryEntry = monthlyData.categoryData.find(c => c.category === category);
        if (categoryEntry) {
          categoryEntry.totalAmount += Number(amount);
        } else {
          monthlyData.categoryData.push({ category, totalAmount: Number(amount) });
        }
        monthlyData.totalAmount += Number(amount);
      } else {
        yearlyData.monthlyData.push({
          month,
          totalAmount: Number(amount),
          categoryData: [{ category, totalAmount: Number(amount) }],
        });
      }
    } else {
      groupExpense.yearlyData.push({
        year,
        yearAmount: Number(amount),
        monthlyData: [{
          month,
          totalAmount: Number(amount),
          categoryData: [{ category, totalAmount: Number(amount) }],
        }],
      });
    }
  
    console.log(groupExpense, "groupExpensesss-------->");
  
    // Save the updated group expense document
    await mongofunctions.find_one_and_update("GroupExpense", groupExpense._id, groupExpense);
  }
  
  
  
};
