import { SetMetadata } from '@nestjs/common';

export const RequireMtls = () => SetMetadata('require-mtls', true);
