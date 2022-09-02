import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TaskModule } from "./task/task.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { TagModule } from "./tag/tag.module";
import { UserModule } from "./user/user.module";
import { AuthMiddleware } from "./user/MIddlware/auth.middleware";
import { ArticleModule } from './article/article.module';
import { CommentModule } from './comment/comment.module';
import { ProfileModule } from './profile/profile.module';


@Module({
  imports: [TypeOrmModule.forRoot({
    type: "postgres",
    host: "127.0.0.1",
    port: 5432,
    database: "test",
    username: "doniyor",
    password: "revm0614",
    entities: [join(__dirname, "**", "*.entity.{ts,js}")],
    migrations: [join(__dirname, "**", "*.migration.{ts,js}")],
    synchronize: true
  }), TaskModule, TagModule, UserModule, ArticleModule, CommentModule, ProfileModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: "*",
      method: RequestMethod.ALL
    });
  }
}
