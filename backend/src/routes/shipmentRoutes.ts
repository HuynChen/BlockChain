import express from "express";
import {
  getShipments,
  createShipment,
  getShipmentById,
  updateShipmentStatus,
  updateShipmentById,
  getShipmentStats,
  getBlockchainLogs,
} from "../controllers/shipmentController";

const router = express.Router();

router.get("/stats", getShipmentStats);

router.get("/blockchain-logs", getBlockchainLogs);

router.get("/", getShipments);
router.post("/", createShipment);

router.patch("/:id/status", updateShipmentStatus);
router.get("/:id", getShipmentById);
router.put("/:id", updateShipmentById);

export default router;
