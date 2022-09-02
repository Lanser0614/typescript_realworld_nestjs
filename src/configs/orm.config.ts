import { DataSource } from "typeorm";
import { join } from "path";

const PostgresDataSource = new DataSource({
  type: "postgres",
  host: "127.0.0.1",
  port: 5432,
  database: "test",
  username: "doniyor",
  password: "revm0614",
  entities: [join(__dirname, "**", "*.entity.{ts,js}")],
  migrations: [join(__dirname, "**", "*.migration.{ts,js}")],
  synchronize: true
});

PostgresDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err)
  })