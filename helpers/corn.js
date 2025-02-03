var cron = require("node-cron");
const redisFunctions = require("./redisFunctions");
const mongofunctions = require("./mongofunctions");
const axios = require("axios");
const { trusted } = require("mongoose");

const token_details = {
  access_token:
    "eyJraWQiOiJraWoydFFERTZiSWxnOFE3enZMSmFZaE5jNXdlWHRzaVM0OW1vYVR4YWs0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzNmRkbHRubG1rbXFrbWJ1M2E4MXRwNnBrbSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoibWVjb20tYXV0aFwvYWxsIiwiYXV0aF90aW1lIjoxNzI3OTQ3MzA1LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTFfWmZCalVlU3kzIiwiZXhwIjoxNzI3OTUwOTA1LCJpYXQiOjE3Mjc5NDczMDUsInZlcnNpb24iOjIsImp0aSI6ImNjYTFhMTNjLTRiMTYtNGRhZC1hMTIyLWI2ODM5YmE2ZjQ5OCIsImNsaWVudF9pZCI6IjM2ZGRsdG5sbWttcWttYnUzYTgxdHA2cGttIn0.SeQH_cGcxmtDs7DF1Y5Uz-3pTZ5noAnOnAOc-T3MNEkaX36W_v1d8w4vadsatCOfwnKUYHI_AnjQCwWTkmNYVm_GPwyCU2OOEkWRJ92KJcwO0joII-0nbciA-HQ4vWDwva2_g1IZGjSdBCE8ius46nZfrilNfezNef2JbZzNwg1lopp9-mhr8HG0YFzBpQYr2c7-7x2iCj3hoL_C-T4-KyoIqdVCuOhZ99EQ0dpFWMIt7mY1-6uPLTN5161f7c673iSpRRbNnZ4XIVjmgSAgJl6C0F_mp-rNzB-390mwyrT_-CBtSKRyM-INeGfUn-Y3B4MwoOkv7ptFgYI3tIoEBA",
  expires_in: 3600,
  token_type: "Bearer",
};

// cron.schedule('* * * * *', async() => {
//   console.log('running a task every minute');

//     console.log("Request received");

//     const config = {
//       method: "get",
//       maxBodyLength: Infinity,
//       url: "https://stg.bc-api.bayad.com/v3/billers?categoriesOnly=true",
//       headers: {
//         Authorization: token_details.access_token,
//       },
//     };

//     try {
//       const response = await axios(config);
//       const categories = response.data.data;
//       const categoryres = await redisFunctions.redisSetSingle("categorys",categories,true)
//       console.log(categoryres);

//     //   console.log(categories,"data");
//       const categoryWiseData = [];
//       // Loop through categories to fetch data for each category
//       for (let i = 0; i < categories.length; i++) {
//         const category = categories[i];

//         const categoryConfig = {
//           method: "get",
//           maxBodyLength: Infinity,
//           url: `https://stg.bc-api.bayad.com/v3/billers?category=${category}`,
//           headers: {
//             Authorization: token_details.access_token,
//           },
//         };

//         try {
//           const categoryResponse = await axios(categoryConfig);
//           x = await redisFunctions.redisInsert(
//               "categorysData",
//             category,
//              categoryResponse.data,
//           true
//           );
//           console.log(x,"data");

//         } catch (error) {
//           return error;
//         }
//       }

//       return trusted
//     } catch (error) {
//       return error
//     }
//   });

const addingCategorys = async () => {
  const token_details = {
    access_token: "eyJraWQiOiJraWoydFFERTZiSWxnOFE3enZMSmFZaE5jNXdlWHRzaVM0OW1vYVR4YWs0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzNmRkbHRubG1rbXFrbWJ1M2E4MXRwNnBrbSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoibWVjb20tYXV0aFwvYWxsIiwiYXV0aF90aW1lIjoxNzI4MjkyODI3LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTFfWmZCalVlU3kzIiwiZXhwIjoxNzI4Mjk2NDI3LCJpYXQiOjE3MjgyOTI4MjcsInZlcnNpb24iOjIsImp0aSI6IjIwMDAyMDc1LTgzYmUtNGFmZi1hODk2LTc3M2M3MTg3MDZmMyIsImNsaWVudF9pZCI6IjM2ZGRsdG5sbWttcWttYnUzYTgxdHA2cGttIn0.Y-Pd1Ri6zPlBcE_j3bIa8jbQyHVpegpW4tKwxjfRkQuKAjvhDxWN8jo403Z5qEU-iCyf5yrlaQUZNkFF8KYkkCqiq3dY62jl0r6kv5Oek2iQMMO0Vzv3KBmG0_ikSmeEpOrHP4JmwLyqV3RyTtYNDkTwsjm8XPtOUIL-5k-TiJjaM1tOGyCCIb001t1ZEktJ93KapsRaQ05j7kCtFEJiCHXbSSIUpg1GR5QJy3T7uEaSli1t36U_CpDaHMXwMY6huGQ68P4AoZ-KJ-1NGyA2I7zDaXNSdoz6INwN7Rls9ZRmGQS5qUZYUsRjv2O9P7XBy7OruGAKfECjKG2HszE8kQ",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
  console.log("data");

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://stg.bc-api.bayad.com/v3/billers",
    headers: {
      Authorization: token_details.access_token,
    },
  };

  const bellerArray = [];

  try {
    const billetsList = await axios(config);
    console.log(billetsList.data.data.length);

    for (let i = 0; i < billetsList.data.data.length; i++) {
      const data = billetsList.data.data[i];
      console.log(data.code, "nameeeee");

      // Store Redis data
      await redisFunctions.redisInsert("Billers_list", data.code, data, true);

      const code = data.code;

      // Create request configurations
      const detailsConfig = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://stg.bc-api.bayad.com/v3/billers/${code}`,
        headers: {
          Authorization: token_details.access_token,
        },
      };
      const chargesConfig = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://stg.bc-api.bayad.com/v3/billers/${code}/fees`,
        headers: {
          Authorization: token_details.access_token,
        },
      };

      try {
        // Fetch biller details
        const billetsDetails = await axios(detailsConfig);
        const otherCharges = await axios(chargesConfig);
        // console.log(
        //   billetsDetails.data.data.parameters.verify,
        //   "billetsDetails"
        // );
        const payloadData = billetsDetails.data.data.parameters.verify;

        const amount = payloadData.find((item) => item.amount !== undefined);
        const referenceNumber = payloadData.find(
          (item) => item.referenceNumber !== undefined
        );
        const other_charges = payloadData.find(
          (item) => item.otherCharges !== undefined
        );

        // console.log(amount, "amo------unt");

        // const rules = {rules : otherCharges.verify.rules} || {}
        // const amount = {amount : otherCharges.verify.amount} || {}

        const paylaod = {
          referenceNumber,
          amount,
          other_charges,
        };
        // console.log(paylaod, "payload");

        // }
        // console.log(billetsDetails.data.data.parameters.verify,"pauylosd");
        // console.log(billetsDetails.data.data.parameters.verify,"rules");

        const mergeData = {
          code: billetsDetails.data.data.code,
          otherCharges: otherCharges.data.data.otherCharges,
          payload: paylaod,
        };
        console.log(mergeData, "mergedata--------->");

        bellerArray.push(mergeData);
      } catch (error) {
        // addingCategorys()
        if(error.response.data.details.message ==='Please provide the amount.'){
          const mergeData = {
            code: billetsDetails.data.data.code,
            otherCharges: "Amount Requred",
            payload: paylaod,
          };
          console.log("error",mergeData);
          
          bellerArray.push(mergeData);
        }
        // bellerArray.push(mergeData);
        console.log(
          "Error fetching biller details:",
          error.response?.data || error.message
        );
        continue;
      }
    }

    const insertMany = await mongofunctions.insert_many("Biller", bellerArray);
    return insertMany;
  } catch (error) {
    console.log(
      "Error fetching billers list:",error.response?.data || error.message
    );

    return error;
  }
};
addingCategorys();
