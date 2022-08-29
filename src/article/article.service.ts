import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { ArticleEntity } from "./article.entity";
import { CreateArticleDTO } from "./DTO/CreateArticleDTO";
import { UserEntity } from "../user/user.entity";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import slugify from "slugify";
import { UpdateArticleDTO } from "./DTO/UpdateArticleDTO";

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>
  ) {
  }

  async getAll(): Promise<ArticleEntity[]> {
    return await this.articleRepository.find();
  }

  async createArticle(user: UserEntity, DTO: CreateArticleDTO): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, DTO);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.generateSlug(DTO.title);
    article.author = user;
    return await this.articleRepository.save(article);
  }

  async getBySlug(slug: string): Promise<any> {
    const article = await this.articleRepository.findOneBy({
      slug
    });
    if (!article) {
      throw new HttpException("Not Found", 404);
    }
    return article;
  }

  async deleteArticle(article: ArticleEntity, user: UserEntity): Promise<DeleteResult> {
    if (article.author.id == user.id) {
      return await this.articleRepository.delete({
        id: article.id
      });
    }
    throw new HttpException("Not delete", 403);
  }

  async updateArticle(article: ArticleEntity, DTO: UpdateArticleDTO):Promise<ArticleEntity> {
    Object.assign(article, DTO);
    return await this.articleRepository.save(article);
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  buildArticleResponseAll(article: ArticleEntity[]): { article: ArticleEntity[] } {
    return { article };
  }

  private generateSlug(title: string): string {
    return slugify(title, {
      lower: true
    }) + "-" + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }


}
