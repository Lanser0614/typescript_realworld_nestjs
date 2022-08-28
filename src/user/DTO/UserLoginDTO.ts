import { IsEmail, IsNotEmpty } from "class-validator";

export class UserLoginDTO {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}