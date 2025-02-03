const Joi = require("joi");

module.exports = {
  //------------------------user---------------------------
  register: (data) => {
    const schema = Joi.object({
      user_id: Joi.string().min(7).max(13).required(),
      user_name: Joi.string().min(5).max(20).required(),
      // last_login_ip: Joi.string().ip().required(),
    });
    return schema.validate(data);
  },
  verify_id: (data) => {
    const schema = Joi.object({
      user_name: Joi.string().min(3).max(13).required(),
      // last_login_ip: Joi.string().ip().required(),
    });
    return schema.validate(data);
  },
  validate_otp: (data) => {
    const schema = Joi.object({
      user_id: Joi.string().min(3).max(13).required(),
      otp: Joi.string().min(6).max(6).required(),
      // last_login_ip: Joi.string().ip().required(),
    });
    return schema.validate(data);
  },

  // vallidate otp

  validate_search: (data) => {
    const schema = Joi.object({
      search: Joi.string()
        .trim()
        .required()
        .min(3)
        .max(50)
        .messages({
          "string.base": "Search Field Must Be a String.",
          "string.empty": "Search Field Cannot Be Empty.",
          "any.required": "Search Field is Required.",
        })
        .when(Joi.string().regex(/^\d+$/), {
          then: Joi.string()
            .min(3)
            .max(15)
            .regex(/^[1-9]\d+$/)
            .messages({
              "string.pattern.base": "Account Not Found.",
              "string.min": "Account Not Found!.",
              "string.max": "Account Not Found!.",
            }),
          otherwise: Joi.string().alphanum().min(3).max(25).messages({
            "string.pattern.base": "Account Not Found.",
            "string.min": "Account Not Found!.",
            "string.max": "Account Not Found!.",
          }),
        }),
    });

    return schema.validate(data);
  },

  // category fiflters
  category_filter: (data) => {
    const schema = Joi.object({
      limit: Joi.number().integer().greater(0).required(),
      skip: Joi.number().integer().greater(-1).required(),
      group_id: Joi.string().min(3).max(13).required(),
    });

    return schema.validate(data);
  },

  // creating groups

  group: (data) => {
    const schema = Joi.object({
      group_name: Joi.string().min(1).max(35).required(),
      image: Joi.string().min(10).optional(),
      // group_status: Joi.string().valid("ACTIVE", "INACTIVE").required(),
      group_type: Joi.string().valid("PERSONAL", "BUSINESS").required(),
    });
    return schema.validate(data);
  },
  // profile update
  group_profile: (data) => {
    const schema = Joi.object({
      image: Joi.string().min(10).required(),
      group_name: Joi.string().min(1).max(35).required(),
    });
    return schema.validate(data);
  },

  // profile update
  group_name: (data) => {
    const schema = Joi.object({
      group_id: Joi.string().min(1).max(13).required(),
    });
    return schema.validate(data);
  },

  // creating category
  category: (data) => {
    const schema = Joi.object({
      category_name: Joi.string().min(3).max(25).required(),
      userid: Joi.string().min(7).max(13).required(),
    });
    return schema.validate(data);
  },

  // adding user
  add_user: (data) => {
    const schema = Joi.object({
      group_id: Joi.string().min(1).max(13).required(),
      userid: Joi.string().min(7).max(13).required().allow(""),
    });
    return schema.validate(data);
  },

  // promote and demote route
  promote_demote: (data) => {
    const schema = Joi.object({
      group_name: Joi.string().min(1).max(35).required(),
      userid: Joi.string().min(7).max(13).required(),
      is_admin: Joi.string().valid(true, false).required(),
    });
    return schema.validate(data);
  },

  // creating category

  add_category: (data) => {
    const schema = Joi.object({
      category_id: Joi.string().min(7).max(13).optional(),
      category_name: Joi.string().min(3).max(25).required(),
      group_id: Joi.string().min(3).max(13).required(),
    });
    return schema.validate(data);
  },
  // t-history
  t_history: (data) => {
    const schema = Joi.object({
      t_id: Joi.string().min(6).max(10).optional().allow(""),
      amount: Joi.string().min(1).max(20).required(),
      group_name: Joi.string().min(3).max(35).optional(),
      category: Joi.string().min(3).max(25).optional(),
      description: Joi.string().min(3).max(50).optional().allow(""),
    });
    return schema.validate(data);
  },

  // get catogory
  get_catogory: (data) => {
    const schema = Joi.object({
      group_id: Joi.string().min(1).max(13).required(),
    });
    return schema.validate(data);
  },
  // common expenses vallidations
  expenses_history: (data) => {
    const schema = Joi.object({
      // t_id: Joi.string().min(6).max(10).optional().allow(""),
      user_id: Joi.string().min(6).max(10).optional().allow(""),
      amount: Joi.string().min(1).max(20).required(),
      group_id: Joi.string().min(3).max(30).required(),
      category: Joi.string().min(3).max(25).required(),
      description: Joi.string().min(3).max(50).required(),
      updated_date: Joi.date().required().optional().iso(),
    });
    return schema.validate(data);
  },

  // internal transfar
  internal_transsfar: (data) => {
    const schema = Joi.object({
      from: Joi.string().min(6).max(10).optional().allow(""),
      to: Joi.string().min(6).max(10).optional().allow(""),
      amount: Joi.string().min(1).max(20).required(),
      group_id: Joi.string().min(3).max(30).required(),
      description: Joi.string().min(3).max(50).required(),
    });
    return schema.validate(data);
  },
  remove_history: (data) => {
    const schema = Joi.object({
      t_id: Joi.string().min(6).max(10).required(),
      user_id: Joi.string().min(6).max(10).optional().allow(""),
    });
    return schema.validate(data);
  },

  user_remove_history: (data) => {
    const schema = Joi.object({
      t_id: Joi.string().min(6).max(10).required(),
    });
    return schema.validate(data);
  },

  // incom-history
  income_history: (data) => {
    const schema = Joi.object({
      amount: Joi.string().min(1).max(20).required(),
      group_name: Joi.string().min(3).max(35).required(),
      description: Joi.string().min(3).max(50).optional().allow(""),
      receiver_id: Joi.string().min(7).max(13).required(),
      updated_date: Joi.date().required().optional().iso(),
    });
    return schema.validate(data);
  },
  // update-incom-history
  income_history: (data) => {
    const schema = Joi.object({
      // t_id: Joi.string().min(1).max(20).required(),
      amount: Joi.string().min(1).max(20).required(),
      group_id: Joi.string().min(3).max(20).required(),
      description: Joi.string().min(3).max(50).required(),
      receiver_id: Joi.string().min(7).max(13).required(),
    });
    return schema.validate(data);
  },

  // update-incom-history
  update_income_history: (data) => {
    const schema = Joi.object({
      t_id: Joi.string().min(1).max(20).required(),
      amount: Joi.string().min(1).max(20).required(),
      group_name: Joi.string().min(3).max(13).required(),
      description: Joi.string().min(3).max(50).optional().allow(""),
      receiver_id: Joi.string().min(7).max(13).required(),
    });
    return schema.validate(data);
  },
  // t-history
  common: (data) => {
    const schema = Joi.object({
      amount: Joi.string().min(1).max(20).required(),
      group_name: Joi.string().min(3).max(13).required(),
      category: Joi.string().min(3).max(25).required(),
      description: Joi.string().min(3).max(50).optional().allow(""),
    });
    return schema.validate(data);
  },

  // update transaction route
  // t-history
  update_expenses: (data) => {
    const schema = Joi.object({
      t_id: Joi.string().min(7).max(20).required(),
      user_id: Joi.string().min(7).max(20).required().allow(""),
      amount: Joi.string().min(1).max(20).required(),
      group_name: Joi.string().min(3).max(13).required(),
      category: Joi.string().min(3).max(25).required(),
      description: Joi.string().min(3).max(50).optional().allow(""),
    });
    return schema.validate(data);
  },
  // category id

  cetegory_id: (data) => {
    const schema = Joi.object({
      category_id: Joi.string().min(7).max(13).required(),
    });
    return schema.validate(data);
  },
  // adding comon filds

  common: (data) => {
    const schema = Joi.object({
      common_name: Joi.string().min(3).max(25).required(),
      // common_id: Joi.string().min(3).max(13).optional(),
      group_id: Joi.string().min(3).max(13).required(),
      amount: Joi.number().min(10).required(),
      id: Joi.string().min(7).max(13).optional(),
      due_date: Joi.date().required().required().iso(),
    });
    return schema.validate(data);
  },

  validate_random_id: (data) => {
    const schema = Joi.object().pattern(
      Joi.string(),
      Joi.string()
        .required()
        .min(6)
        .max(15)
        .pattern(/^[0-9A-Z]/)
    );
    return schema.validate(data);
  },

  // find group
  find_group: (data) => {
    const schema = Joi.object({
      group_id: Joi.string().min(3).max(13).required(),
    });
    return schema.validate(data);
  },

  // search category or dates
  // transaction history filter
  transactionFilter: (data) => {
    const schema = Joi.object({
      start_date: Joi.date().allow("").messages({
        "date.base": "start_date must be a valid date",
      }),
      end_date: Joi.date().min(Joi.ref("start_date")).allow("").messages({
        "date.min": "end date must be greater than or equal to start date",
      }),
      search: Joi.string()
        .min(3)
        .max(50)
        .required()
        .regex(/^[a-zA-Z0-9 ]+$/)
        .allow("")
        .messages({
          "string.pattern.base":
            "search Should Only Contain Uppercase Letters and Digits",
          "string.min": "search Length Must Be Minimum 3 Characters",
          "string.max": "search  Length Should Not Exceed 50 Characters",
        }),
      group_id: Joi.string().min(3).max(13).required(),
      category: Joi.string().min(3).max(25).required().allow(""),
      description: Joi.string().min(3).required().allow(""),

    });

    return schema.validate(data);
  },
  // find group
  split_wise: (data) => {
    const schema = Joi.object({
      group_id: Joi.string().min(3).max(13).required(),
      pay_id: Joi.string().min(3).max(13).required(),
      amount: Joi.number().greater(0).required(),
      description: Joi.string().min(3).max(200).required(),
      selected_id: Joi.array().required(),
    });
    return schema.validate(data);
  },

  // updating split wise amount
  update_split_wise: (data) => {
    const schema = Joi.object({
      group_id: Joi.string().min(3).max(13).required(),
      t_pid: Joi.string().min(3).max(13).required(),
    });
    return schema.validate(data);
  },
  // updating split wise amount
  remove_split_wise: (data) => {
    const schema = Joi.object({
      t_pid: Joi.string().min(3).max(13).required(),
    });
    return schema.validate(data);
  },
  //----------------------common---------------------------
  getenc: (data) => {
    const schema = Joi.object({
      enc: Joi.string().required(),
    });
    return schema.validate(data);
  },
  activate_2fa: (data) => {
    const schema = Joi.object({
      two_fa_code: Joi.string().min(6).required(),
    });
    return schema.validate(data);
  },
  disable_2fa: (data) => {
    const schema = Joi.object({
      two_fa_code: Joi.string().min(6).max(6).required(),
      otp: Joi.string().min(6).max(6).required(),
    });
    return schema.validate(data);
  },
  comment_ticket: (data) => {
    const schema = Joi.object({
      ticketid: Joi.string().required(),
      description: Joi.string().min(20).max(200).required(),
      status: Joi.string().required(),
    });
    return schema.validate(data);
  },
  //--------------------admin------------------------------
  admin_register: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(6).max(15).required(),
      email: Joi.string()
        .email()
        .forbidden(/[\+]/, {
          message: "Email cannot contain the plus (+) character",
        })
        .lowercase()
        .max(55)
        .required(),
      password: Joi.string().min(6).max(16).required(),
    });
    return schema.validate(data);
  },
  adminLoginOtp: (data) => {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .forbidden(/[\+]/, {
          message: "Email cannot contain the plus (+) character",
        })
        .lowercase()
        .max(55)
        .required(),
      password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
  },
  adminvalidateotp: (data) => {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .forbidden(/[\+]/, {
          message: "Email cannot contain the plus (+) character",
        })
        .lowercase()
        .max(40)
        .required(),
      otp: Joi.string().min(6).max(6).required(),
      code2fa: Joi.string().required(),
      browserid: Joi.string().required(),
      fcm_token: Joi.string().required(),
      ip: Joi.string().required(),
    });
    return schema.validate(data);
  },
  resend: (data) => {
    const schema = Joi.object({
      email: Joi.string().max(55).required(),
      type: Joi.string().valid("login").required(),
    });
    return schema.validate(data);
  },
  add_coin: (data) => {
    const schema = Joi.object({
      coin_name: Joi.string().min(3).required(),
      ticker: Joi.string().min(3).required(),
      coin_status: Joi.string().valid("Enable", "Disable").required(),
      coin_text: Joi.string().required(),

      withdraw_status: Joi.string().valid("Enable", "Disable").required(),
      withdraw_min: Joi.number().greater(0).required(),
      withdraw_max: Joi.number().greater(Joi.ref("withdraw_min")).required(),
      withdraw_fee_type: Joi.string().valid("flat", "percent").required(),
      withdraw_fee: Joi.when("withdraw_fee_type", {
        is: "percent",
        then: Joi.number().max(90).required(),
        otherwise: Joi.number().required(),
      }),
      deposit_status: Joi.string().valid("Enable", "Disable").required(),
      deposit_min: Joi.number().greater(0).required(),
      deposit_max: Joi.number().greater(Joi.ref("deposit_min")).required(),
      deposit_fee_type: Joi.string().valid("flat", "percent").required(),
      deposit_fee: Joi.when("deposit_fee_type", {
        is: "percent",
        then: Joi.number().max(90).required(),
        otherwise: Joi.number().required(),
      }),

      // internal_transfer_status: Joi.string()
      //   .valid('Enable', 'Disable')
      //   .required(),
      // internal_trasnfer_min: Joi.number().greater(0).required(),
      // internal_trasnfer_max: Joi.number()
      //   .greater(Joi.ref('internal_trasnfer_min'))
      //   .required(),
      // internal_trasnfer_fee_type: Joi.string()
      //   .valid('flat', 'percent')
      //   .required(),
      //   internal_trasnfer_fee: Joi.when('internal_trasnfer_fee_type', {
      //     is: 'percent',
      //     then: Joi.number().max(90).required(),
      //     otherwise: Joi.number().required(),
      //   }),
    });

    return schema.validate(data);
  },
  add_internal_transfer: (data) => {
    const schema = Joi.object({
      internal_transfer_status: Joi.string()
        .valid("Enable", "Disable")
        .required(),
      internal_transfer_min: Joi.number().greater(0).required(),
      internal_transfer_max: Joi.number()
        .greater(Joi.ref("internal_transfer_min"))
        .required(),
      internal_transfer_fee_type: Joi.string()
        .valid("flat", "percent")
        .required(),
      internal_transfer_fee: Joi.when("internal_transfer_fee_type", {
        is: "percent",
        then: Joi.number().max(90).required(),
        otherwise: Joi.number().required(),
      }),
    });
    return schema.validate(data);
  },
  add_contract: (data) => {
    const schema = Joi.object({
      name: Joi.string().max(25).required(),
      days: Joi.number().greater(0).required(),
      interest: Joi.number().greater(0).required(),
      interest_type: Joi.string().valid("Fixed", "Variable").required(),
      status: Joi.string().valid("Enable", "Disable").required(),
      min: Joi.number().greater(0).required(),
      max: Joi.number().greater(Joi.ref("min")).required(),
      accepted_coins: Joi.array().min(1).required(),
    });
    return schema.validate(data);
  },
  change_contract_status: (data) => {
    const schema = Joi.object({
      contract_id: Joi.string().required(),
      name: Joi.string().min(3).required(),
      status: Joi.string().valid("Enable", "Disable").required(),
    });
    return schema.validate(data);
  },
  change_referrals: (data) => {
    const schema = Joi.object({
      level1: Joi.number().greater(0).required(),
      level2: Joi.number().less(Joi.ref("level1")).required(),
      level3: Joi.number().less(Joi.ref("level2")).required(),
      status: Joi.string().valid("Enable", "Disable").required(),
    });
    return schema.validate(data);
  },
  change_status_controls: (data) => {
    const schema = Joi.object({
      key: Joi.string()
        .valid("register", "login", "crypto_addresses")
        .required(),
      value: Joi.string().valid("Enable", "Disable").required(),
    });
    return schema.validate(data);
  },
  skip: (data) => {
    const schema = Joi.object({
      skip: Joi.number().greater(-1).required(),
    });
    return schema.validate(data);
  },
  otc_list: (data) => {
    const schema = Joi.object({
      skip: Joi.number().greater(-1).required(),
      // user: Joi.string().required(),
      // type:Joi.string().valid('SELL','BUY','Pending','Cancelled','Success')
      // status:Joi.string().valid('SELL','BUY','Pending','Cancelled','Success')
    });
    return schema.validate(data);
  },
  getuser: (data) => {
    const schema = Joi.object({
      user_id: Joi.string().required(),
    });
    return schema.validate(data);
  },
  add_admin: (data) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      password: Joi.string()
        .min(8)
        .max(15)
        .required()
        .pattern(
          new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
          )
        )
        .messages({
          "string.pattern.base":
            "Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character (!@#$%^&*)",
        }),
      email: Joi.string()
        .email()
        .forbidden(/[\+]/, {
          message: "Email cannot contain the plus (+) character",
        })
        .required(),
      admin_type: Joi.string().required(),
      // ip: Joi.string().required(),
      // browserid: Joi.string().required(),
      // fcm_token: Joi.string().required(),
    });
    return schema.validate(data);
  },
  admin_pwd_change: (data) => {
    const schema = Joi.object({
      adminid: Joi.string().min(15).required(),
      password: Joi.string()
        .min(8)
        .max(15)
        .required()
        .pattern(
          new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
          )
        )
        .messages({
          "string.pattern.base":
            "Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character (!@#$%^&*)",
        }),
    });
    return schema.validate(data);
  },
  remove_admin: (data) => {
    const schema = Joi.object({
      adminid: Joi.string().min(15).required(),
    });
    return schema.validate(data);
  },
  adm_send_otp: (data) => {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .forbidden(/[\+]/, {
          message: "Email cannot contain the plus (+) character",
        })
        .lowercase()
        .max(55)
        .required(),
      otp_type: Joi.string().valid("2FA").required(),
    });
    return schema.validate(data);
  },
  change_user_status: (data) => {
    const schema = Joi.object({
      user_id: Joi.string().min(8).required(),
      key: Joi.string().valid("user_status", "withdraw_status").required(),
      value: Joi.string().valid("Enable", "Disable").required(),
    });
    return schema.validate(data);
  },
  edit_contract: (data) => {
    const schema = Joi.object({
      contract_id: Joi.string().min(10).required(),
      name: Joi.string().max(25).required(),
      days: Joi.number().greater(0).required(),
      interest: Joi.number().greater(0).required(),
      interest_type: Joi.string().valid("Fixed", "Variable").required(),
      status: Joi.string().valid("Enable", "Disable").required(),
      min: Joi.number().greater(0).required(),
      max: Joi.number().greater(Joi.ref("min")).required(),
      accepted_coins: Joi.array().min(1).required(),
    });
    return schema.validate(data);
  },
  user_id: (data) => {
    const schema = Joi.object({
      user_id: Joi.string().min(10).required(),
    });
    return schema.validate(data);
  },
  stats_reports: (data) => {
    const schema = Joi.object({
      from_date: Joi.string().required(),
      to_date: Joi.string().required(),
    });
    return schema.validate(data);
  },
  changeType: (data) => {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .forbidden(/[\+]/, {
          message: "Email cannot contain the plus (+) character",
        })
        .lowercase()
        .max(55)
        .required(),
      admin_type: Joi.number().greater(0).required(),
    });
    return schema.validate(data);
  },
  new_referrals: (data) => {
    const schema = Joi.object({
      level: Joi.string().valid("level1", "level2", "level3").required(),
      object: Joi.object().min(1).required(),
      // min_stake_amount: Joi.number().greater(0).required(),
      // status: Joi.string().valid('Enable', 'Disable').required(),
    });
    return schema.validate(data);
  },
  change_ref_status: (data) => {
    const schema = Joi.object({
      min_stake_amount: Joi.number().greater(0).required(),
      status: Joi.string().valid("Enable", "Disable").required(),
      stake_bonus: Joi.number().greater(0).less(99).required(),
    });
    return schema.validate(data);
  },
  get_history_by_dates_admin: (data) => {
    const schema = Joi.object({
      from_date: Joi.string().required(),
      to_date: Joi.string().required(),
      user_id: Joi.string().min(15).required(),
    });
    return schema.validate(data);
  },
  get_type_history_by_dates: (data) => {
    const schema = Joi.object({
      from_date: Joi.string().required(),
      to_date: Joi.string().required(),
      type: Joi.string().required(),
    });
    return schema.validate(data);
  },

  get_excel_by_dates: (data) => {
    const schema = Joi.object({
      from_date: Joi.string().required(),
      to_date: Joi.string().required(),
      type: Joi.string().required(),
    });
    return schema.validate(data);
  },
  add_chains: (data) => {
    const schema = Joi.object({
      coin_id: Joi.string().required(),
      chain_id: Joi.string().required(),
      chain: Joi.string().required(),
      fee: Joi.string().required(),
      min: Joi.string().required(),
      max: Joi.string().required(),

      // chain_url: Joi.string().required(),
      // chain_status: Joi.string().valid('Enable', 'Disable').required(),
    });
    return schema.validate(data);
  },
  delete_chain: (data) => {
    const schema = Joi.object({
      coin_id: Joi.string().required(),
      chain_id: Joi.string().required(),
    });
    return schema.validate(data);
  },
  accept_reject_withdraw: (data) => {
    const schema = Joi.object({
      t_id: Joi.string().required(),
      status: Joi.string().valid("Success", "Rejected").required(),
      transaction_id: Joi.string().min(10).required(),
    });
    return schema.validate(data);
  },

  buy_sell_tickers: (data) => {
    const schema = Joi.object({
      PHP: Joi.object({
        buy: Joi.string().required(),
        sell: Joi.string().required(),
      }).required(),
      INR: Joi.object({
        buy: Joi.string().required(),
        sell: Joi.string().required(),
      }).required(),
      AED: Joi.object({
        buy: Joi.string().required(),
        sell: Joi.string().required(),
      }).required(),
      TRY: Joi.object({
        buy: Joi.string().required(),
        sell: Joi.string().required(),
      }).required(),
      VND: Joi.object({
        buy: Joi.string().required(),
        sell: Joi.string().required(),
      }).required(),
    });
    return schema.validate(data);
  },
  // add_update_spread_percent: (data) => {
  //   const schema = Joi.object({
  //     PHP: Joi.number().required(),
  //     INR: Joi.number().required(),
  //     AED: Joi.number().required(),
  //     TRY: Joi.number().required(),
  //     VND: Joi.number().required(),
  //   });
  //   return schema.validate(data);
  // },
  add_fiat_coin: (data) => {
    const schema = Joi.object({
      fiat_name: Joi.string().required(),
      min: Joi.number().greater(0).required(),
      max: Joi.number().greater(Joi.ref("min")).required(),
      fee_type: Joi.string().valid("flat", "percent").required(),
      fee: Joi.when("fee_type", {
        is: "percent",
        then: Joi.number().max(90).required(),
        otherwise: Joi.number().required(),
      }),
      spread_percent: Joi.number().greater(0).max(10).required(),
      status: Joi.string().valid("Enable", "Disable").required(),
    });
    return schema.validate(data);
  },
  crypto_balance: (data) => {
    const schema = Joi.object({
      user_id: Joi.string().required(),
      chain: Joi.string().valid("Tron", "Ethereum", "Binance Smart").required(),
      coin: Joi.string().required(),
    });
    return schema.validate(data);
  },
  sweep_chain: (data) => {
    const schema = Joi.object({
      t_id: Joi.string().min(10).required(),
    });
    return schema.validate(data);
  },
  sweep_coin: (data) => {
    const schema = Joi.object({
      t_id: Joi.string().min(10).required(),
      address: Joi.string().min(30).required(),
    });
    return schema.validate(data);
  },
  sweep_coin_new: (data) => {
    const schema = Joi.object({
      address: Joi.string().min(30).required(),
    });
    return schema.validate(data);
  },
  get_transaction_by_id: (data) => {
    const schema = Joi.object({
      t_id: Joi.string().min(3).required(),
    });
    return schema.validate(data);
  },
  user_id_with_skip: (data) => {
    const schema = Joi.object({
      user_id: Joi.string().min(10).required(),
      skip: Joi.number().greater(-1).required(),
      type: Joi.string().valid(
        "PROFIT",
        "NEW_STAKE",
        "WITHDRAW",
        "DEPOSIT",
        "OTC",
        "REFERRAL",
        "ALL"
      ),
    });
    return schema.validate(data);
  },
  crypto_deposit_user: (data) => {
    const schema = Joi.object({
      user_id: Joi.string().required(),
      chain: Joi.string().valid("Tron", "Ethereum", "Binance Smart").required(),
    });
    return schema.validate(data);
  },
  Update_blocks: (data) => {
    const schema = Joi.object({
      block_name: Joi.string()
        .valid(
          "busdblock",
          "ethblock",
          "TRON_TIME",
          "X_DAILY_PROFIT_STATUS",
          "X_ETH_CRON_STATUS",
          "X_TRX_CRON_STATUS",
          "X_TRX_WITHDRAW_CRON_STATUS",
          "X_BSC_CRON_STATUS",
          "X_BSC_WITHDRAW_CRON_STATUS",
          "X_ALL_CRONS"
        )
        .required(),
      block_number: Joi.string().required(),
    });
    return schema.validate(data);
  },
  cancel_otc: (data) => {
    const schema = Joi.object({
      t_id: Joi.string().required(),
    });
    return schema.validate(data);
  },
  get_codes: (data) => {
    const schema = Joi.object({
      count: Joi.number().positive().required(),
    });
    return schema.validate(data);
  },
  make_withdraw_failed: (data) => {
    const schema = Joi.object({
      t_id: Joi.string().required(),
      // comment:Joi.string().required()
    });
    return schema.validate(data);
  },
  run_cron_manually: (data) => {
    const schema = Joi.object({
      cron: Joi.string().valid("BSC_WITHDRAW", "TRON_WITHDRAW").required(),
    });
    return schema.validate(data);
  },

  add_manual_deposit: (data) => {
    const schema = Joi.object({
      hash: Joi.string().required(),
      address: Joi.string().required(),
      chain: Joi.string().valid("Tron", "Ethereum", "Binance Smart").required(),
      coin: Joi.string().valid("USDT", "USDC").required(),
      user_id: Joi.string().required(),
      amount: Joi.string().required(),
      fee: Joi.string().required(),
    });
    return schema.validate(data);
  },

  //------------------------user---------------------------
  check_username: (data) => {
    const schema = Joi.object({
      user_name: Joi.string()
        .regex(/^[a-zA-Z0-9]+$/)
        .min(6)
        .max(15)
        .required(),
    });
    return schema.validate(data);
  },
  registration: (data) => {
    const schema = Joi.object({
      user_name: Joi.string()
        .regex(/^[a-zA-Z0-9]+$/)
        .min(6)
        .max(15)
        .required(),
      user_email: Joi.string()
        .email()
        .forbidden(/[\+]/, {
          message: "Email cannot contain the plus (+) character",
        })
        .lowercase()
        .max(40)
        .required(),
      password: Joi.string()
        .min(8)
        .max(15)
        .required()
        .pattern(
          new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
          )
        )
        .messages({
          "string.pattern.base":
            "Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character (!@#$%^&*)",
        }),
      referral_id: Joi.string().optional().allow(null, ""),
      last_login_ip: Joi.string().ip().required(),
      fcm_token: Joi.string().required(),
      browser_id: Joi.string().required(),
      invitation_code: Joi.string().alphanum().trim().min(10).required(),
    });
    return schema.validate(data);
  },
  verify_otp: (data) => {
    const schema = Joi.object({
      user_email: Joi.string().required(),
      otp: Joi.string().min(6).required(),
    });
    return schema.validate(data);
  },
  send_otp: (data) => {
    const schema = Joi.object({
      user_email: Joi.string()
        .email()
        .forbidden(/[\+]/, {
          message: "Email cannot contain the plus (+) character",
        })
        .lowercase()
        .max(40)
        .required(),
      otp_type: Joi.string()
        .valid(
          "2FA",
          "chpwd",
          "forgotpwd"
          // "withdraw",
          // "internal_transfer",
          // "change_email",
          // "Gift_Liquidity"
        )
        .required(),
    });
    return schema.validate(data);
  },
  send_otp_auth: (data) => {
    const schema = Joi.object({
      otp_type: Joi.string()
        .valid(
          "withdraw",
          "internal_transfer",
          "change_email",
          "Gift_Liquidity"
        )
        .required(),
      mail_type: Joi.string().valid("send", "resend").required(),
    });
    return schema.validate(data);
  },
  resendotp: (data) => {
    const schema = Joi.object({
      user_email: Joi.string().max(30).required(),
    });
    return schema.validate(data);
  },
  login: (data) => {
    const schema = Joi.object({
      user_email: Joi.string().max(30).required(),
      password: Joi.string()
        .min(8)
        .max(20)
        .required()
        .pattern(
          new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
          )
        )
        .messages({
          "string.pattern.base":
            "Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character (!@#$%^&*)",
        }),
      last_login_ip: Joi.string().ip().required(),
      fcm_token: Joi.string().required(),
      browser_id: Joi.string().required(),
    });
    return schema.validate(data);
  },
  Loginverify: (data) => {
    const schema = Joi.object({
      code2fa: Joi.string().min(6).max(6).required(),
      user_email: Joi.string().required(),
      // last_login_ip: Joi.string().ip().required(),
      // fcm_token: Joi.string().required(),
      // browser_id: Joi.string().required(),
    });
    return schema.validate(data);
  },
  forget: (data) => {
    const schema = Joi.object({
      user_email: Joi.string().required(),
    });
    return schema.validate(data);
  },
  reset: (data) => {
    const schema = Joi.object({
      otp: Joi.string().required(),
      two_fa_code: Joi.string().required(),
      user_email: Joi.string().required(),
      password: Joi.string()
        .min(8)
        .max(20)
        .required()
        .pattern(
          new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
          )
        )
        .messages({
          "string.pattern.base":
            "Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character (!@#$%^&*)",
        }),
    });
    return schema.validate(data);
  },
  change_password: (data) => {
    const schema = Joi.object({
      otp: Joi.string().required(),
      two_fa_code: Joi.string().required(),
      old_password: Joi.string()
        .min(8)
        .max(20)
        .required()
        .pattern(
          new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
          )
        )
        .messages({
          "string.pattern.base":
            "Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character (!@#$%^&*)",
        }),
      new_password: Joi.string()
        .min(8)
        .max(20)
        .required()
        .pattern(
          new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
          )
        )
        .messages({
          "string.pattern.base":
            "Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character (!@#$%^&*)",
        }),
    });
    return schema.validate(data);
  },
  raise_ticket: (data) => {
    const schema = Joi.object({
      description: Joi.string().min(20).max(200).required(),
      subject: Joi.string().min(10).max(50).required(),
    });
    return schema.validate(data);
  },
  withdraw: (data) => {
    const schema = Joi.object({
      otp: Joi.string().min(6).required(),
      two_fa_code: Joi.string().required(),
      coin_id: Joi.string().min(10).required(),
      coin_name: Joi.string().min(3).required(),
      address: Joi.string().min(10).required(),
      amount: Joi.number().greater(0).required(),
      chain_id: Joi.string().min(3).required(),
      chain: Joi.string().min(3).required(),
    });
    return schema.validate(data);
  },
  internal_transfer: (data) => {
    const schema = Joi.object({
      otp: Joi.string().min(6).required(),
      two_fa_code: Joi.string().required(),
      to_user_id: Joi.string().min(6).required(),
      coin_id: Joi.string().min(10).required(),
      coin_name: Joi.string().min(3).required(),
      amount: Joi.number().greater(0).required(),
    });
    return schema.validate(data);
  },
  buy_contract: (data) => {
    const schema = Joi.object({
      contract_id: Joi.string().min(10).required(),
      coin_id: Joi.string().min(10).required(),
      coin_name: Joi.string().min(3).required(),
      amount: Joi.number().greater(0).required(),
    });
    return schema.validate(data);
  },
  remittance_liquidity: (data) => {
    const schema = Joi.object({
      to_user: Joi.string().required(),
      two_fa_code: Joi.string().required(),
      otp: Joi.string().min(6).required(),
      contract_id: Joi.string().min(10).required(),
      coin_id: Joi.string().min(10).required(),
      coin_name: Joi.string().min(3).required(),
      amount: Joi.number().greater(0).required(),
    });
    return schema.validate(data);
  },
  deposit: (data) => {
    const schema = Joi.object({
      coin_id: Joi.string().min(10).required(),
      coin_name: Joi.string().min(3).required(),
      amount: Joi.number().greater(0).required(),
      chain_id: Joi.string().min(3).required(),
      chain: Joi.string().min(3).required(),
    });
    return schema.validate(data);
  },
  check_user: (data) => {
    const schema = Joi.object({
      user: Joi.string().min(6).required(),
    });
    return schema.validate(data);
  },
  get_history_by_dates: (data) => {
    const schema = Joi.object({
      from_date: Joi.string().required(),
      to_date: Joi.string().required(),
    });
    return schema.validate(data);
  },
  update_profile: (data) => {
    const schema = Joi.object({
      full_name: Joi.string().min(5).required(),
      phone: Joi.string().min(10).required(),
      address: Joi.string().min(10).required(),
      date_of_birth: Joi.string().required(),
      nationality: Joi.string().min(5).required(),
    });
    return schema.validate(data);
  },
  upload_images_kyc: (data) => {
    const schema = Joi.object({
      selfie: Joi.string().min(50).required(),
      front: Joi.string().min(50).required(),
      back: Joi.string().allow(null).optional(),
    });
    return schema.validate(data);
  },
  generateaddress: (data) => {
    const schema = Joi.object({
      coin: Joi.string().required(),
    });
    return schema.validate(data);
  },
  add_crypto_address: (data) => {
    const schema = Joi.object({
      chain: Joi.string().valid("Tron", "Ethereum", "Binance Smart").required(),
    });
    return schema.validate(data);
  },
  crypto_deposit: (data) => {
    const schema = Joi.object({
      chain: Joi.string().valid("Tron", "Ethereum", "Binance Smart").required(),
      coin_id: Joi.string().required(),
    });
    return schema.validate(data);
  },
  OTC: (data) => {
    const schema = Joi.object({
      type: Joi.string().valid("BUY", "SELL").required(),
      coin_name: Joi.string().required(),
      fiat_name: Joi.string().required(),
      fiat_amount: Joi.string().required(),
      coin_amount: Joi.string().required(),
      bank_details: Joi.when("type", {
        is: "SELL",
        then: Joi.object().min(1).required(),
        otherwise: Joi.optional().allow(null),
      }),
    });
    return schema.validate(data);
  },
  metamask_deposit: (data) => {
    const schema = Joi.object({
      chain: Joi.string().valid("Binance Smart", "Ethereum").required(),
      coin_name: Joi.string().min(3).required(),
      hash: Joi.string().min(15).required(),
      amount: Joi.string().required(),
    });
    return schema.validate(data);
  },
  add_profile_pic: (data) => {
    const schema = Joi.object({
      profile_pic: Joi.string().min(100).required(),
    });
    return schema.validate(data);
  },
  get_instapayid: (data) => {
    const schema = Joi.object({
      t_id: Joi.string().min(10).required(),
    });
    return schema.validate(data);
  },
  change_email: (data) => {
    const schema = Joi.object({
      new_email: Joi.string()
        .lowercase()
        .email()
        .forbidden(/[\+]/, {
          message: "Email cannot contain the plus (+) character",
        })
        .required(),
      otp: Joi.string().min(6).required(),
    });
    return schema.validate(data);
  },
  send_validate_otp: (data) => {
    const schema = Joi.object({
      user_id: Joi.string().min(10).required(),
      otp: Joi.string().min(6).max(6).required(),
      type: Joi.string().min(3).required(),
    });
    return schema.validate(data);
  },
};
