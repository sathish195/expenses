const amw = require("../../middlewares/async");
const crypto = require("../../helpers/crypt");
const { get_random_string } = require("../../helpers/functions");
const express = require("express");
const func = require("../../helpers/functions");
const jwt = require("jsonwebtoken");
const mongofunctions = require("../../helpers/mongofunctions");
const ratelimit = require("../../middlewares/rateLimiter");
const rediscon = require("../../helpers/redisFunctions");
const router = express.Router();
const validations = require("../../helpers/validations");
const tele = require("../../helpers/telegram");
const functions = require("../../helpers/functions");
const auth = require("../../middlewares/auth");
const admin = require("../../middlewares/admin");
const { GROUP } = require("../../models/GROUPS");
const redis = require("../../helpers/redisFunctions");
const moment = require("moment");
const axios = require("axios");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
// const loginUrl = "https://splitwise-1273e.web.app/login"
const loginUrl = "http://localhost:3000/login";

// const loginUrl = "http://localhost:3000/login";

// const REDIRECT_URI = 'http://localhost:5000/user/auth/google/callback';
const REDIRECT_URI =
  "https://expenses-1-8rc7.onrender.com/user/auth/google/callback";

// const REDIRECT_URI = "http://localhost:8080/user/auth/google/callback

// CORS configuration

// open every visit
router.post("/auth/google", (req, res) => {
  console.log("Hitting Google Auth endpoint");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email&prompt=consent`;
  return res.status(200).send({ url: url });
});
// only open sigle time
// router.post("/auth/google", (req, res) => {
//   console.log("Hitting Google Auth endpoint");
//   const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
//   return res.status(200).send({ url: url });

//   // res.redirect(url);
//   // return true
// });

router.get("/auth/google/callback", async (req, res) => {
  console.log("Hitting Google callback endpoint");

  const { code } = req.query;
  console.log(code, "code-----");

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }
    );

    const { access_token } = tokenResponse.data;

    // Fetch user profile using the access token
    const profileResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const profile = profileResponse.data;
    // if(!profile.email) return res.status(400).send("Email Not Found")
    console.log(profile, "profile");

    const findUser = await mongofunctions.find_one("USER", {
      user_email: profile.email,
    });
    console.log(findUser, "finduser");
    let obj = {};
    if (!findUser) {
      obj = {
        user_id: get_random_string("0", 8),
        user_name: profile.name.trim(),
        user_email: profile.email,
        user_profile: profile.picture,
      };
      const saveUser = await mongofunctions.create_new_record("USER", obj);
      console.log(saveUser);

      const token = jwt.sign(obj, process.env.JWTPRIVATEKEY, {
        expiresIn: "10d",
      });
      console.log(token, "to--------ken");

      // redirect to app url
      return res.redirect(`${loginUrl}?data=${encodeURIComponent(token)}`);
    }
    obj = {
      user_id: findUser.user_id,
      user_name: findUser.user_name,
      user_email: findUser.user_email,
      user_profile: findUser.user_profile,
    };
    const token = jwt.sign(obj, process.env.JWTPRIVATEKEY, {
      expiresIn: "10d",
    });
    return res.redirect(`${loginUrl}?data=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error(
      "Error during authentication:",
      error.response ? error.response.data : error.message
    );
    return res.status(400).redirect("/login");
  }
});
//register
router.post(
  "/register",
  amw(async (req, res) => {
    let data = req.body;
    var { error } = validations.register(data);
    if (error) return res.status(400).send(error.details[0].message);
    data.user_name = data.user_name.toLowerCase().trim();
    let find_user = await mongofunctions.find_one("USER", {
      $or: [{ user_id: data.user_id }, { user_name: data.user_name }],
    });
    console.log(find_user, "finduser");

    if (find_user) {
      console.log("datasdfsdfs-------->");

      if (find_user.id_status === "UNVERIFIED") {
        let otp = tele.OTP("False");
        await rediscon.with_expire(
          "EXPENSE_OTP",
          find_user.user_id,
          otp,
          240,
          false
        );
        let response = await tele.sendMessage(
          find_user.user_id,
          `👉 ${otp} is your verification code..!`
        );
        if (!response)
          return res
            .status(400)
            .send("Start the bot and try again with valid ID..!");

        //   return res.status(400).send("Kindly verify your ID..!");
        return res.status(200).send({ success: "OTP sent" });
      } else if (find_user.user_id === data.user_id) {
        return res.status(400).send("ID already Exists..!");
      } else if (find_user.user_name === data.user_name) {
        return res.status(400).send("User name already Exists..!");
      } else return res.status(400).send("-----");
    }
    let user_data = {
      user_id: data.user_id,
      user_name: data.user_name.toLowerCase(),
      // last_login_ip: data.last_login_ip,
    };
    let user = await mongofunctions.create_new_record("USER", user_data);
    if (user) {
      let otp = tele.OTP("False");
      await rediscon.with_expire("EXPENSE_OTP", user.user_id, otp, 240, false);
      let response = await tele.sendMessage(
        data.user_id,
        `👉 ${otp} is your verification code..!`
      );
      if (!response)
        return res
          .status(400)
          .send("Start the bot and try again with valid ID..!");
      return res.status(200).send({ success: "Registration successfull..!" });
    } else return res.status(400).send("Failed to register..!");
  })
);
//verify id//resend
router.post(
  "/verify_id_resend",
  amw(async (req, res) => {
    let data = req.body;
    console.log(data, "dafdsfsfsfsf");

    var { error } = validations.verify_id(data);
    if (error) return res.status(400).send(error.details[0].message);
    console.log(data, "dafdsfsfsfsf");

    let find_user = await mongofunctions.find_one("USER", {
      $or: [{ user_id: data.user_name }, { user_name: data.user_name }],
    });
    console.log(find_user);

    if (find_user) {
      // if (find_user.id_status === "UNVERIFIED") {
      let otp = tele.OTP("False");
      await rediscon.with_expire(
        "EXPENSE_OTP",
        find_user.user_id,
        otp,
        240,
        false
      );
      let response = await tele.sendMessage(
        find_user.user_id,
        `👉 ${otp} is your verification code..!`
      );
      if (!response)
        return res
          .status(400)
          .send("Start the bot and try again with valid ID..!");
      // }
      return res.status(200).send({ success: "OTP sent" });
    }
    return res.status(400).send("Not Registered /Invalid ID");
  })
);
//validate otp
router.post(
  "/validate_otp",
  amw(async (req, res) => {
    let data = req.body;
    var { error } = validations.validate_otp(data);
    if (error) return res.status(400).send(error.details[0].message);
    let find_user = await mongofunctions.find_one("USER", {
      $or: [
        { user_id: data.user_id },
        { user_name: data.user_id.toLowerCase() },
      ],
    });
    if (find_user) {
      // if (find_user.id_status === "UNVERIFIED") {
      let otp = await rediscon.redisGet("EXPENSE_OTP", find_user.user_id, true);
      if (!otp) return res.status(400).send("Invalid / Expired..!");
      if (Number(otp) === Number(data.otp)) {
        let user_up = await mongofunctions.find_one_and_update(
          "USER",
          { user_id: find_user.user_id },
          { id_status: "ACTIVE" },
          { new: true }
        );
        const token = jwt.sign(
          {
            user_id: user_up.user_id,
            user_name: user_up.user_name,
            id_status: user_up.id_status,
            // user_type: user_up.user_type,
            user_status: user_up.user_status,
          },
          process.env.JWTPRIVATEKEY,
          { expiresIn: "10d" }
        );
        return res.status(200).send({ success: "Verified", token });
      } else {
        return res.status(400).send("Invalid OTP..!");
      }
      // }
    }
    return res.status(400).send("Invalid User");
  })
);
// creating groups Business perpose
router.post(
  "/creating_group",
  ratelimit,
  auth,
  amw(async (req, res) => {
    let data = req.body;
    console.log(data, "data");

    // var { error } = validations.getenc(data);
    // if (error) return res.status(400).send(error.details[0].message);
    var { error } = validations.group(data);
    if (error) return res.status(400).send(error.details[0].message);
    // const groupid = "478AA7EA"
    // get_random_string("0", 8);

    const groupid = get_random_string("0", 8);
    data.userid = req.user.user_id;
    data.group_name = data.group_name.toLowerCase();
    console.log(data, "rutreeeegroup------>");

    data.group_status = "ACTIVE";
    console.log(data.group_status, "dataw");
    const id = req.user.user_id;
    // const id = "234FDSASDB";

    data.group_id = groupid;
    const groupData = { ...data, groupid };
    groupData.users = {};
    groupData.users[id] = {
      name: req.user.user_name,
      user_id: id,
      is_admin: true,
      balance: 0,
    };
    console.log(groupid, "data");
    // console.log(groupData,"data");
    // find group name
    const findGroup = await mongofunctions.find_one("GROUP", {
      group_id: groupid,
    });

    if (findGroup)
      return res.status(400).send("Something Went Wrong Please try a Agian!");
    console.log(findGroup, "findGroup");

    // return res.send("sathish")

    // return true
    console.log(groupData);

    const saveGroup = await mongofunctions.create_new_record(
      "GROUP",
      groupData
    );
    // console.log(saveGroup, "datafsdfsfsdfsdf");
    return res.status(200).send("Group Created Successfully");
  })
);

// creating catogerys
router.post(
  "/add_update_category",
  ratelimit,
  // auth,
  amw(async (req, res) => {
    let data = req.body;
    console.log(data, "data");

    // var { error } = validations.getenc(data);
    // if (error) return res.status(400).send(error.details[0].message);
    var { error } = validations.add_category(data);
    if (error) return res.status(400).send(error.details[0].message);
    data.group_id = data.group_id;
    data.category_name = data.category_name.toLowerCase();
    // if (data.category_id) {
    //   // Update existing category
    //   const updateCategory = await mongofunctions.find_one_and_update(
    //     "CATEGORY",
    //     { category_id: data.category_id },
    //     { $set: data }
    //   );

    //   if (!updateCategory) {
    //     return res.status(404).send("Category not found");
    //   }
    //   return res.status(200).send("Category Updated Successfully");
    // }
    // if(data.category_name === "common") return res.status(400).send("Common Category Not Added")
    // if (data.category_name === "common") {
    //   return res.status(400).send("The 'Common' category cannot be added.");
    // }

    data.category_id = get_random_string("0", 8);
    // data.userid = req.user.user_id;
    data.userid = "987658976578";

    console.log(data, "data1");

    // const cetegory = { ...data, groupid };
    // console.log(cetegory, "groupdata");

    // console.log(groupData,"data");
    // return true

    const saveGroup = await mongofunctions.create_new_record("CATEGORY", data);
    console.log(saveGroup);
    return res.status(200).send(saveGroup);
  })
);

// get all users
router.post(
  "/all_users",
  ratelimit,
  auth,
  amw(async (req, res) => {
    const allUsers = await mongofunctions.find("USER", {
      user_type: { $ne: req.user.user_type },
    });
    console.log(allUsers);
    return res.status(200).send(allUsers);
  })
);

// get group
router.post(
  "/get_groups",
  ratelimit,
  auth,
  amw(async (req, res) => {
    const userId = req.user.user_id;
    console.log(userId, "user_id");
    const groups = await mongofunctions.find("GROUP", {
      $or: [{ userid: userId }, { [`users.${userId}`]: { $exists: true } }],
    });
    console.log(groups, "sffsfsd");
    return res.status(200).send(groups);
  })
);

// add user from group
router.post(
  "/add_user",
  ratelimit,

  auth,
  // admin,
  amw(async (req, res) => {
    console.log(req.body, "body");
    const data = req.body;

    const { error } = validations.add_user(data);
    if (error) return res.status(400).send(error.details[0].message);

    // Find the group by ID
    const group = await mongofunctions.find_one("GROUP", {
      group_id: data.group_id,
    });

    if (!group) {
      return res.status(400).send("Group Not Found");
    }
    console.log(group);
    if (JSON.stringify(group.users) === "{}")
      return res.status(400).send("Users Not Found In Group");

    const admin = group.users[req.user.user_id].is_admin;
    console.log(admin, "admin");

    if (!group) {
      return res.status(400).send("Group Not Found");
    }

    // Find the user by ID
    const user = await mongofunctions.find_one("USER", {
      user_id: req.body.userid,
    });
    console.log(user, "user--------<>>>");

    if (!user) {
      return res.status(400).send("User Not Found");
    }

    //  check user already group are not
    console.log(user.user_id);
    if (group.users !== undefined) {
      if (group.users[req.body.userid]) {
        return res.status(400).send("User is Already a Member Of The Group");
      }
    }
    console.log("test");

    // Create userData object
    const userData = {
      user_id: user.user_id,
      name: user.user_name,
      balance: 0,
      addedby: req.user.user_name,
      is_admin: false,
    };

    console.log(userData, "userdata<-----------><----------->");

    // Add the user to the group
    const adding_user = await mongofunctions.find_one_and_update(
      "GROUP",
      { group_id: req.body.group_id },
      {
        $inc: { members_count: 1 },
        $set: { [`users.${user.user_id}`]: userData },
      }
    );
    console.log(adding_user, "update data");

    // const addingGroupUSer = await mongofunctions.find_one_and_update(
    //   "USER",
    //   { user_id: user.user_id },
    //   {
    //     $set: {
    //       [`groups.${req.body.group_name}`]: {
    //         group_name: req.body.group_name,
    //         balance: 0,
    //       },
    //     },
    //   }
    // );

    // console.log(addingGroupUSer, "addingh group");

    console.log(adding_user);

    res
      .status(200)
      .send({ message: "User Added To Group Successfully", adding_user });
  })
);

// remove user from group
router.post(
  "/remove_user",
  ratelimit,
  auth,
  amw(async (req, res) => {
    console.log(req.body, "body");

    const { error } = validations.add_user(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    // Find the group by ID
    const group = await mongofunctions.find_one("GROUP", {
      group_id: req.body.group_id,
    });

    console.log(group, "group---->");

    if (!group) {
      return res.status(400).send("Group Not Found");
    }
    const isAdmin = group.users[req.user.user_id].is_admin;

    console.log(isAdmin, "is<-----admin----->code");

    if (!isAdmin) return res.status(400).send("Admin Not Found In Group....");
    const userBls = group.users[req.body.userid].balance;
    console.log(userBls);

    if (userBls !== 0) {
      return res.status(400).send("Only remove user balance when it is 0.");
    }

    if (req.body.userid === req.user.user_id) {
      if (isAdmin && group.admins_count === 1) {
        console.log("sathish");

        return res
          .status(400)
          .send("You Cannot Remove This Group Because There Are No Admins.");
      }
      // return true;
      const user_amount = group.users[req.user.user_id].balance;
      const bls = group.balance < 0 ? user_amount : -user_amount;

      // Remove the user from the group
      const updatedData = await mongofunctions.find_one_and_update(
        "GROUP",
        { group_id: req.body.group_id },
        {
          $inc: { members_count: -1, group_balance: Number(bls) },
          $unset: { [`users.${req.user.user_id}`]: "" },
        }
      );
      res.status(200).send(updatedData);
    }
    console.log(group, "group---->========<");

    console.log(group.users[req.user.user_id].is_admin, "users----->");
    // Check if the user has the right to remove a user
    const group_user = group.users[req.body.userid];
    console.log(group_user, "groupuser");

    if (!group_user) return res.status(400).send("User Not Found In Group....");
    const amount = group.users[req.body.userid].balance;
    const bls = group.balance < 0 ? amount : -amount;
    console.log(bls);

    // return res.status(200).send(bls)

    // if (!isAdmin) {
    //   return res
    //     .status(400)
    //     .send("You Are Not Authorized To Remove This User.");
    // }
    // console.log(group, "group");

    // Find the user by ID
    // const group_user = await mongofunctions.find_one("GROUP", {
    //   group_name: req.body.group_name,
    //   [`users.${req.body.userid}`]: { $exists: true },
    // });

    // if (!group_user) {
    //   return res.status(400).send("User Not Found");
    // }
    // return res.send(group_user)

    // // Check if the user is a member of the group
    // if (!group.members.includes(user.user_id)) {
    //   return res.status(400).send("User is Not a member of the group");
    // }

    // Remove the user from the group
    console.log(amount, "------>------");

    // return res.send(amount)
    const updatedData = await mongofunctions.find_one_and_update(
      "GROUP",
      { group_id: req.body.group_id },
      {
        $inc: {
          members_count: -1,
          group_balance: Number(bls),
        },
        $unset: { [`users.${req.body.userid}`]: "" },
      }
    );

    console.log(updatedData, "----removing data--->");

    res.status(200).send(updatedData);
  })
);

// admin promote and demote user or admin
router.post(
  "/promote_demote",
  ratelimit,

  auth,
  amw(async (req, res) => {
    console.log(req.user);

    console.log(req.body, "body");

    const { error } = validations.promote_demote(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Find the group by ID
    const group = await mongofunctions.find_one("GROUP", {
      group_id: req.body.group_id,
    });
    if (!group) {
      return res.status(400).send("Group Not Found");
    }

    // Check if the user has the right to remove a user
    const isAdmin = group.users[req.user.user_id]?.is_admin;
    console.log(isAdmin, "admin");

    if (!isAdmin) {
      return res
        .status(400)
        .send("You Are Not Authorized To Remove This User.");
    }
    console.log(group, "group");

    // Find the user by ID
    const user = await mongofunctions.find_one("USER", {
      user_id: req.body.userid,
    });
    console.log(user, "user-------");

    if (!user) {
      return res.status(400).send("User Not Found");
    }

    // // Check if the user is a member of the group
    // if (!group.members.includes(user.user_id)) {
    //   return res.status(400).send("User is Not a member of the group");
    // }
    const adminCount = req.body.is_admin
      ? group.admins_count + 1
      : group.admins_count - 1;
    // Remove the user from the group
    const updatedData = await mongofunctions.find_one_and_update(
      "GROUP",
      { group_id: req.body.group_id },
      {
        $set: {
          admins_count: adminCount,
          [`users.${user.user_id}.is_admin`]: req.body.is_admin,
        },
      }
    );

    // update user_id common expenses
    if(req.body.is_admin){
    
    const commonExpenses = await mongofunctions.find_one_and_update(
      "Common",
      { group_id: updatedData.group_id },
      {
        $addToSet: { admin_ids: req.body.userid } 
      },
      { new: true } 
    );
  }

    console.log(updatedData, "------->");

    res.status(200).send(updatedData);
  })
);
// get all categorys
router.post(
  "/get_categorys",
  ratelimit,

  auth,
  amw(async (req, res) => {
    console.log(req.body, "cetegory_groupnade");

    const { error } = validations.get_catogory(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    console.log(req.body, "body");

    const sort = { createdAt: -1 };
    const getCategorys = await mongofunctions.find(
      "CATEGORY",
      {
        group_id: req.body.group_id,
      },
      sort
    );
    if (!getCategorys) return res.status(200).send([]);

    const group_users = await mongofunctions.find(
      "GROUP",
      {
        $or: [{ group_id: req.body.group_id }],
      },
      sort
    );
    if (!group_users) return res.status(200).send([]);
    console.log(group_users, "group_users");

    console.log(group_users[0].users, "userss");

    return res
      .status(200)
      .send({ categorys: getCategorys, users: group_users[0].users });
  })
);

// remove  categorys
router.post(
  "/remove_categorys",
  ratelimit,

  auth,
  // admin,
  amw(async (req, res) => {
    console.log(req.body);
    const { error } = validations.cetegory_id(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const category = await mongofunctions.find_one("CATEGORY", {
      category_id: req.body.category_id,
    });
    if (category.category_name === "common")
      return res.status(400).send("You Can't Remove Common Category");
    const getCategorys = await mongofunctions.delete_one("CATEGORY", {
      category_id: req.body.category_id,
    });
    console.log(getCategorys, "data");

    if (!getCategorys) return res.status(400).send("Category Not Found...");
    console.log(getCategorys, "remove--------->");
    return res.status(200).send("Category Removed Successfully");
  })
);

// get user route
router.post(
  "/get_user",
  ratelimit,

  auth,
  amw(async (req, res) => {
    const findUser = await mongofunctions.find_one("USER", {
      user_id: req.user.user_id,
    });
    return res.status(200).send(findUser);
  })
);


router.post(
  "/add_update_common_expenses",
  ratelimit,
  auth,
  // admin,
  amw(async (req, res) => {
    const data = req.body;
    console.log(data, "data------>");

    // Validate input data
    const { error } = validations.common(data);
    if (error) return res.status(400).send(error.details[0].message);

    // Find the group
    const findGroup = await mongofunctions.find_one("GROUP", { group_id: data.group_id });
    if (!findGroup) {
      return res.status(400).send(`Group not found for ID '${data.group_id}'. Please check the input and try again.`);
    }

    // Find common expenses
    const commonExpenses = await mongofunctions.find_one("Common", { group_id: data.group_id });
    if (!commonExpenses) return res.status(400).send("Common Expenses Not Found!");

    // Generate a unique transaction ID
    data.t_id = get_random_string("0", 8);

    // Prepare data for the expense record
    data.user_id = req.user.user_id;
    data.name = req.user.user_name;
    data.added_by = req.user.user_id;
    data.category = "common";
    data.description = data.common_name.toLowerCase();
    data.comment = `${req.user.user_name} spent $${data.amount} ${data.description}`;

    // Create the expense record
    const expenseRecord = await mongofunctions.create_new_record("Transaction", data);
    console.log(expenseRecord, "expenses");

    // Prepare data for the income record
    data.t_id = get_random_string("0", 8);
    data.receiver = { receiver_id: req.user.user_id, name: "Admin" };
    data.category = "income";
    data.sender_id = req.user.user_id;

    // Create the income record
    const incomeRecord = await mongofunctions.create_new_record("Transaction", data);
    console.log(incomeRecord, "income");

    // Update the due date in Common collection
    const updatedDueDate = await mongofunctions.find_one_and_update(
      "Common",
      { id: commonExpenses.id },
      { $set: { due_date: new Date(commonExpenses.due_date.setMonth(commonExpenses.due_date.getMonth() + 1)) } }
    );

    if (!updatedDueDate) {
      return res.status(500).send("Failed to update due date.");
    }

    // Return success response
    return res.status(200).send("Success");
  })
);

// add expenses route
router.post(
  "/add_expenses",
  ratelimit,

  auth,
  amw(async (req, res) => {
    const data = req.body;
    console.log(data, "data------>");
    var { error } = validations.expenses_history(data);
    if (error) return res.status(400).send(error.details[0].message);
    console.log(req.user.user_id);

    // const newLocal = === "";
    // const category = data.category ? newLocal
    data.t_id = get_random_string("0", 8);
    // if(data.user_id && req.user.user)
    const id = data.user_id === undefined ? req.user.user_id : data.user_id;
    console.log(id, "id");
    const find_group = await mongofunctions.find_one("GROUP", {
      group_id: data.group_id,
      [`users.${id}`]: { $exists: true },
    });
    if (!find_group) return res.status(400).send("User Not Found In Group..");
    console.log(find_group, "group----0--->");
    const admin = find_group.users[req.user.user_id].is_admin;
    console.log(admin);

    // if (data.user_id !== "" && !admin)
    //   return res.status(400).send("You cannot add expenses for other users.");
    // return res.send(admin);

    console.log(id, "id");

    const findUser = await mongofunctions.find_one("USER", {
      user_id: id,
    });
    if (!findUser) return res.status(400).send("User Not Found..");

    data.user_id = id;
    data.added_by = req.user.user_id;
    // Constructing the comment
    data.comment =
      data.user_id === ""
        ? `${req.user.user_name} spent $${data.amount} ${data.description}`
        : `${findUser.user_name} spent $${data.amount} ${data.description}`;
    console.log(data, "--------d-------------");

    console.log(findUser, "---9--->");

    const bls =
      (find_group.users[find_group.group_id]?.balence || 0) - data.amount;
    console.log(bls, "bls");
    const userBls = find_group.users[id].balance;

    const updatedBls = Number(userBls) - Number(data.amount);
    data.name = findUser.user_name;

    const receiver = {
      updated_balance: updatedBls,
      previous_balance: userBls,
    };

    // receiver.previous_balance = userBls;

    // receiver.updated_balance = updatedBls;
    console.log(receiver, "data---------------->");
    const mergeData = { ...data, receiver };
    // return res.send(mergeData);

    // return true
    // const save = await mongofunctions.create_new_record("Transaction", mergeData);

    //
    // console.log(save, "data---save---->");
    // const updateAmount = await mongofunctions.find_one_and_update(
    //   "USER",
    //   { user_id: req.user.user_id },
    //   {
    //     $set: {
    //       [`groups.${data.group_name}.balence`]: bls,
    //     },
    //   },
    //   { new: true }
    // );
    console.log(data, "----payload----->");

    // const updateGroupAmount = await mongofunctions.find("GROUP",
    //   { group_name: data.group_name },
    // );
    // return res.status(400).send(mergeData)
    const updateGroupAmount = await mongofunctions.find_one_and_update(
      "GROUP",
      { group_id: data.group_id },
      {
        $inc: {
          group_balance: -data.amount,
          [`users.${id}.balance`]: -data.amount,
        },
      },
      { new: true, upsert: false }
    );
    if (!updateGroupAmount) return res.status(400).send("Group Not Found");
    mergeData.group_balance = updateGroupAmount.group_balance;
    const save = await mongofunctions.create_new_record(
      "Transaction",
      mergeData
    );

    console.log(save, "updategroupamount");

    // console.log(updateAmount, "data");
    return res.status(200).send(updateGroupAmount);
  })
);

// add expenses route
router.post(
  "/internal_transfar",
  ratelimit,
  auth,
  amw(async (req, res) => {
    const data = req.body;
    console.log(data, "data------>");
    var { error } = validations.internal_transsfar(data);
    if (error) return res.status(400).send(error.details[0].message);
    data.category = "internal_transfer";

    console.log(req.user.user_id);

    // const newLocal = === "";
    // const category = data.category ? newLocal
    data.t_id = get_random_string("0", 8);

    // if(data.user_id && req.user.user)
    const id = data.user_id === req.user.user_id;
    console.log(id, "id");
    const find_group = await mongofunctions.find_one("GROUP", {
      group_id: data.group_id,
    });
    console.log(find_group, "group");

    if (!find_group) return res.status(400).send("Group Not Found");
    const admin = find_group.users[req.user.user_id].is_admin;
    if (!admin) return res.status(400).send("Only Group Admins Transfar");

    const fromUser = find_group.users[data.from];
    if (!fromUser) return res.status(400).send("From User Not Found In Group");
    console.log(fromUser);

    const toUser = find_group.users[data.to];
    console.log(toUser);

    if (!toUser) return res.status(400).send("To User Not Found In Group");

    const from_bls = find_group.users[data.from].balance;
    const to_bls = find_group.users[data.to].balance;
    const toUserName = find_group.users[data.to].name;
    const fromUserName = find_group.users[data.from].name;
    data.group_balance = find_group.group_balance;
    data.user_id = req.user.user_id;
    console.log(from_bls);

    if (Number(from_bls) < Number(data.amount)) {
      return res.status(400).send("Insufficient Balance");
    }
    // return "satnish"
    // Constructing the comment
    // data.comment = `$${data.amount} Rupees ${fromUserName} transferred to ${toUserName}`;
    data.comment = `${data.amount} Rupees transferred from ${fromUserName} to ${toUserName}.`;

    // -4000 PESO transferred to SEAGATE EACRJ TUPOLEVAAN SCHIPHOL
    // Akash credited $5 to Sathish
    const updatedBls =
      Number(from_bls) < 0
        ? Number(from_bls) + Number(data.amount)
        : Number(from_bls) - Number(data.amount);

    // const updatedBls = Number(from_bls) <0 ?  Number(from_bls) +  Number(data.amount) :  Number(from_bls) -  Number(data.amount);
    data.name = fromUserName;
    let receiver = {};

    receiver = {
      from_user_name: fromUserName,
      from_user_id: data.from,
      updated_balance: updatedBls,
      previous_balance: from_bls,
    };

    const fromUserData = { ...data, receiver };
    delete fromUserData.from;
    delete fromUserData.to;
    const transactionData = await mongofunctions.create_new_record(
      "Transaction",
      fromUserData
    );
    // return res.status(200).send(fromUserData)

    const toUserupdateBls = Number(to_bls) + Number(data.amount);

    receiver = {
      to_user_name: toUserName,
      from_user_id: data.to,
      updated_balance: toUserupdateBls,
      previous_balance: to_bls,
    };
    data.t_id = get_random_string("0", 8);
    data.comment = `$${data.amount} Rupees credited from ${fromUserName} to ${toUserName}.`;
    // $10 Rupees credited from Sathish to Akash.

    const toUserData = { ...data, receiver };
    delete toUserData.from;
    delete toUserData.to;

    // receiver.previous_balance = userBls;

    // receiver.updated_balance = updatedBls;
    // console.log(receiver, "data---------------->");
    // const mergeData = { ...data, toUserData };
    // return res.send(toUserData)

    const create_internal_record = await mongofunctions.create_new_record(
      "Transaction",
      toUserData
    );
    // return res.status(create_internal_record)

    // console.log(data, "----payload----->");

    const updateGroupAmount = await mongofunctions.find_one_and_update(
      "GROUP",
      { group_id: data.group_id },
      {
        $inc: {
          [`users.${data.from}.balance`]: -data.amount,
          [`users.${data.to}.balance`]: +data.amount,
        },
      },
      { new: true, upsert: false }
    );
    if (!updateGroupAmount) return res.status(400).send("Group Not Found");

    return res.status(200).send(updateGroupAmount);
  })
);
//admin remove expenses route
router.post(
  "/remove_expenses",
  auth,
  admin,
  amw(async (req, res) => {
    const data = req.body;
    console.log(data, "------->");

    var { error } = validations.remove_history(data);
    if (error) return res.status(400).send(error.details[0].message);
    // find transaction
    const findHistory = await mongofunctions.find_one("Expenses", {
      t_id: data.t_id,
    });
    console.log(findHistory, "history====>");

    if (!findHistory) return res.status(400).send("Transaction Not Found....");
    const id = findHistory.user_id;

    const findGroup = await mongofunctions.find_one("GROUP", {
      [`users.${id}`]: { $exists: true },
    });
    // if (!findGroup) return res.status(400).send("User Not Found In Group...");
    if (findHistory.group_name === " " || !findGroup) {
      console.log("if");
      const remove_history = await mongofunctions.delete_one("Expenses", {
        t_id: data.t_id,
      });
      console.log(remove_history, "removehistory");

      return res.status(200).send("Record Removed successfully...");
    }

    // // check admin or not
    // const admin = findGroup.users[req.user.user_id].is_admin;
    // console.log(admin);
    // remove transaction usr balance
    const balance = findGroup.users[id].balance;
    const groupBalance = findGroup.group_balance;
    console.log(balance);
    console.log(groupBalance);
    console.log(findHistory.amount);

    // updated userbls logic
    const d = balance <= 0 ? "satihsh" : "mahesh";

    console.log(d);

    const updateBls =
      balance <= 0
        ? Number(balance) + Number(findHistory.amount)
        : Number(balance) <= Number(findHistory.amount)
        ? Number(findHistory.amount) + Number(balance)
        : Number(balance) + Number(findHistory.amount);
    console.log(updateBls, "user");

    // updated group balance logic
    const groupBls =
      groupBalance <= 0
        ? Number(groupBalance) + Number(findHistory.amount)
        : Number(groupBalance) <= Number(findHistory.amount)
        ? Number(findHistory.amount) + Number(groupBalance)
        : Number(groupBalance) + Number(findHistory.amount);
    console.log(groupBls, "group");
    // return true
    const updateGroupAmount = await mongofunctions.find_one_and_update(
      "GROUP",
      { group_id: findGroup.group_id },
      {
        group_balance: groupBls,
        [`users.${id}.balance`]: updateBls,
      },
      { new: true, upsert: false }
    );

    const remove_history = await mongofunctions.delete_one("Expenses", {
      t_id: data.t_id,
    });
    console.log(remove_history);

    return res.status(200).send("Record Removed successfully...");
  })
);

// admin remove income route
router.post(
  "/remove_income",
  auth,
  admin,
  amw(async (req, res) => {
    const data = req.body;
    const { error } = validations.remove_history(data);
    if (error) return res.status(400).send(error.details[0].message);
    console.log(data);

    // Find transaction
    const findHistory = await mongofunctions.find_one("Income", {
      t_id: data.t_id,
    });
    if (!findHistory) return res.status(400).send("Transaction Not Found....");
    const id = findHistory.receiver.receiver_id;

    const findGroup = await mongofunctions.find_one("GROUP", {
      [`users.${id}`]: { $exists: true },
    });
    // if (!findGroup) return res.status(400).send("User Not Found In Group...");
    console.log(findGroup, "find_group");

    if (findHistory.receiver.name === "Admin" || !findHistory) {
      const remove_history = await mongofunctions.delete_one("Income", {
        t_id: data.t_id,
      });
      console.log(remove_history);
      return res.status(200).send("Record Removed successfully...");
    }

    // Check if user is admin
    const admin = findGroup.users[req.user.user_id]?.is_admin;
    console.log(admin);

    // Remove transaction from user balance
    const balance = findGroup.users[id].balance;
    const groupBalance = findGroup.group_balance;

    // Calculate updated balances
    const updateBls = Number(balance) - Number(findHistory.amount);
    const groupBls = Number(groupBalance) - Number(findHistory.amount);
    console.log(updateBls, "user");
    console.log(groupBls, "group");

    // if (
    //   (data.user_id && !admin) ||
    //   (data.user_id && req.user.user_type !== "ADMIN")
    // ) {
    //   return res
    //     .status(400)
    //     .send("You cannot remove expenses for other users.");
    // }

    console.log(id, "id------------");
    console.log(groupBls, "groupbls-------");
    console.log(updateBls, "updated-----------");

    // Update only the specified user's balance and group balance
    const updateGroupAmount = await mongofunctions.find_one_and_update(
      "GROUP",
      { [`users.${id}`]: { $exists: true } },
      {
        $set: {
          group_balance: groupBls,
          [`users.${id}.balance`]: updateBls,
        },
      },
      { new: true, upsert: false }
    );

    console.log(updateGroupAmount, "Updated Group Amount");

    // Remove the income transaction
    const remove_history = await mongofunctions.delete_one("Income", {
      t_id: data.t_id,
    });
    console.log(remove_history);

    return res.status(200).send("Record Removed successfully...");
  })
);

// user remove transaction history
router.post(
  "/user_remove_expenses",
  auth,
  amw(async (req, res) => {
    const data = req.body;
    console.log(data, "----99999999--->");
    console.log("returndsfasfas");

    var { error } = validations.user_remove_history(data);
    if (error) return res.status(400).send(error.details[0].message);
    // find transaction
    const findHistory = await mongofunctions.find_one("Expenses", {
      t_id: data.t_id,
    });
    console.log(findHistory, "history====>");

    if (!findHistory) return res.status(400).send("Transaction Not Found....");
    if (findHistory.name === " ") {
      console.log("if");

      const remove_history = await mongofunctions.delete_one("Expenses", {
        t_id: data.t_id,
      });
      console.log(remove_history);

      return res.status(200).send("Record Removed successfully...");
    }
    const id = req.user.user_id;

    const findGroup = await mongofunctions.find_one("GROUP", {
      [`users.${id}`]: { $exists: true },
    });
    if (!findGroup) return res.status(400).send("User Not Found In Group...");

    const balance = findGroup.users[id].balance;
    // const balance = 100
    console.log(balance, "balance");

    const groupBalance = findGroup.group_balance;
    console.log(groupBalance, "groupBalance");

    // updated userbls logic
    const updateBls =
      balance < 0
        ? Number(balance) + Number(findHistory.amount)
        : Number(balance) < Number(findHistory.amount)
        ? Number(findHistory.amount) - Number(balance)
        : Number(balance) - Number(findHistory.amount);
    console.log(updateBls, "user");

    // updated group balance logic
    const groupBls =
      groupBalance < 0
        ? Number(groupBalance) + Number(findHistory.amount)
        : Number(groupBalance) < Number(findHistory.amount)
        ? Number(findHistory.amount) - Number(groupBalance)
        : Number(groupBalance) - Number(findHistory.amount);

    console.log(groupBls, "group");
    // return res.send(groupBalance)
    const updateGroupAmount = await mongofunctions.find_one_and_update(
      "GROUP",
      { group_name: findGroup.group_name.toLowerCase() },
      {
        $set: {
          group_balance: groupBls,
          [`users.${id}.balance`]: updateBls,
        },
      },
      { new: true, upsert: false }
    );

    const remove_history = await mongofunctions.delete_one("Expenses", {
      t_id: data.t_id,
    });
    console.log(remove_history, "fsyssdfgsd");

    return res.status(200).send("Record Removed Successfully...");
  })
);

// user remove income route
router.post(
  "/user_remove_income",
  auth,
  amw(async (req, res) => {
    const data = req.body;
    const { error } = validations.user_remove_history(data);
    if (error) return res.status(400).send(error.details[0].message);
    console.log(data);

    // Find transaction
    const findHistory = await mongofunctions.find_one("Income", {
      t_id: data.t_id,
    });
    if (!findHistory) return res.status(400).send("Transaction Not Found....");

    if (findHistory.receiver.name === "Admin") {
      const remove_history = await mongofunctions.delete_one("Income", {
        t_id: data.t_id,
      });
      console.log(remove_history);
      return res.status(200).send("Record Removed successfully...");
    }
    const id = findHistory.receiver.receiver_id;

    const findGroup = await mongofunctions.find_one("GROUP", {
      [`users.${id}`]: { $exists: true },
    });
    if (!findGroup) return res.status(400).send("User Not Found In Group...");
    console.log(findGroup, "find_group");

    // Check if user is admin
    const admin = findGroup.users[req.user.user_id]?.is_admin;
    console.log(admin);

    // Remove transaction from user balance
    const balance = findGroup.users[id].balance;
    const groupBalance = findGroup.group_balance;

    // Calculate updated balances
    const updateBls =
      Number(balance) <= 0
        ? Number(balance) + Number(findHistory.amount)
        : Number(balance) - Number(findHistory.amount);
    const groupBls =
      Number(groupBalance) <= 0
        ? Number(groupBalance) + Number(findHistory.amount)
        : Number(groupBalance) - Number(findHistory.amount);
    console.log(updateBls, "user");
    console.log(groupBls, "group");

    // if (
    //   (data.user_id && !admin) ||
    //   (data.user_id && req.user.user_type !== "ADMIN")
    // ) {
    //   return res
    //     .status(400)
    //     .send("You cannot remove expenses for other users.");
    // }

    console.log(id, "id------------");
    console.log(groupBls, "groupbls-------");
    console.log(updateBls, "updated-----------");

    // Update only the specified user's balance and group balance
    const updateGroupAmount = await mongofunctions.find_one_and_update(
      "GROUP",
      { [`users.${id}`]: { $exists: true } },
      {
        $set: {
          group_balance: groupBls,
          [`users.${id}.balance`]: updateBls,
        },
      },
      { new: true, upsert: false }
    );

    console.log(updateGroupAmount, "Updated Group Amount");

    // Remove the income transaction
    const remove_history = await mongofunctions.delete_one("Income", {
      t_id: data.t_id,
    });
    console.log(remove_history);

    return res.status(200).send("Record Removed successfully...");
  })
);

// get grops users data
router.post(
  "/get_users",
  ratelimit,

  auth,
  amw(async (req, res) => {
    // Find the group based on group_name
    const group = await mongofunctions.find_one(
      "GROUP",
      { group_name: "hyd" },
      null,
      null
    );

    // Check if the group exists
    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }

    // Populate members
    const populatedGroup = await GROUP.populate(group, { path: "members" });

    res.send(populatedGroup);
  })
);

// get grops users data
router.post(
  "/common",
  ratelimit,

  auth,
  admin,
  amw(async (req, res) => {
    // Find the group based on group_name
    const group = await mongofunctions.find_one(
      "GROUP",
      { group_name: "hyd" },
      null,
      null
    );
    data.comment = `${req.user.user_name} spent $${data.amount} ${data.description}`;

    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }
    // Check if the group exists
    data.t_id = get_random_string("0", 8);
    (data.user_id = req.user.user_id), res.send(populatedGroup);
  })
);
// add and update common fileds
// router.post(
//   "/add_update_common_fields",
//   ratelimit,

//   auth,
//   // admin,
//   amw(async (req, res) => {
//     const data = req.body;
//     console.log(data, "data------->data");

//     // Validate incoming data
//     const { error } = validations.common(data);
//     if (error) {
//       return res.status(400).send(error.details[0].message);
//     }

//     console.log(data, "<---2---data---1--->");

//     // Retrieve existing data from Redis
//     let existingData = (await redis.redisGetSingle("COMMON", true)) || [];
//     console.log(existingData, "existingData");

//     // Check if an id is provided to update existing data
//     if (data.id) {
//       const index = existingData.findIndex((item) => item.id === data.id);

//       if (index !== -1) {
//         // Update existing entry
//         existingData[index] = { ...existingData[index], ...data };
//         console.log("Updated data:", existingData[index]);
//         await redis.redisSetSingle("COMMON", existingData, true);

//         return res.status(200).send("Data Updated Successfully");
//       } else {
//         // If the ID doesn't exist, handle this case
//         return res.status(404).send("ID not found");
//       }
//     } else {
//       // Generate a new id if not provided
//       data.id = get_random_string("0", 8);
//       console.log(existingData, "e----data-----");
//       data.common_name = data.common_name.toLowerCase();
//       data.group_id = data.group_id;
//       data.admins = [];
//       data.admins.push(req.user.user_id);
//       console.log(data, "inputdfsfsdff");
//       const validate = existingData.filter(
//         (x) =>
//           x.common_name === data.common_name && x.group_id === data.group_id
//       );
//       console.log(validate, "filterdata");
//       if (validate.length > 0) {
//         return res.status(400).send("Common Name Already Exists....");
//       }
//       // return validate
//       existingData.push(data);
//     }

//     console.log(existingData, "mergedData");

//     // Store the updated data back to Redis
//     await redis.redisSetSingle("COMMON", existingData, true);
//     console.log("Data Stored Successfully");

//     return res.status(200).send("Data Stored Successfully");
//   })
// );



router.post(
  "/add_update_common_fields",
  ratelimit,
  auth,
  amw(async (req, res) => {
    const data = req.body;
    console.log(data, "data------->data");

    // Validate incoming data
    const { error } = validations.common(data);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

      // Check if an id is provided to update existing data
      if (data.id) {
        const commonExpenses = await mongofunctions.find("Common", { id: data.id });
        if (!commonExpenses) {
          return res.status(404).send("Common Expenses Not Found!");
        }
        // Update existing common expenses
        await mongofunctions.find_one_and_update("Common", { id: data.id }, { $set: data });
      return res.status(200).send("Data Updated Successfully");

      } else {
        // Generate a new id if not provided
        data.id = get_random_string("0", 8);
        data.common_name = data.common_name.toLowerCase();
        data.group_id = data.group_id;
        data.admin_ids = [req.user.user_id];
        // return res.status(200).send(data)

        // Create a new common expense record
        await mongofunctions.create_new_record("Common", data);
        console.log(data);
        
      }

      return res.status(200).send("Data Stored Successfully");
  })
);


// Remove common field
router.post(
  "/remove_common_fields",
  ratelimit,

  auth,
  // admin,
  amw(async (req, res) => {
    const id = req.body.id;
    console.log(id, "id");

    // Validate that the ID is provided
    if (!id) {
      return res.status(400).send("ID is required");
    }

  const findCommon = await mongofunctions.find_one("Common",{id:id})
  if(!findCommon) return res.status(400).send("Common Expenses Not Found...")
    await mongofunctions.delete_one("Common",{id:id})

    return res.status(200).send("Common Expenses Removed Successfully");
  })
);

// get common filds in redis
router.post(
  "/get_common",
  ratelimit,
  auth,
  amw(async (req, res) => {
    console.log("dataas", req.body);
    const { error } = validations.group_name(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const commonExpenses = await mongofunctions.find("Common",{group_id:req.body.group_id})
    // if(!commonExpenses) return res.status(400).send([])
    return res.status(200).send(commonExpenses);
  })
);
// get common filds based on duedate
router.post(
  "/get_common_due_dates",
  ratelimit,
  auth,
  amw(async (req, res) => {
    const currentDate = new Date();
    const twoDaysAgo = new Date(currentDate);
    twoDaysAgo.setDate(currentDate.getDate() - 2); 
    const dueDateFields = await mongofunctions.find("Common", {
        admin_ids: req.user.user_id,
        due_date: { $lte: twoDaysAgo } 
    });
    
      // Check if any fields were found
      if (!dueDateFields.length) {
        return res.status(400).send("No due dates found.");
      }
      // Send the filtered fields as a response
      return res.status(200).send(dueDateFields);
  })
);



// router.post(
//   "/get_common_due_dates",
//   ratelimit,
//   auth,
//   amw(async (req, res) => {
//     console.log("dataas", req.body);
//     const { error } = validations.group_name(req.body);
//     if (error) return res.status(400).send(error.details[0].message);
//     const commonFields = await redis.redisGetSingle("COMMON", true);
//     if (!commonFields) {
//       return res.status(400).send("Common Fields Data Not Found");
//     }

//     // const groupName = req.body.group_id;

//     const today = moment();

//     const filteredFields = commonFields.filter((field) => {
//       // Convert due_date to a moment object
//       const dueDate = moment(field.due_date);
//       // Calculate the difference in days
//       const differenceInDays = dueDate.diff(today, "days");
//       console.log(differenceInDays, "dif");
//       // differenceInDays = +differenceInDays
//       // return field.admins.some((admin) => admin === req.user.user_id) && differenceInDays <= 5;

//       return (
//         field.admins.some((admin) => admin === req.user.user_id) &&
//         differenceInDays <= 1
//       );
//     });

//     console.log(filteredFields,"logdata");

//     if (filteredFields.length === 0) {
//       console.error("No Common Fields Found For The Specified Group Name");
//       return res.status(200).send([]);
//     }
//     console.log(filteredFields.length, "length----->");

//     return res.status(200).send(filteredFields);
//   })
// );

// adding incom route
router.post(
  "/add-incom",
  ratelimit,
  auth,
  // admin,
  amw(async (req, res) => {
    const data = req.body;
    console.log(data, "--------><----------");

    const { error } = validations.income_history(data);
    if (error) return res.status(400).send(error.details[0].message);
    // find user
    const findRecever = await mongofunctions.find_one("USER", {
      user_id: data.receiver_id,
    });
    console.log(findRecever, "findRecever------>");

    if (!findRecever) return res.status(400).send("User Not Found");

    // find user in group
    const findGroup = await mongofunctions.find("GROUP", {
      group_id: data.group_id,
      [`users.${data.receiver_id}`]: { $exists: true },
    });
    console.log(findGroup, "recevers");

    const previousBalance = findGroup[0].users[data.receiver_id].balance;
    const update = Number(previousBalance) + Number(data.amount);
    // return res.send(update)
    data.t_id = get_random_string("0", 8);
    data.user_id = req.user.user_id;
    console.log(data.user_id, "uuuu-------iiiii");
    // data.updated_balence =
    data.receiver = {
      receiver_id: findRecever.user_id,
      name: findRecever.user_name,
      previous_balance: previousBalance,
      updated_balance: update,
    };
    data.sender_id = req.user.user_id;
    (data.category = "income"),
      // data.receiver_id = data.receiver_id;
      (data.comment = `${req.user.user_name} has successfully credited +${data.amount} to ${findRecever.user_name}`);
    // let id = req.user.user_id; // Use the user ID directly
    // console.log(id);
    console.log(data, "data-------->");

    // console.log(incomRecord, "res---------->");

    // Use template literals for dynamic keys
    console.log(data, "data");

    // Ensure amountToAdd is a number
    const numericAmountToAdd = Number(data.amount);
    console.log(numericAmountToAdd, "numericAmountToAdd");

    const updateResult = await mongofunctions.find_one_and_update(
      "GROUP",
      {
        group_id: data.group_id,
        [`users.${data.receiver_id}`]: { $exists: true },
      },
      {
        $inc: {
          group_balance: numericAmountToAdd,

          [`users.${data.receiver_id}.balance`]: numericAmountToAdd,
        },
      },
      { new: true }
    );
    data.group_balance = updateResult.group_balance;
    // false
    // const incomRecord = await mongofunctions.create_new_record("Income", data);
    const incomRecord = await mongofunctions.create_new_record(
      "Transaction",
      data
    );
    console.log(updateResult, "updateGroupAmount------->");
    // Call the function to update group expense statistics
    const x = await functions.updateGroupExpenseStatistics(
      updateResult.group_id,
      data.amount,
      "income"
    );
    // console.log(x,"x-----data-----");

    return res.status(200).send(updateResult);
  })
);

// searh user find username and user id
router.post(
  "/find_user",
  ratelimit,
  auth,
  amw(async (req, res) => {
    console.log(req.body, "----->");

    const search = req.body;
    const { error } = validations.validate_search(search);
    if (error) return res.status(400).send(error.details[0].message);
    console.log(search, "------s------------->");
    // Search for user by user_name or user_id
    const user = await mongofunctions.find("USER", {
      $or: [
        { user_name: { $regex: new RegExp(search.search, "i") } },
        { user_id: { $regex: new RegExp(search.search, "i") } },
        // { user_id: search.search }],
      ],
    });
    if (!user) return res.status(400).send("User Not Found!...");
    return res.status(200).send(user);
  })
);

// user get expenses history
router.post(
  "/user_get_expenses_records",
  ratelimit,
  auth,
  amw(async (req, res) => {
    const payload = req.body;
    console.log(payload, "------->");
    const { error } = validations.category_filter(payload);
    if (error) return res.status(400).send(error.details[0].message);
    const sort = { createdAt: -1 };
    // const select = "t_id user_id amount group_name description comment category date"
    // { $and : [{user_id: req.user.user_id},{group_name:payload.group_name}] },

    let history = await mongofunctions.find(
      "Transaction",
      { group_id: payload.group_id },
      sort,
      payload.skip,
      payload.limit
    );
    console.log(history);

    if (!history) return res.status(400).send("History Not Found!....");
    return res.status(200).send(history);
  })
);
// user get income history

router.post(
  "/user_get_income_records",
  ratelimit,
  auth,
  amw(async (req, res) => {
    const payload = req.body;
    console.log(payload, "------->");

    const { error } = validations.category_filter(payload);
    if (error) return res.status(400).send(error.details[0].message);
    const sort = { createdAt: -1 };
    // const select = "t_id user_id amount group_name description comment category date"
    let history = await mongofunctions.find(
      "Income",
      {
        group_id: payload.group_id,
        // $or: [
        //   { user_id: req.user.user_id },
        //   { "receiver.receiver_id": req.user.user_id },
        // ],
      },
      sort,
      payload.skip,
      payload.limit
    );

    console.log(history);

    if (!history) return res.status(400).send("History Not Found!....");
    return res.status(200).send(history);
  })
);
// catogory expenses model category filters
router.post(
  "/admin_get_expenses_records",
  ratelimit,
  auth,
  admin,
  amw(async (req, res) => {
    const payload = req.body;
    console.log(payload, "------->");
    const { error } = validations.category_filter(payload);
    if (error) return res.status(400).send(error.details[0].message);
    const sort = { createdAt: -1 };
    // const select = "t_id user_id amount group_name description comment category date"
    let history = await mongofunctions.find(
      "Expenses",
      {},
      // select,
      sort,
      payload.skip,
      payload.limit
    );
    console.log(history);

    if (!history) return res.status(400).send("History Not Found!....");
    return res.status(200).send(history);
  })
);

// income model transaction
router.post(
  "/admin_get_income_records",
  auth,
  admin,
  amw(async (req, res) => {
    const payload = req.body;
    console.log(payload, "------->");

    const { error } = validations.category_filter(payload);
    if (error) return res.status(400).send(error.details[0].message);
    const sort = { createdAt: -1 };
    // const select = "t_id user_id amount group_name description comment category date"
    let history = await mongofunctions.find(
      "Income",
      {},
      // select,
      sort,
      payload.skip,
      payload.limit
    );
    console.log(history);

    if (!history) return res.status(400).send("History Not Found!....");
    return res.status(200).send(history);
  })
);

// transection history filter route
router.post(
  "/transactions_search",
  ratelimit,
  auth,
  amw(async (req, res) => {
    const payload = req.body;
    // Validate payload
    const { error } = validations.transactionFilter(payload);
    if (error) return res.status(400).send(error.details[0].message);

    const { start_date, end_date, search, group_id, category ,description} = payload;
    // if (!start_date && !end_date && !search && !category) {
    //   return res
    //     .status(400)
    //     .send(
    //       "Please Provide Either Start Date AND End Date, OR Either Category Field ."
    //     );
    // }
    const sort = { createdAt: -1 };

    let filter = {};
    if (category === "expenses") {
      filter = { category: { $nin: ["income", "internal_transfer"] } };
    } else if (category) {
      filter = { category: category };
    }

    if (start_date && !end_date) {
      return res.status(400).send("Please Provide End Date.");
    }
    // Convert start_date and end_date to Date objects if they are provided
    let startISODate = start_date ? new Date(start_date) : null;
    let endISODate = end_date ? new Date(end_date) : null;
    let transaction_filtered;
    if (startISODate === null && endISODate === null) {
      // If both startISODate and endISODate are null, retrieve transactions based on id only
      if (search === "" && category !== "" && description === "") {
        console.log("0----0-----0");
        transaction_filtered = {
          $and: [filter, { group_id: group_id }],
        };
      } else if (category === "" && search !== "" && description === "" ) {
        transaction_filtered = {
          $and: [
            // { name: search },

            {
              $or: [
                { user_id: { $regex: new RegExp(search, "i") } },
                { name: { $regex: new RegExp(search, "i") } },
                { description: { $regex: new RegExp(description, "i") } },
                { "receiver.name": { $regex: new RegExp(search, "i") } },
              ],
            },
            sort,
            { group_id: group_id },
          ],
        };
      } else if (category !== "" && search !== "" && description === "") {
        console.log("44---444---444");

        transaction_filtered = {
          $and: [
            sort,
            filter, // Your previously defined filter
            {
              $or: [
                // { user_id: search },
                // { name: search.toLowerCase() },
                { user_id: { $regex: new RegExp(search, "i") } },
                { name: { $regex: new RegExp(search, "i") } },
                { description: { $regex: new RegExp(description, "i") } },
                { "receiver.name": { $regex: new RegExp(search, "i") } },

                // { description: search.toLowerCase() },

                // { "receiver.name": search.toLowerCase() },
              ],
            },
            { group_id: group_id },
          ],
        };
      } else if (category === "" && search === "" && description === "") {
        console.log("44---444---444");
        transaction_filtered = { group_id: group_id };
      }

// description conditions
else if (search === "" && category !== "" && description !== "") {
  console.log("0----0-----0");
  transaction_filtered = {
    $and: [filter, { group_id: group_id },sort,

      { description: { $regex: new RegExp(description, "i") } },
      

    ],
  };
} else if (category === "" && search !== "" && description !== "" ) {
  transaction_filtered = {
    $and: [
      sort,
      // { name: search },
      { description: { $regex: new RegExp(description, "i") } },
      {
        $or: [
          { user_id: { $regex: new RegExp(search, "i") } },
          { name: { $regex: new RegExp(search, "i") } },
          { "receiver.name": { $regex: new RegExp(search, "i") } },
        ],
      },
      { group_id: group_id },
    ],
  };
} else if (category === "" && search === "" && description !== "") {
  console.log("44---444---444");

  transaction_filtered = {
    $and: [
      { description: { $regex: new RegExp(description, "i") } },
      
      { group_id: group_id },
      sort
    ],
  };
} 


else if (category !== "" && search !=="" && description !== "") {
  console.log("44---444---444");

  transaction_filtered = {
    $and: [
      filter,
      sort,
      {
        $or: [
          { user_id: { $regex: new RegExp(search, "i") } },
          { name: { $regex: new RegExp(search, "i") } },
          { "receiver.name": { $regex: new RegExp(search, "i") } },
        ],
      },
      { description: { $regex: new RegExp(description, "i") } },
      
      { group_id: group_id },
    ],
  };
} 
    } 
    
    else if (search !== "" && category === "" && description === "") {
      // If id is empty, retrieve transactions based only on the date range
      startISODate.setHours(1, 59, 59, 999);
      endISODate.setHours(23, 59, 59, 999);
      transaction_filtered = {
        $and: [
          sort,
          { group_id: group_id },

          {
            $or: [
              { user_id: { $regex: new RegExp(search, "i") } },
              { name: { $regex: new RegExp(search, "i") } },
              { "receiver.name": { $regex: new RegExp(search, "i") } },
            ],
          },

          { createdAt: { $gte: startISODate, $lte: endISODate } },
        ],
      };
    } 
    else if (search === "" && category !== "" && description ==="") {
      // If id is empty, retrieve transactions based only on the date range
      startISODate.setHours(1, 59, 59, 999);
      endISODate.setHours(23, 59, 59, 999);
      transaction_filtered = {
        $and: [
          sort,
          { group_id: group_id },

          filter,
          { createdAt: { $gte: startISODate, $lte: endISODate } },
        ],
      };
    }
    
    else if (search === "" && category === "" && description !=="") {
    console.log("withdescriptioncode------");
    
      // If id is empty, retrieve transactions based only on the date range
      startISODate.setHours(1, 59, 59, 999);
      endISODate.setHours(23, 59, 59, 999);
      transaction_filtered = {
        $and: [
          sort,
          { group_id: group_id },
         { description: { $regex: new RegExp(description, "i") } },
          { createdAt: { $gte: startISODate, $lte: endISODate } },
        ],
      };
    } 
    else if (search === "" && category == "" && description ==="") {
      // If id is empty, retrieve transactions based only on the date range
      startISODate.setHours(1, 59, 59, 999);
      endISODate.setHours(23, 59, 59, 999);
      transaction_filtered = {
        $and: [
          sort,
          { group_id: group_id },
          { createdAt: { $gte: startISODate, $lte: endISODate } },
        ],
      };
      
    } 
    // else if (search === "" && category !== "" && description !=="") {
    //   console.log("withdescriptioncode------");
      
    //     // If id is empty, retrieve transactions based only on the date range
    //     startISODate.setHours(1, 59, 59, 999);
    //     endISODate.setHours(23, 59, 59, 999);
    //     transaction_filtered = {
    //       $and: [
    //         filter,
    //         { group_id: group_id },
    //        { description: { $regex: new RegExp(description, "i") } },
    //         { createdAt: { $gte: startISODate, $lte: endISODate } },
    //       ],
    //     };
    //   } 
    
    
    else {
      // If either startISODate or endISODate is not null, construct the filter with both date range and id conditions
      startISODate.setHours(1, 59, 59, 999);
      endISODate.setHours(23, 59, 59, 999);
      transaction_filtered = {
        $and: [
          sort,
          { group_id: group_id },
          { createdAt: { $gte: startISODate, $lte: endISODate } },
          { description: { $regex: new RegExp(description, "i") } },
          {
            $or: [
              { user_id: { $regex: new RegExp(search, "i") } },
              { name: { $regex: new RegExp(search, "i") } },
              { "receiver.name": { $regex: new RegExp(search, "i") } },
            ],
          },
          filter,
        ],
      };
    }
    // return res.send(transaction_filtered)
    console.log(transaction_filtered, "fil------------ter");
    // if (transaction_filtered === undefined) {
    //   transaction_filtered = { group_id: group_id };
    // }

    const transaction_filter = await mongofunctions.find(
      "Transaction",
      transaction_filtered
    );
    // if (transaction_filter.length === 0)
    //   return res.status(400).send("There Is No Transactions");
    const transactions =
      transaction_filter.length === 0 ? [] : transaction_filter;
    console.log(transactions.length);

    return res.status(200).send(transactions);
  })
);

// find group based on group id
router.post(
  "/find_group",
  auth,
  ratelimit,
  amw(async (req, res) => {
    console.log("sathish");

    console.log(req.body, "s----------------dsss>");

    const { error } = validations.find_group(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    console.log("sahishwww");

    const find_group = await mongofunctions.find_one("GROUP", {
      group_id: req.body.group_id,
    });
    console.log(find_group);

    if (!find_group) return res.status(400).send("Group Not Found!...");
    return res.status(200).send(find_group);
  })
);
// find group based on group id
router.post(
  "/remove_group",
  ratelimit,
  auth,
  amw(async (req, res) => {
    console.log(req.user.user_id);

    const { error } = validations.validate_random_id(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    // find group
    console.log(req.body);
    const findGroup = await mongofunctions.find_one("GROUP", {
      group_id: req.body.group_id,
      // [`users.${req.user.user_id}`]: { $exists: true }
    });
    console.log(findGroup);

    // console.log(findGroup.users);
    if (!findGroup) return res.status(400).send("Group Not Found");
    console.log(findGroup.users[req.user.user_id], "ramana");

    if (!findGroup.users[req.user.user_id]) {
      return res.status(400).send("User Not Found in Group...");
    }

    const admin = findGroup.users[req.user.user_id].is_admin;
    console.log(admin, "ram-----------------------------ana");

    console.log(admin, "<------admin---->");

    if (!admin) {
      return res
        .status(400)
        .send("You Are Not Authorized To Remove This Group.");
    }
    // return true
    console.log("sathish----->");

    // const findGroupFields = await redis.redisGet("COMMON")
    let findGroupFields = (await redis.redisGetSingle("COMMON", true)) || [];
    const filterData = findGroupFields.filter(
      (x) => x.group_id !== findGroup.group_id
    );
    await redis.redisSetSingle("COMMON", filterData, true);
    // remove categorys
    await mongofunctions.delete_one("CATEGORY", {
      group_id: findGroup.group_id,
    });

    // console.log(filterData);
    // return res.send(filterData)

    // Additional logic for removing the user can go here

    const find_group = await mongofunctions.delete_one("GROUP", {
      group_id: req.body.group_id,
    });
    console.log(find_group, "find_group------->");

    return res.status(200).send("Group Remove successFully");
  })
);

// stats Year wise stats
router.post(
  "/stats",
  auth,
  amw(async (req, res) => {
    const stats = await mongofunctions.aggregate("Income", [
      // First stage: Group by year and month to calculate monthly totals

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalIncome: { $sum: "$amount" },
        },
      },

      // Second stage: Group by year to calculate yearly totals
      {
        $group: {
          _id: "$_id.year",
          yearAmount: { $sum: "$totalIncome" }, // Sum of all monthly totals for the year
          monthlyData: {
            $push: {
              month: "$_id.month",
              totalIncome: "$totalIncome",
            },
          },
        },
      },
      {
        $group: {
          _id: null, // This will group everything together
          overallTotal: { $sum: "$yearAmount" }, // Sum of yearly totals
          yearlyData: {
            $push: {
              year: "$_id",
              yearAmount: "$yearAmount",
              monthlyData: "$monthlyData",
            },
          },
        },
      },
      // Third stage: Project the final output
      {
        $project: {
          year: "$_id",
          yearAmount: 1,
          monthlyData: 1,
          document_total: 1,
          _id: 0,
        },
      },
      // Final sorting by year
      { $sort: { year: 1 } },
    ]);

    console.log("Yearly Stats:", stats);

    console.log(stats, "status");

    return res.status(200).send(stats);
  })
);

router.post(
  "/practing-stats",
  // auth,
  amw(async (req, res) => {
    try {
      // const stats = await mongofunctions.aggregate("Transaction", [
      //   {
      //     // $match: { category: "income" },
      //     $match: { category: { $ne: "income" } }
      //   },
      //   {
      //     $group: {
      //       _id: {
      //         year: { $year: "$createdAt" },
      //         month: { $month: "$createdAt" },
      //       },
      //       incomeTotalAmount: { $sum: "$amount" },
      //     },
      //   },
      // ]);

      const stats = await mongofunctions.aggregate("Transaction", [
        {
          $group: {
            _id: {
              group_name: "$group_name",
              category: "$category",
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            TotalAmount: { $sum: "$amount" },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]);

      console.log("Yearly Stats:", stats);
      return res.status(200).send(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      return res.status(500).send("Internal Server Error");
    }
  })
);

// expenses stats
router.post(
  "/expenses_stats",
  ratelimit,
  auth,
  amw(async (req, res) => {
    try {
      const stats = await mongofunctions.aggregate("Expenses", [
        // First stage: Group by year, month, and category to calculate monthly totals
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              category: "$category",
            },
            totalAmount: { $sum: "$amount" },
          },
        },
        // Second stage: Group by year and category to calculate yearly totals
        {
          $group: {
            _id: {
              year: "$_id.year",
              category: "$_id.category",
            },
            yearAmount: { $sum: "$totalAmount" }, // Sum of all monthly totals for the year
            monthlyData: {
              $push: {
                month: "$_id.month",
                totalAmount: "$totalAmount",
              },
            },
          },
        },
        // Third stage: Calculate overall totals per category
        {
          $group: {
            _id: "$_id.category", // Group by category
            overallTotal: { $sum: "$yearAmount" }, // Sum of yearly totals for the category
            yearlyData: {
              $push: {
                year: "$_id.year",
                yearAmount: "$yearAmount",
                monthlyData: "$monthlyData",
              },
            },
          },
        },
        // Fourth stage: Project the final output
        {
          $project: {
            category: "$_id",
            overallTotal: 1,
            yearlyData: 1,
            _id: 0,
          },
        },
        // Final sorting by category
        { $sort: { category: 1 } },
      ]);

      console.log("Expenses Stats:", stats);

      function summarizeData(data) {
        const summary = {};

        data.forEach((item) => {
          item.yearlyData.forEach((yearlyItem) => {
            const year = yearlyItem.year;
            const category = item.category;

            if (!summary[year]) {
              summary[year] = {};
            }

            yearlyItem.monthlyData.forEach((monthlyItem) => {
              const month = monthlyItem.month;
              const totalAmount = monthlyItem.totalAmount;

              if (!summary[year][month]) {
                summary[year][month] = { overallTotal: 0 };
              }

              summary[year][month][category] = totalAmount;

              // Calculate overall total for the month
              summary[year][month].overallTotal =
                (summary[year][month].overallTotal || 0) + totalAmount;
            });
          });
        });

        return summary;
      }
      // Calculate the grand total of all documents
      const grandTotal = stats.reduce(
        (acc, item) => acc + item.overallTotal,
        0
      );
      console.log(grandTotal, "overalltotal");

      console.log("Expenses Stats:", stats);
      const result = summarizeData(stats);
      console.log("Result:", result);
      return res.status(200).send(stats);
    } catch (error) {
      console.error("Error fetching expenses stats:", error);
      return res.status(500).send({ error: "Internal server error" });
    }
  })
);

// profile update and profile remove routes
router.post(
  "/update_profile",
  ratelimit,
  auth,
  amw(async (req, res) => {
    if (req.body.photo) return res.status(400).send("Profile Photo Requred..");
    const updatedProfile = await mongofunctions.find_one_and_update(
      "USER",
      { user_id: req.user.user_id },
      { $set: { photo: req.body.photo } },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).send("User not found.");
    }
    return res.status(200).send("Profile photo updated successfully.");
  })
);

// const remove Profile pic
router.post(
  "/remove_profile",
  ratelimit,
  auth,
  amw(async (req, res) => {
    const updatedProfile = await mongofunctions.find_one_and_update(
      "USER",
      { user_id: req.user.user_id },
      { $set: { photo: "" } },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).send("User not found.");
    }

    return res.status(200).send("Profile Photo Removed Successfully.");
  })
);

// profile update and profile remove routes
router.post(
  "/update_group_profile",
  auth,
  amw(async (req, res) => {
    const { error } = validations.group_profile(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const updatedProfile = await mongofunctions.find_one_and_update(
      "USER",
      { group_id: req.body.group_id },
      { $set: { photo: req.body.image } },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).send("User not found.");
    }
    return res.status(200).send("Profile photo updated successfully.");
  })
);

// adding expense in split wise
router.post(
  "/split_wise",
  // auth,
  amw(async (req, res) => {
    const data = req.body;
    const { error } = validations.split_wise(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const t_pid = await get_random_string("0", 8);
    console.log(t_pid, "pid");
    const find_user = await mongofunctions.find_one("USER", {
      user_id: data.pay_id,
    });
    const split = [];
    const findGroup = await mongofunctions.find_one("GROUP", {
      group_id: data.group_id,
    });
    console.log(findGroup, "group<---s--->");

    if (!findGroup) return res.status(400).send("Group Not Found....");
    console.log(data.selected_id, "selected_ids");
    console.log(data.pay_id, "selected_ids");
    data.selected_id = [...data.selected_id, data.pay_id];
    const splitAmount = data.amount / data.selected_id.length;

    // data.selected_id.push(data.pay_id);
    console.log(data, "selectedid");
    const formattedAmount = splitAmount.toFixed(2);
    console.log(formattedAmount, "split-----Amount");
    // return true
    for (let i = 0; i < data.selected_id.length; i++) {
      const userId = data.selected_id[i];
      const user = findGroup.users[userId];
      console.log(user, "user");
      console.log(data.pay_id);
      console.log(userId);
      // return true
      const status = data.pay_id === userId ? "paid" : "owed";
      const comment =
        status === "paid"
          ? `${find_user.user_name} owes ${formattedAmount}`
          : `${find_user.user_name} owed -${formattedAmount} to ${
              user.name || "someone"
            }`;

      const object = {
        userId: user.user_id,
        amount: formattedAmount,
        name: user.name,
        status: status,
        comment: comment,
      };

      split.push(object);
    }

    console.log(data, "datavalues------>");
    const p_t = {
      t_pid: t_pid,
      group_id: data.group_id,
      paid_by: data.pay_id,
      amount: data.amount,
      split,
    };
    console.log(p_t, "dataidsometing");
    const saveTransactions = await mongofunctions.create_new_record(
      "Payment",
      p_t
    );
    console.log(saveTransactions, "split--------split----------split");

    return res.status(200).send(saveTransactions);
  })
);

// updating amount split amount status
router.post(
  "/update_split_wise",
  // auth,
  amw(async (req, res) => {
    const data = req.body;
    const { error } = validations.update_split_wise(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const findGroup = await mongofunctions.find_one("GROUP", {
      group_id: data.group_id,
    });
    if (!findGroup) return res.status(400).send("Group Not Found......");
    const saveTransactions = await mongofunctions.find_one_and_update(
      "Payment",
      { t_pid: data.t_pid, "split.userId": "1321350229" },
      { $set: { "split.$.status": "paid" } },
      { new: true }
    );
    return res.status(200).send(saveTransactions);
  })
);

// remove split wise transactions
router.post(
  "/remove_split_wise_transaction",
  // auth,
  amw(async (req, res) => {
    const data = req.body;
    const { error } = validations.remove_split_wise(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const findGroup = await mongofunctions.find_one("Payment", {
      t_pid: data.t_pid,
    });
    if (!findGroup) return res.status(400).send("Recored Not Found......");
    const saveTransactions = await mongofunctions.find_one_and_update(
      "Payment",
      { t_pid: data.t_pid }
    );
    return res.status(200).send("Record Remove Successfuly....");
  })
);

// status amount
router.post(
  "/split-wise-stats",
  // auth,
  amw(async (req, res) => {
    console.log("Request received for split-wise stats");

    const stats = await mongofunctions.aggregate("Payment", [
      { $unwind: "$split" },
      {
        $group: {
          _id: "$split.name",
          totalOwed: {
            $sum: {
              $cond: [
                { $eq: ["$split.status", "owed"] },
                { $toDouble: "$split.amount" },
                0,
              ],
            },
          },
          totalPaid: {
            $sum: {
              $cond: [
                { $eq: ["$split.status", "paid"] },
                { $toDouble: "$split.amount" },
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          totalOwed: 1,
          totalPaid: 1,
        },
      },
    ]);

    return res.status(200).send(stats);
  })
);

module.exports = router;
