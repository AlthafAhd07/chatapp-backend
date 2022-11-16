import conservationSchema from "../models/conservationSchema.js";

import userSchema from "../models/userSchema.js";
const conservationCTRL = {
  getSpecificConservation: async (req, res) => {
    const { opponent } = req.body;
    const { username, avatar } = req.user;

    if (!username) return;
    if (!opponent) {
      return res.status(400).json({ msg: "Opposite person not found" });
    }
    // check in database

    let chat = await conservationSchema.find({
      Chatname: { $regex: username },
    });
    const opponentUserData = await userSchema.find(
      { username: opponent },
      { _id: 0, username: 1, online: 1, avatar: 1 }
    );

    if (!chat.length) {
      const newChat_data = {
        Chatname: username + "_" + opponent,
        participant: [
          {
            name: username,
            avatar,
          },
          {
            name: opponentUserData[0].username,
            avatar: opponentUserData[0].avatar,
          },
        ],
        unReadMsgs: {
          [username]: 0,
          [opponent]: 0,
        },
      };
      chat = await new conservationSchema(newChat_data);
      await chat.save();
      const respond = {
        ...chat._doc,
        opponentUserData: opponentUserData[0],
      };
      return res.status(200).json({ msg: respond });
    } else {
      const respond = {
        ...chat[0]._doc,
        opponentUserData: opponentUserData[0],
      };
      return res.status(200).json({ msg: respond });
    }
  },
  updateMessage: async (req, res) => {
    const { opponent, newMsg } = req.body;
    const { username } = req.user;
    if (!username) return;
    if (!opponent) {
      return res.status(400).json({ msg: "Opposite person not found" });
    }
    if (!newMsg) {
      return res.status(400).json({ msg: "Message not found" });
    }
    // check in database
    const participant = [username, opponent];
    // const newMsg = {
    //   id: uuidv4(),
    //   from: username,
    //   message,
    //   time: new Date().toLocaleString("en-US", {
    //     hour: "numeric",
    //     minute: "numeric",
    //     hour12: true,
    //   }),
    //   date: new Date().toLocaleDateString("fr-CA"),
    //   status: "sent",
    // };
    const updatedChat = await conservationSchema.updateOne(
      {
        participant: { $all: participant },
      },
      {
        $push: { messages: newMsg },
        $inc: { [`unReadMsgs.${opponent}`]: 1 },
      }
    );

    res.status(200).json({ msg: updatedChat });
  },
  getAllUserChats: async (req, res) => {
    const { username } = req.user;

    if (!username) return;
    const chats = await conservationSchema.find(
      {
        Chatname: { $regex: username },
      },
      { _id: 1, participant: 1, messages: { $slice: -1 }, unReadMsgs: 1 }
    );

    res.status(200).json({ msg: chats });
  },
  updateMsgStatus: async (req, res) => {
    const { conversationId, msgId } = req.body;
    const { username } = req.user;
    if (!conversationId || !msgId) {
      return res.status(400).json({ msg: "needed data missing" });
    }

    await conservationSchema.findOneAndUpdate(
      {
        _id: conversationId,
        "messages.id": msgId,
      },
      {
        $set: { "messages.$.status": "read" },
        $inc: { [`unReadMsgs.${username}`]: -1 },
      }
    );
    // await conservationSchema.updateOne(
    //   {
    //     _id: conversationId,
    //   },
    //   {
    //     $inc: { [`unReadMsgs.${username}`]: -1 },
    //   }
    // );
    //db.coll.update({userID:1, "solutions.textID":2}, {$set: {"solutions.$.solution": "the new text"}})
    return res.status(204).json({ msg: "updated Successfully" });
  },
};
export default conservationCTRL;
