import { Router, Request, Response } from "express";
import { Database } from "../../db";
import { validateQuery, validateParams } from "../../middleware/validate";
import { z } from "zod";
import { cursorPaginationSchema, numericIdStringSchema } from "@linkora/types/src/schemas";

const listPostsQuerySchema = cursorPaginationSchema.extend({
  author: z.string().optional(),
});

const postIdParamsSchema = z.object({
  id: numericIdStringSchema,
});

export function createPostsRouter(db: Database): Router {
  const router = Router();

  router.get(
    "/",
    validateQuery(listPostsQuerySchema),
    async (req: Request, res: Response): Promise<void> => {
      const { author, limit, cursor } = req.query as unknown as z.infer<typeof listPostsQuerySchema>;

      const { posts, total, hasMore } = await db.listPostsCursor({
        author: author || undefined,
        limit,
        cursor: cursor || undefined,
      });
      res.json({
        posts,
        total,
        limit,
        cursor: cursor ?? null,
        has_more: hasMore,
      });
    }
  );

  router.get(
    "/:id",
    validateParams(postIdParamsSchema),
    async (req: Request, res: Response): Promise<void> => {
      const postId = BigInt(req.params.id);
      const post = await db.getPost(postId);
      if (!post) {
        res.status(404).json({ error: "Post not found", code: "NOT_FOUND" });
        return;
      }
      res.json(post);
    }
  );

  router.get(
    "/:id/reports",
    validateParams(postIdParamsSchema),
    async (req: Request, res: Response): Promise<void> => {
      const postId = BigInt(req.params.id);

      try {
        const reports = await db.getPostReports(postId);
        res.json({
          post_id: postId.toString(),
          reports,
          total: reports.length,
        });
      } catch (error) {
        console.error(`Error fetching reports for post ${postId}:`, error);
        res.status(500).json({ error: "Failed to fetch reports", code: "INTERNAL_ERROR" });
      }
    }
  );

  return router;
}
