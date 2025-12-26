
export async function createContext(req: Request) {
  return {
    headers: req.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;