import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ArticleEntity } from "../article/article.entity";

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  comment: string;

  @ManyToOne(() => ArticleEntity, article => article.comments, { eager: true })
  article: ArticleEntity;
}