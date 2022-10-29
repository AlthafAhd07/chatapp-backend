import Users from "../models/userSchema.js";
const userCtrl = {
  searchUser: async (req, res) => {
    const { username, currentUser } = req.query;
    var re = new RegExp(`^${username}`, "g");
    // const user = await Users.find(
    //   { username: { $in: re } },
    //   { _id: 1, username: 1, avator: 1, online: 1 }
    // );
    const user = await Users.find({
      $and: [{ username: { $in: re } }, { username: { $nin: currentUser } }],
    });
    res.status(200).json({ msg: user });
  },
};

export default userCtrl;
