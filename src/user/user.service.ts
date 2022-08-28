import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./user.entity";
import { UserCreateDTO } from "./DTO/UserCreateDTO";
import { sign } from "jsonwebtoken";
import { JWT_SECRET } from "../configs/config";
import { UserResponseInterface } from "./types/userResponse.interface";
import { UserLoginDTO } from "./DTO/UserLoginDTO";
import * as bcrypt from "bcrypt";
import { UpdateUserDTO } from "./DTO/UpdateUserDTO";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {
  }

  async createUser(UserDTO: UserCreateDTO): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOneBy({
      email: UserDTO.email
    });
    if (userByEmail) {
      throw new HttpException("Email error", 422);
    }
    const newUser = new UserEntity();
    Object.assign(newUser, UserDTO);
    return await this.userRepository.save(newUser);
  }


  async loginUser(UserLoginDTO: UserLoginDTO): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      select: ["id", "email", "password", "image", "bio", "username"],
      where: {
        email: UserLoginDTO.email
      }
    });
    if (!userByEmail) {
      throw new HttpException("You need to registration", 422);
    }
    const match = await bcrypt.compare(UserLoginDTO.password, userByEmail.password);
    if (!match) {
      throw new HttpException("Email or password is wrond", 422);
    }
    delete userByEmail.password;
    return userByEmail;
  }

  async updateUser(DTO: UpdateUserDTO, id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id: id
      }
    });
    Object.assign(user, DTO);
    return await this.userRepository.save(user);
  }


  generateJwtToken(user: UserEntity): string {
    return sign({
      id: user.id,
      username: user.username,
      email: user.email

    }, JWT_SECRET);
  }


  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwtToken(user)
      }
    };
  }


  findById(id: number): Promise<UserEntity> {
    const user = this.userRepository.findOne({
      where: {
        id: id
      }
    });
    return user;
  }

}
