import { Router, Request, Response } from "express";
import { Database } from "../../db";
import { validateParams } from "../../middleware/validate";
import { z } from "zod";

const poolIdParamsSchema = z.object({
  id: z.string().min(1).refine((v) => v.trim().length > 0, "id is required"),
});

export function createPoolsRouter(db: Database): Router {
  const router = Router();

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

  router.get(
    "/:id",
    validateParams(poolIdParamsSchema),
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      const pool = await db.getPool(id);
      if (!pool) {
        res.status(404).json({ error: "Pool not found", code: "NOT_FOUND" });
        return;
      }

      res.json({
        ...pool,
        balance: pool.balance.toString(),
      });
    }
  );

  router.get(
    "/:id/analytics",
    validateParams(poolIdParamsSchema),
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

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
    }
  );

  return router;
}
