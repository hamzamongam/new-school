import { os } from "@orpc/server";
import { Context } from "./context";

export const osBase = os.$context<Context>();
