import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'tasks'})
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string
}