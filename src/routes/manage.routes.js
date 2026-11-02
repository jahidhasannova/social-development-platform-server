
const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

const getEventsCollection = () => {
  return getDB().collection("events");
};

const eventSchema = require("zod").z.object({
  title: require("zod").z.string().trim().min(5).max(100),
  description: require("zod").z.string().trim().min(20).max(2000),
  eventType: require("zod").z.string().trim().min(1),
  thumbnailUrl: require("zod").z.string().url(),
  location: require("zod").z.string().trim().min(3),
  eventDate: require("zod").z.string().datetime(),
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const events = await getEventsCollection()
      .find({
        creatorEmail: req.user.email,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your events",
    });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const validation = eventSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid event information",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const eventDate = new Date(validation.data.eventDate);

    if (eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future",
      });
    }

    const result = await getEventsCollection().updateOne(
      {
        _id: new ObjectId(id),
        creatorEmail: req.user.email,
      },
      {
        $set: {
          ...validation.data,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not the creator",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const result = await getEventsCollection().deleteOne({
      _id: new ObjectId(id),
      creatorEmail: req.user.email,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not the creator",
      });
    }

    await getDB().collection("eventParticipants").deleteMany({
      eventId: new ObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
});

module.exports = router;
