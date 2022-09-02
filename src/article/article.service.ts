import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, getConnectionManager, getRepository, Repository } from "typeorm";
import { ArticleEntity } from "./article.entity";
import { CreateArticleDTO } from "./DTO/CreateArticleDTO";
import { UserEntity } from "../user/user.entity";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import slugify from "slugify";
import { UpdateArticleDTO } from "./DTO/UpdateArticleDTO";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";
import { count } from "rxjs";
import { IsString } from "class-validator";

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {
  }

  async getAll(user_id: number, query: any): Promise<any> {
    const queryBuilder = await this.articleRepository
      .createQueryBuilder("articles")
      .leftJoinAndSelect("articles.author", "author");
    queryBuilder.orderBy("articles.createdAt", "DESC");
    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    if (query.tag) {
      queryBuilder.andWhere("articles.tagList LIKE :tag", {
        tag: `%${query.tag}%`
      });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne({
        relations: ["favorites"],
        where: {
          username: query.favorited
        }
      });
      const ids = author.favorites.map((el) => el.id);
      console.log(ids);

      if (ids.length > 0) {
        queryBuilder
          .andWhere("articles.id IN (:...ids)", { ids });
      } else {
        queryBuilder.andWhere("1=0");
      }

    }

    if (query.author) {
      const author = await this.userRepository.findOneBy({
        username: query.author
      });
      queryBuilder.andWhere("articles.authorId = :id", {
        id: author.id
      });
    }

    let favorIds: number[] = [];

    if (user_id) {
      const author = await this.userRepository.findOne({
        relations: ["favorites"],
        where: {
          id: user_id
        }
      });
      favorIds = author.favorites.map((favorite) => favorite.id);
    }
    const articles = await queryBuilder.getMany();
    const articlesWithFavorite = articles.map(article => {
      const favorited = favorIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorite, articlesCount };
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

  async getBySlug(slug: string): Promise<ArticleEntity> {
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

  async updateArticle(article: ArticleEntity, DTO: UpdateArticleDTO): Promise<ArticleEntity> {
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


  async addArticleToFavorites(
    slug: string,
    userId: number
  ): Promise<ArticleEntity> {
    const article = await this.getBySlug(slug);
    const user = await this.userRepository.findOne({
      relations: ["favorites"],
      where: {
        id: userId
      }
    });

    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(slug: string, currentUserId: number): Promise<ArticleEntity> {
    const article = await this.getBySlug(slug);
    const user = await this.userRepository.findOne({
      relations: ["favorites"],
      where: {
        id: currentUserId
      }
    });

    const articleIndex = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);

    }

    return article;
  }
}
