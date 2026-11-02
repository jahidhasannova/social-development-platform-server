const express = require("express");
const { ObjectId } = require("mongodb");
const { z } = require("zod");
const { getDB } = require("../config/db");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

const getEventsCollection = () => {
  return getDB().collection("events");
};

const eventSchema = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().min(20).max(2000),
  eventType: z.string().trim().min(1),
  thumbnailUrl: z.string().url(),
  location: z.string().trim().min(3),
  eventDate: z.string().datetime(),
});

router.post("/", verifyToken, async (req, res) => {
  try {
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

    if (!req.user.email) {
      return res.status(401).json({
        success: false,
        message: "User email not found in authentication token",
      });
    }

    const newEvent = {
      ...validation.data,
      creatorEmail: req.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await getEventsCollection().insertOne(newEvent);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        _id: result.insertedId,
        ...newEvent,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const events = await getEventsCollection()
      .find({
        eventDate: { $gte: new Date() },
      })
      .sort({ eventDate: 1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming events",
    });
  }
});

router.get("/recent", async (req, res) => {
  try {
    const events = await getEventsCollection()
      .find({
        eventDate: { $gte: new Date() },
      })
      .sort({ eventDate: 1 })
      .limit(6)
      .toArray();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent events",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await getEventsCollection().findOne({
      _id: new ObjectId(id),
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch event details",
    });
  }
});

module.exports = router;