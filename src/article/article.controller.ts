import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { AuthGuard } from "../user/guards/auth.guard";
import { User } from "../user/decorators/user.decorator";
import { UserEntity } from "../user/user.entity";
import { CreateArticleDTO } from "./DTO/CreateArticleDTO";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import { DeleteResult } from "typeorm";
import { UpdateArticleDTO } from "./DTO/UpdateArticleDTO";

@Controller("articles")
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAll(): Promise<any> {
    const data = await this.articleService.getAll();
    return this.articleService.buildArticleResponseAll(data);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @User() user: UserEntity,
    @Body("article") DTO: CreateArticleDTO
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(user, DTO);
    return this.articleService.buildArticleResponse(article);
  }

  @Get(":slug")
  @UseGuards(AuthGuard)
  async findBySlug(@Param("slug") slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }


  @Delete(":slug")
  @UseGuards(AuthGuard)
  async deleteBySlug(
    @Param("slug") slug: string,
    @User() user: UserEntity
  ):
    Promise<DeleteResult> {
    const article = await this.articleService.getBySlug(slug);
    return await this.articleService.deleteArticle(article, user);
  }


  @Put(":slug")
  @UseGuards(AuthGuard)
  async updateBySlug(
    @Param("slug") slug: string,
    @User() user: UserEntity,
    @Body("article") DTO: UpdateArticleDTO
  ):
    Promise<ArticleResponseInterface> {
    const currentArticle = await this.articleService.getBySlug(slug);
    const article = await this.articleService.updateArticle(currentArticle, DTO);
    return this.articleService.buildArticleResponse(article);
  }

}
