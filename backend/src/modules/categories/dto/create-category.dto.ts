import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== '' && value != null)
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  parentId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  slug?: string;
}
