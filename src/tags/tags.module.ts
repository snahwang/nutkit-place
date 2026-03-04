import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsService } from './tags.service';
import { TagGroup } from '../entities/tag-group.entity';
import { Tag } from '../entities/tag.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([TagGroup, Tag])],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
