import { Router, Request, Response } from "express";
import { Pool as PgPool } from "pg";
import { getStateRoot } from "../../stateRoot";
import { validateQuery } from "../../middleware/validate";
import { z } from "zod";

const stateRootQuerySchema = z.object({
  ledger: z.coerce.number({
    required_error: "ledger query parameter is required and must be a number",
    invalid_type_error: "ledger must be a number",
  }),
});

export function createStateRootRouter(pg: PgPool): Router {
  const router = Router();

  router.get(
    "/",
    validateQuery(stateRootQuerySchema),
    async (req: Request, res: Response): Promise<void> => {
      const { ledger } = req.query as unknown as z.infer<typeof stateRootQuerySchema>;

      const result = await getStateRoot(pg, ledger);

      if (!result) {
        res.status(404).json({ error: `No state root found for ledger ${ledger}` });
        return;
      }

      res.json({ ledger: result.ledger, root: result.root });
    }
  );

  return router;
}
