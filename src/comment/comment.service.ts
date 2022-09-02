import { Injectable } from "@nestjs/common";

@Injectable()
export class CommentService {

  async getAllComment() {
    return "ok";
  }
}
