import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports:[AuthModule],
  providers: [EventsGateway, EventsService],
  exports:[EventsGateway],
})
export class EventsModule {}
