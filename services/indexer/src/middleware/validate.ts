import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

type ValidationTarget = "body" | "query" | "params";

function formatZodError(error: ZodError) {
  return error.errors.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));
}

export function validate(schema: z.ZodType, target: ValidationTarget) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      res.status(400).json({
        error: "Validation Error",
        code: "VALIDATION_ERROR",
        details: formatZodError(result.error),
      });
      return;
    }
    (req as any)[target] = result.data;
    next();
  };
}

export const validateBody = (schema: z.ZodType) => validate(schema, "body");
export const validateQuery = (schema: z.ZodType) => validate(schema, "query");
export const validateParams = (schema: z.ZodType) =>
  validate(schema, "params");
