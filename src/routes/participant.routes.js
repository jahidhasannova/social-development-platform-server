
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
      eventDate: { $gte: new Date().toISOString() },
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

    await getParticipantsCollection().insertOne({
      eventId: new ObjectId(eventId),
      userEmail,
      joinedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Successfully joined the event",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already joined this event",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to join event",
    });
  }
});

router.get("/joined", verifyToken, async (req, res) => {
  try {
    const participants = await getParticipantsCollection()
      .aggregate([
        {
          $match: {
            userEmail: req.user.email,
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "eventId",
            foreignField: "_id",
            as: "event",
          },
        },
        {
          $unwind: "$event",
        },
        {
          $sort: {
            "event.eventDate": 1,
          },
        },
      ])
      .toArray();

    return res.status(200).json({
      success: true,
      count: participants.length,
      data: participants.map((participant) => ({
        ...participant.event,
        joinedAt: participant.joinedAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch joined events",
    });
  }
});

module.exports = router;
