import { Body, Controller, Delete, Get, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserCreateDTO } from "./DTO/UserCreateDTO";
import { UserResponseInterface } from "./types/userResponse.interface";
import { UserLoginDTO } from "./DTO/UserLoginDTO";
import { User } from "./decorators/user.decorator";
import { UserEntity } from "./user.entity";
import { AuthGuard } from "./guards/auth.guard";
import { UpdateUserDTO } from "./DTO/UpdateUserDTO";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Post("users")
  @UsePipes(new ValidationPipe())
  async createUser(@Body("user") DTO: UserCreateDTO): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(DTO);
    return this.userService.buildUserResponse(user);
  }

  @Post("users/login")
  @UsePipes(new ValidationPipe())
  async loginUser(@Body("user") DTO: UserLoginDTO): Promise<UserResponseInterface> {
    const user = await this.userService.loginUser(DTO);
    return this.userService.buildUserResponse(user);
  }


  @Get("user")
  @UseGuards(AuthGuard)
  async currentUser(
    @User() user: UserEntity
  ): Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user);
  }


  @Put("user")
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  async updateUser(
    @Body("user") DTO: UpdateUserDTO,
    @User() user: UserEntity
  ): Promise<UserResponseInterface> {
    const userData = await this.userService.updateUser(DTO, user.id);
    return this.userService.buildUserResponse(userData)
  }


}
