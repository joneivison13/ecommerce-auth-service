import { Request, Response } from "express";

export default class HelloWorldController {
  constructor() {
    this.handle = this.handle.bind(this);
  }
  async handle(
    req: Request,
    res: Response,
  ): Promise<Response<unknown, Record<string, unknown>>> {
    return res.json({ message: "Hello, World!" });
  }
}
