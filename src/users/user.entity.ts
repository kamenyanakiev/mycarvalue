import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @AfterInsert()
  logInsert() {
    console.log('inserted User with id ', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('updated User with id ', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('removed User with id ', this.id);
  }
}
