import { Controller, Get } from "@nestjs/common";
import { CommentService } from "./comment.service";

@Controller("comments")
export class CommentController {
  constructor(private readonly commentService: CommentService) {
  }

  @Get()
  getAllComment() {
    return this.commentService.getAllComment();
  }

}
