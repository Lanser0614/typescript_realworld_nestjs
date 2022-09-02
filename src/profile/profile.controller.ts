import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { User } from "../user/decorators/user.decorator";
import { ProfileResponseInterface } from "./type/profileResponse.interface";
import { ProfileService } from "./profile.service";
import { ProfileType } from "./type/profile.type";
import { AuthGuard } from "../user/guards/auth.guard";

@Controller("profiles")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {
  }


  @Get(":username")
  async getProfile(
    @User("id") user_id: number,
    @Param("username") username: string
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfile(user_id, username);
    return this.profileService.buildProfileResponse(profile);
  }


  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.followProfile(
      currentUserId,
      profileUsername,
    );
    return this.profileService.buildProfileResponse(profile);
  }


  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async deleteFollowProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.deleteFollowProfile(
      currentUserId,
      profileUsername,
    );
    return this.profileService.buildProfileResponse(profile);
  }
}
