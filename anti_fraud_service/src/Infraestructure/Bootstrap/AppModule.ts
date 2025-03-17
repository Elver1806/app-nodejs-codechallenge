import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AntiFraudService } from '../../Application/Services/AntiFrauddService';
import {
  ConsumerKafkaRepository,
  ProducerKafkaRepository,
  TransactionRepository,
  AdminKafkaRepository,
} from '../Repository';
import {
  ConsumerDomainKafkaService,
  ProducerKafkaDomainService,
  TransactionDomainService,
  AdminKafkaDomainService,
} from '../../Domain/Services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [],
  providers: [
    ConsumerDomainKafkaService,
    ProducerKafkaDomainService,
    TransactionDomainService,
    AdminKafkaDomainService,
    {
      provide: 'AdminKafkaInterfaceRepository',
      useClass: AdminKafkaRepository,
    },
    {
      provide: 'ConsumerKafkaInterfaceRepository',
      useClass: ConsumerKafkaRepository,
    },
    {
      provide: 'ProducerKafkaInterfaceRepository',
      useClass: ProducerKafkaRepository,
    },
    {
      provide: 'TransactionInterfaceRepository',
      useClass: TransactionRepository,
    },
    AntiFraudService,
  ],
})
export class AppModule {}
