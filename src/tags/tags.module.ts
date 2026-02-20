import { Global, Module } from '@nestjs/common';
import { TagsService } from './tags.service';

@Global()
@Module({
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
