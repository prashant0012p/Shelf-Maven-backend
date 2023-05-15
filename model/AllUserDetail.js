const mongoose = require("mongoose");

const AllUserSchema = mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      requried: true,
    },
    Phone: {
      type: Number,
      required: true,
    },
    UniqueId:{
      type:String,
      required:true  
    }
  },
  {
    timestamps: true,
  }
);

const AllUser = mongoose.model("alluser", AllUserSchema);

module.exports = AllUser;
