import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumerKafkaDomainService } from 'src/Domain/Services';
import { TransactionService } from './TransactionService';
import { ConfigService } from '@nestjs/config';
import { KafkaConsumerRequest } from '../Dto';

@Injectable()
export class TransactionConsumerService implements OnModuleInit {
  private readonly logger: Logger = new Logger(TransactionConsumerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly transactionService: TransactionService,
    private readonly consumerKafkaDomainService: ConsumerKafkaDomainService,
  ) {}

  async onModuleInit() {
    await this.consumerKafkaDomainService.consume(
      { topics: [this.configService.get<string>('KAFKA_TRANSACTION_TOPIC')] },
      {
        eachMessage: async ({ message }) => {
          const {
            transactionExternalId,
            statusTransaction,
          }: KafkaConsumerRequest = JSON.parse(message.value.toString());
          this.logger.log(
            `Transaction Status received => ${JSON.stringify({
              transactionExternalId,
              statusTransaction,
            })}`,
          );
          const resultUpdate =
            await this.transactionService.updateTrsansactionStatus(
              transactionExternalId,
              statusTransaction,
            );
          this.logger.log(
            `Transaction Status updated => ${JSON.stringify(resultUpdate)}`,
          );
        },
      },
    );
  }
}
