import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(120)
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(40)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  company?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  line1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  line2?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  city!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(32)
  postalCode!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(56)
  country!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
