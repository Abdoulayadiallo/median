import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { MotDePasseDto } from './dto/mot-de-passe.dto';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    createUserDto.password = hashedPassword;
    return this.prisma.user.create({ data: createUserDto });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async updatepassword(id: number, motDePasseDto: MotDePasseDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`No user found for id: ${id}`);
    }

    const isNewPasswordValid = motDePasseDto.newpassword.match(
      motDePasseDto.confirmpassword,
    );

    const isPasswordValid = await bcrypt.compare(
      motDePasseDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Ancien mot de passe incorrect');
    }
    if (!isNewPasswordValid) {
      throw new UnauthorizedException(
        'Le mot de passe de confirmation ne correspond pas au nouveau mot de passe',
      );
    }
    if (isPasswordValid && isNewPasswordValid) {
      const hashedNewPassword = await bcrypt.hash(
        motDePasseDto.newpassword,
        roundsOfHashing,
      );
      user.password = hashedNewPassword;
      return this.prisma.user.update({ where: { id }, data: user });
    }
  }
}
