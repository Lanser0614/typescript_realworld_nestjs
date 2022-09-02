import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp
} from "typeorm";
import { UserEntity } from "../user/user.entity";
import { CommentEntity } from "../comment/comment.entity";

@Entity({ name: "articles" })
export class ArticleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({ default: "" })
  description: string;

  @Column({ default: "" })
  body: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @Column("simple-array")
  tagList: string[];

  @Column({ default: 0 })
  favoritesCount: number;

  @ManyToOne(() => UserEntity, user => user.articles, { eager: true })
  author: UserEntity;

  @OneToMany(() => CommentEntity, comment => comment.article)
  comments: CommentEntity[];

  @BeforeUpdate()
  updateTime() {
    this.updatedAt = new Date();
  }

}