const { default: axios } = require("axios");
const express = require("express");
const redisFunctions = require("../../helpers/redisFunctions");
const mongofunctions = require("../../helpers/mongofunctions");
const { verify } = require("jsonwebtoken");

const router = express();
router.post("/generate_token", async (req, res) => {
  const payload = {
    grant_type: "client_credentials",
    tpa_id: "E0GG",
    scope: "mecom-auth/all",
  };
  console.log(payload, "payload");

  const username = "36ddltnlmkmqkmbu3a81tp6pkm";
  const password = "6l9nefmg8j2cprdf37au5agu3sidaa6lp6tfk0n7qicgs8v7stq";

  const authHeader =
    "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
  // return res.send(authHeader)
  var data = payload;

  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://stg.bc-api.bayad.com/v3/oauth2/token",
    headers: {
      Authorization: authHeader,
    },
    data: data,
  };

  try {
    const generateToken = await axios(config);
    console.log(generateToken, "IUIUIUUIIU");
    return res.status(200).send(generateToken.data);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }

  // axios(config)
  // .then(function (response) {
  //   console.log(JSON.stringify(response.data));
  // })
  // .catch(function (error) {
  //   console.log(error);
  // });
});

const token_details = {
  "access_token": "eyJraWQiOiJraWoydFFERTZiSWxnOFE3enZMSmFZaE5jNXdlWHRzaVM0OW1vYVR4YWs0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzNmRkbHRubG1rbXFrbWJ1M2E4MXRwNnBrbSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoibWVjb20tYXV0aFwvYWxsIiwiYXV0aF90aW1lIjoxNzM1ODE2NTUyLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTFfWmZCalVlU3kzIiwiZXhwIjoxNzM1ODIwMTUyLCJpYXQiOjE3MzU4MTY1NTIsInZlcnNpb24iOjIsImp0aSI6IjVhZmQ4NWE5LTM5MmItNDUxMi04N2M1LTFhY2U4MzAyZWE4MSIsImNsaWVudF9pZCI6IjM2ZGRsdG5sbWttcWttYnUzYTgxdHA2cGttIn0.T-vqLTwqx99alaWizretu1yK244ZO8PTxvdsiR6nfEV72TUmEH0NmEfp4x_cVVJ5PWXO5ElYqFoFWO1WmcLlJa4w5KflNrNigreh8RxgwnNyUjX1GtYdnK3cMG6XJMzFXkcmnkZ98C2jocLxpXZDhHKzy6B3RQL2OP0NpYYBJ-ftEMcpo4qVqWs9iqFClHlHBP2gi1KEwgwvP6quBy6CeX-v_DBCrcfi8cm1ph28kzSXyvyjLIR-S1lZaRxvmx-ejKWluBYPZNjJMZNpAylJIgLyIZSwYKnigCvJDaDP-qxn-HXcH65PkM-LPxJBM5CXuLzdyg8otf5ZYwHCdOLIjg",
  "expires_in": 3600,
  "token_type": "Bearer"
}
// router.post("/biller_list", async (req, res) => {  
//   var config = {
//     method: "get",
//     maxBodyLength: Infinity,
//     url: "https://stg.bc-api.bayad.com/v3/billers",
//     headers: {
//       Authorization: token_details.access_token,
//     },
//   };

//   const bellerArray = [];
//   try {
//     const billetsList = await axios(config);
//     console.log(billetsList.data.data.length);

//     for (let i = 0; i < billetsList.data.data.length; i++) {
//       const data = billetsList.data.data[i];
//       // Store Redis data
//       await redisFunctions.redisInsert("Billers_list", data.code, data, true);

//       var code = data.code;

//       // Create request configurations
//       var config = {
//         method: "get",
//         maxBodyLength: Infinity,
//         url: `https://stg.bc-api.bayad.com/v3/billers/${code}`,
//         headers: {
//           Authorization: token_details.access_token,
//         },
//       };
//       var chargesconfig = {
//         method: "get",
//         maxBodyLength: Infinity,
//         url: `https://stg.bc-api.bayad.com/v3/billers/${code}/fees`,
//         headers: {
//           Authorization: token_details.access_token,
//         },
//       };

//       try {
//         // Fetch biller details
//         const billetsDetails = await axios(config);
//         const otherCharges = await axios(chargesconfig);

//         const mergeData = {
//           code: billetsDetails.data.data.code,
//           otherCharges: otherCharges.data.data.otherCharges,
//           verify: billetsDetails.data.data.parameters.verify,
//         };
//         console.log(mergeData,"mergedata--------->");

//         bellerArray.push(mergeData);

//       } catch (error) {
//         console.log("Error fetching biller details:", error.response?.data || error.message);
//         return res.status(400).send(error);
//       }
//     }

//     const insert_many = await mongofunctions.insert_many("Biller", bellerArray);
//     return res.status(200).send(insert_many);
//   } catch (error) {
//     console.log("Error fetching billers list:", error.response?.data || error.message);
//     return res.status(400).send(error);
//   }
// });

// get biller information
router.post("/biller_info", async (req, res) => {
  const biller_code = "PHA01"
  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://stg.bc-api.bayad.com/v3/billers/${biller_code}`,
    headers: {
      Authorization: token_details.access_token,
    },
  };

  try {
    const billetsList = await axios(config);
    console.log(billetsList.data,"biller info");
    return res.status(200).send(billetsList.data);
  } catch (error) {
    console.log(error);

    return res.status(400).send(error);
  }
});

// verify biller acount
router.post("/verify_accounts", async (req, res) => {
  console.log(req.body, "refrence------>");
  const data = {
    paymentMethod: "CASH",
    amount: req.body.amount,
    otherCharges: req.body.otherCharges,
    otherInfo: req.body.otherInfo,
  };
  console.log(data, "data----data");
  if(data.otherCharges === "null"){

    const billers_fees_options = {
      method: "GET",
      url: `https://stg.bc-api.bayad.com/v3/billers/${req.body.code}/fees?amount=${data.amount}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: bayad_token,
      },
    }


  try {
    const billers_fees = await axios(billers_fees_options);
    console.log(AccountVerify.data);
    data.otherCharges = billers_fees.data.data?.otherCharges
    return data.otherCharges
  } catch (error) {
    console.log(error.response, "response");

    console.log(
      error.response.data.message,
      "data-------------->data------------------>"
    );

    // console.log(error.response.data.details.message);

    return res
      .status(400)
      .send(error.response.data.details.message || error.response.data.message);
  }


  }

  // const findBilersInfo = await mongofunctions.findD("Biller",{code:req.body.code})
  // console.log(findBilersInfo[0].payload.referenceNumber,"dat--------a");

  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `https://stg.bc-api.bayad.com/v3/billers/${req.body.code}/accounts/${req.body.referenceNumber}`,
    headers: {
      Authorization: token_details.access_token,
    },
    data: data,
  };

  try {
    const AccountVerify = await axios(config);
    console.log(AccountVerify.data);
    return res.status(200).send(AccountVerify.data);
  } catch (error) {
    console.log(error.response, "response");

    console.log(
      error.response.data.message,
      "data-------------->data------------------>"
    );

    // console.log(error.response.data.details.message);

    return res
      .status(400)
      .send(error.response.data.details.message || error.response.data.message);
  }
});

// Create Payment Route
// router.post("/create_payment", async (req, res) => {
//   console.log("hit");

//   function getCurrentDayOfYear() {
//     const start = new Date(new Date().getFullYear(), 0, 0);
//     const diff = new Date() - start;
//     const oneDay = 1000 * 60 * 60 * 24;
//     return Math.floor(diff / oneDay);
//   }
//   // Initialize sequence number
//   // let sequenceNumber = 0;
//   // Replace with your actual TPA ID
//   // const TPA_ID = "1234";

//  // Initialize sequence number
// let sequenceNumber = 5;
// // Store the current day of the year to detect changes
// let currentDayOfYear = getCurrentDayOfYear();
// // Replace with your actual TPA ID
// const TPA_ID = "1234";

// function getCurrentDayOfYear() {
//   const start = new Date(new Date().getFullYear(), 0, 0);
//   const diff = new Date() - start;
//   const oneDay = 1000 * 60 * 60 * 24;
//   return Math.floor(diff / oneDay);
// }

// function generateClientReference() {
//   const year = new Date().getFullYear().toString().slice(-2);
//   const dayOfYear = getCurrentDayOfYear().toString().padStart(3, "1");

//   // Check if the day has changed
//   if (dayOfYear !== currentDayOfYear.toString().padStart(3, "0")) {
//     // Reset the sequence number for the new day
//     sequenceNumber = 0;
//     currentDayOfYear = parseInt(dayOfYear);
//   }

//   const seqNum = (sequenceNumber++).toString().padStart(7, "176543");

//   // Construct the client reference
//   const clientReference = `${TPA_ID}${year}${dayOfYear}${seqNum}`;

//   return clientReference;
// }

// // Example usage
// console.log(generateClientReference());

//   // Example usage:
//   const clientReference = generateClientReference();

//   console.log(clientReference, "clientReference-numner");
//   validationNumber = req.body.validationNumber;
//   const data = {
//     clientReference: clientReference,
//     validationNumber,
//   };
//   console.log(data, "data");

//   //   return res.status(200).send(data)

//   // const ph  = "0136173373"
//   var config = {
//     method: "post",
//     maxBodyLength: Infinity,
//     url: "https://stg.bc-api.bayad.com/v3/billers/MECOR/payments",
//     headers: {
//       Authorization: token_details.access_token,
//     },
//     data: data,
//   };

//   try {
//     const createPayamount = await axios(config);
//     console.log(createPayamount.data);
//     return res.status(200).send(createPayamount.data);
//   } catch (error) {
//     // console.log(error.response.data,"response");

//     console.log(error.response.data.errors);

//     return res.status(400).send(error.response.data.details.message);
//   }
// });

router.post("/create_payment", async (req, res) => {
  console.log("hit");

  // Function to get the current day of the year
  function getCurrentDayOfYear() {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = new Date() - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) + 1; // Ensure the range is 1-366
  }

  const TPA_ID = "1234"; // Replace with your actual TPA ID
  let sequenceNumber = 0;
  let currentDayOfYear = getCurrentDayOfYear();

  // Function to generate the client reference in a new way
  function generateClientReference() {
    const year = new Date().getFullYear().toString().slice(-2);
    const dayOfYear = getCurrentDayOfYear().toString().padStart(3, "0");

    // Reset the sequence number if the day has changed
    const newDayOfYear = getCurrentDayOfYear();
    if (newDayOfYear !== currentDayOfYear) {
      sequenceNumber = 0; // Reset sequence number for new day
      currentDayOfYear = newDayOfYear;
    }

    const seqNum = (sequenceNumber++).toString().padStart(7, "0"); // Zero-pad to 7 digits

    // Construct the client reference
    const clientReference = `${TPA_ID}${year}${dayOfYear}${seqNum}`;

    return clientReference;
  }

  // Generate the client reference
  // const clientReference = generateClientReference();
  // console.log(clientReference, "clientReference-number");

  // Extract validation number from request body
  // const validationNumber = req.body.validationNumber;
// const  validationNumber = "d529a73d-0c96-4a86-865f-d133daaba732"

//   {
    let clientReference= "AAAA231230000001"
    let validationNumber = "d529a73d-0c96-4a86-865f-d133daaba732"
// }

  // Check if validationNumber is provided
  if (!validationNumber) {
    return res.status(400).send("Validation number is required.");
  }

  // Prepare data for API call
  const data = {
    clientReference,
    validationNumber,
  };
  console.log(data, "data");

  // API configuration
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://stg.bc-api.bayad.com/v3/billers/MECOR/payments",
    headers: {
      Authorization: token_details.access_token, // Ensure token_details is defined in your context
    },
    data,
  };

  try {
    // Make the API call
    const createPayamount = await axios(config);
    console.log(createPayamount.data);
    return res.status(200).send(createPayamount.data);
  } catch (error) {
    // Handle error response
    console.error(error.response.data);
    console.error(error.response.data.errors);

    return res
      .status(400)
      .send(
        error.response ? error.response.data.details.message : "Error occurred"
      );
  }
});

// get Inquire Payment
router.post("/inquire_payment", async (req, res) => {
  console.log("hit");

  // return res.status(200).send(clientReference)

  //   const acc = clientReference;
  const acc = req.body.id;
  // const acc = "0136173373"

  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://stg.bc-api.bayad.com/v3/billers/MECOR/payments/${acc}`,
    headers: {
      Authorization: token_details.access_token,
    },
  };

  try {
    const inquirePayment = await axios(config);
    console.log(inquirePayment.data);
    return res.status(200).send(inquirePayment.data);
  } catch (error) {
    console.log(error.response.data.message);

    return res.status(400).send(error);
  }
});

// Get other charges
router.post("/get_other_charges", async (req, res) => {
  console.log("hit");

  const acc = "AAAA231230000001";
  // const acc = "BC24274E0GG20000001"
  // const acc = "0136173373"
  var amount = 1000000;

  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://stg.bc-api.bayad.com/v3/billers/UBXPC/fees`,
    headers: {
      Authorization: token_details.access_token,
    },
  };

  try {
    var payload = {
      code: "!@#$",
      otherCharges: "amount requred",
    };
    const otherCharges = await axios(config);
    console.log(otherCharges.data, "dssdsdasda");

    return res.status(200).send(otherCharges.data);
  } catch (error) {
    console.log(error.response.data.details.message);
    console.log(payload);

    return res.status(400).send(error);
  }
});

// Get other charges
router.post("/categoris", async (req, res) => {
  console.log("hit");
  var config = {
    method: "get",
    maxBodyLength: Infinity,
    //   url: "https://stg.bc-api.bayad.com/v3/billers/ETRIP/fees",
    url: "https://stg.bc-api.bayad.com/v3/billers?categoriesOnly=true",
    headers: {
      Authorization: token_details.access_token,
    },
  };

  try {
    const otherCharges = await axios(config);
    const categoryWiseFilter = [];
    const findFilter = otherCharges.data;
    for (i = 0, findFilter.length < i; i++; ) {
      const category = findFilter[i];

      var config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://stg.bc-api.bayad.com/v3/billers?category=${category}`,
        headers: {
          Authorization: token_details.access_token,
        },
      };

      try {
        const otherCharges = await axios(config);
        console.log(otherCharges.data);
        return res.status(200).send(otherCharges.data);
      } catch (error) {
        console.log(error);

        return res.status(400).send(error);
      }
    }
    console.log(otherCharges.data);
    return res.status(200).send(otherCharges.data);
  } catch (error) {
    console.log(error);

    return res.status(400).send(error);
  }
});

//   filter categoriwise billers

// Get other charges
router.post("/category-wise-biller", async (req, res) => {
  console.log("hit");
  const category = "Electricity";

  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://stg.bc-api.bayad.com/v3/billers?category=${category}`,
    headers: {
      Authorization: token_details.access_token,
    },
  };

  try {
    const otherCharges = await axios(config);
    console.log(otherCharges.data);
    return res.status(200).send(otherCharges.data);
  } catch (error) {
    console.log(error);

    return res.status(400).send(error);
  }
});

router.post("/store-category", async (req, res) => {
  console.log("Request received");

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://stg.bc-api.bayad.com/v3/billers?categoriesOnly=true",
    headers: {
      Authorization: token_details.access_token,
    },
  };

  try {
    const response = await axios(config);
    const categories = response.data.data;
    console.log(categories, "data");

    const categoryWiseData = [];

    // Loop through categories to fetch data for each category
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];

      const categoryConfig = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://stg.bc-api.bayad.com/v3/billers?category=${category}`,
        headers: {
          Authorization: token_details.access_token,
        },
      };

      try {
        const categoryResponse = await axios(categoryConfig);
        x = await redisFunctions.redisInsert(
          "categorysData",
          category,
          categoryResponse.data,
          true
        );
        console.log(x, "data");
      } catch (error) {
        console.error(`Error fetching data for category ${category}:`, error);
        return res.status(400).send(error);
      }
    }

    return res.status(200).send(categoryWiseData);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(400).send(error);
  }
});

router.post("/billers-category", async (req, res) => {
  const data = req.body.category;
  console.log("<-----------sathish----data---->");
  const response = await redisFunctions.redisGet("categorysData", data, true);
  console.log(response, "data");

  if (!response) return res.status(200).send("Data Not Found....!");
  return res.status(200).send(response);
});

// get categorys
router.post("/get-category", async (req, res) => {
  const data = req.body.category;
  console.log("<-----------sathish----data---->");
  const response = await redisFunctions.redisGetSingle("categorys", true);
  console.log(response, "data");

  if (!response) return res.status(200).send("Data Not Found....!");
  return res.status(200).send(response);
});

// sending payload based on billers
router.post("/payload", async (req, res) => {
  console.log(req.body);
  // const payload = await mongofunctions.findD("Biller", {
  //   "verify.referenceNumber": { $ne: referenceNumber }
  // });

  const payload = await mongofunctions.findD("Biller", {
    code: req.body.code,
  });

  console.log(payload.length);
  return res.status(200).send(payload);
});

module.exports = router;
