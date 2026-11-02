
const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

const getParticipantsCollection = () => {
  return getDB().collection("eventParticipants");
};

router.post("/:eventId/join", verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userEmail = req.user.email;

    if (!ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const eventsCollection = getDB().collection("events");
    const event = await eventsCollection.findOne({
      _id: new ObjectId(eventId),
      eventDate: { $gte: new Date() },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Upcoming event not found",
      });
    }

    const existingParticipant = await getParticipantsCollection().findOne({
      eventId: new ObjectId(eventId),
      userEmail,
    });

    if (existingParticipant) {
      return res.status(409).json({
        success: false,
        message: "You have already joined this event",
      });
    }

    const participant = {
      eventId: new ObjectId(eventId),
      userEmail,
      joinedAt: new Date(),
    };

    await getParticipantsCollection().insertOne(participant);

    return res.status(201).json({
      success: true,
      message: "Successfully joined the event",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to join event",
    });
  }
});

module.exports = router;
