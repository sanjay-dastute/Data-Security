import { Controller, Post, UseInterceptors, UploadedFile, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { FileParserService } from '../services/file-parser.service';
import { TemporaryMetadataService } from '../services/temporary-metadata.service';
import { DataFormat } from '../dto/temporary-metadata.dto';

@Controller('file-upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FileUploadController {
  constructor(
    private readonly fileParserService: FileParserService,
    private readonly temporaryMetadataService: TemporaryMetadataService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file,
    @Body() body: { dataFormat: DataFormat },
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Parse file to extract available fields
      const { data, availableFields } = await this.fileParserService.parseFile(
        file.path,
        body.dataFormat,
      );

      // Create temporary metadata
      const metadata = await this.temporaryMetadataService.create({
        file_name: file.originalname,
        file_type: file.mimetype,
        user_id: req.user.userId,
        fields_encrypted: availableFields,
        encrypted_file_path: file.path,
      });

      return {
        metadata,
        availableFields,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to process file: ${error.message}`);
    }
  }
}
