import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ProfileType } from "./type/profile.type";
import { ProfileResponseInterface } from "./type/profileResponse.interface";
import { UserEntity } from "../user/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { FollowEntity } from "./follow.entity";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>
  ) {
  }

  async getProfile(user_id: number, username: string): Promise<ProfileType> {
    const user = await this.userRepository.findOneBy({
      username: username
    });

    if (!user) {
      throw new HttpException("User Not Found", 404);
    }

    const follow = await this.followRepository.findOneBy({
      followerId: user_id,
      followingId: user.id
    });


    return { ...user, following: Boolean(follow) };
  }


  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return {
      profile
    };
  }

  async followProfile(
    currentUserId: number,
    profileUsername: string
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOneBy({
      username: profileUsername
    });

    if (!user) {
      throw new HttpException("Profile does not exist", HttpStatus.NOT_FOUND);
    }

    if (currentUserId === user.id) {
      throw new HttpException(
        "Follower and Following cant be equal",
        HttpStatus.BAD_REQUEST
      );
    }

    const follow = await this.followRepository.findOneBy({
      followerId: currentUserId,
      followingId: user.id
    });


    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = currentUserId;
      followToCreate.followingId = user.id;
      await this.followRepository.save(followToCreate);
    }

    return { ...user, following: true };
  }

  async deleteFollowProfile(currentUserId: number, profileUsername: string) {
    const user = await this.userRepository.findOneBy({
      username: profileUsername
    });

    if (!user) {
      throw new HttpException("Profile does not exist", HttpStatus.NOT_FOUND);
    }

    if (currentUserId === user.id) {
      throw new HttpException(
        "Follower and Following cant be equal",
        HttpStatus.BAD_REQUEST
      );
    }

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id
    });

    return { ...user, following: false };
  }
}
