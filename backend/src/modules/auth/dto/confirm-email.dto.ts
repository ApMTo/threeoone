import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ConfirmEmailDto {
  @IsString()
  @IsNotEmpty()
  @Length(32, 128)
  token!: string;
}
