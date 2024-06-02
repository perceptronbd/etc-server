const MobileUser = require("../../models/mobileUserModel");
const asyncHandler = require("express-async-handler");

exports.getCSBandTaka = asyncHandler(async (req, res) => {
  try {
    const user = req.user._id;

    const existingUser = await MobileUser.findById(user);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let { CSB, taka } = existingUser;

    console.log(CSB, taka);

    return res.status(200).json({ taka, CSB });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

exports.getUserByMobileNumber = asyncHandler(async (req, res) => {
  const { mobileNumber } = req.body;

  try {
    const user = await MobileUser.findOne({ mobileNumber }).select(
      "name mobileNumber CSB"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract the needed fields
    const { name, mobileNumber: number, CSB } = user;

    // Send only the selected fields in the response
    res.json({ name, mobileNumber: number, CSB });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

exports.sendCSB = asyncHandler(async (req, res) => {
  try {
    const { number, csbAmount } = req.body;
    const user = req.user;

    // Check if CSB amount is valid
    if (csbAmount <= 0) {
      return res.status(400).send("CSB amount must be greater than zero.");
    }

    // Find the recipient user by mobile number
    const recipient = await MobileUser.findOne({ mobileNumber: number });

    if (!recipient) {
      return res.status(404).send("Recipient user not found.");
    }

    // Check if the sender has enough CSB
    if (user.CSB < csbAmount) {
      return res.status(400).send("Insufficient CSB.");
    }

    // Start a session and transaction
    const session = await MobileUser.startSession();
    session.startTransaction();

    try {
      // Update the sender's and recipient's CSB balances within the transaction
      await MobileUser.findByIdAndUpdate(
        user._id,
        { $inc: { CSB: -csbAmount } },
        { session }
      );
      await MobileUser.findByIdAndUpdate(
        recipient._id,
        { $inc: { CSB: csbAmount } },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).send("CSB successfully sent.");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(error);
      res.status(500).send("An error occurred while sending CSB.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while sending CSB.");
  }
});
