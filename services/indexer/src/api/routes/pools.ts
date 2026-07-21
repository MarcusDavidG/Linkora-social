import { Router, Request, Response } from "express";
import { Database } from "../../db";

export function createPoolsRouter(db: Database): Router {
  const router = Router();

  /**
   * GET /pools
   * Returns all pools.
   */
  router.get("/", async (_req: Request, res: Response): Promise<void> => {
    try {
      const pools = await db.listPools();
      res.json({
        pools: pools.map((p) => ({ ...p, balance: p.balance.toString() })),
      });
    } catch {
      res.status(500).json({ error: "Failed to fetch pools", code: "INTERNAL_ERROR" });
    }
  });

  /**
   * GET /pools/:id
   * Returns the current state of a pool by its ID.
   */
  router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      res.status(400).json({ error: "id is required", code: "INVALID_ID" });
      return;
    }

    const pool = await db.getPool(id);
    if (!pool) {
      res.status(404).json({ error: "Pool not found", code: "NOT_FOUND" });
      return;
    }

    res.json({
      ...pool,
      balance: pool.balance.toString(),
    });
  });

  /**
   * GET /pools/:id/analytics
   * Returns analytics data for a pool: volume, contributors, activity.
   */
  router.get("/:id/analytics", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      res.status(400).json({ error: "id is required", code: "INVALID_ID" });
      return;
    }

    try {
      const pool = await db.getPool(id);
      if (!pool) {
        res.status(404).json({ error: "Pool not found", code: "NOT_FOUND" });
        return;
      }

      const analytics = await db.getPoolAnalytics(id);
      res.json({
        pool_id: pool.pool_id,
        token: pool.token,
        balance: pool.balance.toString(),
        admins: pool.admins,
        threshold: pool.threshold,
        created_ledger: pool.created_ledger,
        ...analytics,
      });
    } catch {
      res.status(500).json({ error: "Failed to fetch analytics", code: "INTERNAL_ERROR" });
    }
  });

  return router;
}
