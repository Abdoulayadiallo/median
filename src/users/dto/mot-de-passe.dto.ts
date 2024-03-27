import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class MotDePasseDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  newpassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  confirmpassword: string;
}
