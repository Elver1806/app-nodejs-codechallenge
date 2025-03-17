import { Injectable, Logger } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConsumerDomainKafkaService,
  ProducerKafkaDomainService,
  TransactionDomainService,
} from '../../Domain/Services/';
import { KafkaConsumerRequest } from '../Dto';
import { TRANSACTION_STATUS } from '../Common';

@Injectable()
export class AntiFraudService implements OnModuleInit {
  private readonly logger: Logger = new Logger(AntiFraudService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly producerKafkaDomainService: ProducerKafkaDomainService,
    private readonly consumerKafkaDomainService: ConsumerDomainKafkaService,
    private readonly transactionDomainService: TransactionDomainService,
  ) {}
  async onModuleInit() {
    await this.consumerKafkaDomainService.consume(
      { topics: [this.configService.get<string>('KAFKA_TOPIC')] },
      {
        eachMessage: async ({ message }) => {
          const { transactionExternalId }: KafkaConsumerRequest = JSON.parse(
            message.value.toString(),
          );
          this.logger.log(
            `The following Transaction will be validated => ${transactionExternalId}`,
          );
          const transaction =
            await this.transactionDomainService.getTransaction(
              transactionExternalId,
            );
          this.logger.log(
            `Response Api Transaction detail => ${JSON.stringify(
              transaction.data,
            )}`,
          );
          const {
            data: { getTransaction },
          } = transaction;
          this.logger.log(
            `Body Api Transaction detail => ${JSON.stringify(getTransaction)}`,
          );
          const { value } = getTransaction;
          //check if the value exceeds 1000
          const statusTransaction =
            value > 1000
              ? TRANSACTION_STATUS.TRANSACTION_DECLINED
              : TRANSACTION_STATUS.APPROVED_TRANSACTION;
          this.logger.log(`Value Transaction => ${value}`);
          this.logger.log(`New status Transaction => ${statusTransaction}`);
          const produceRecord = {
            topic: this.configService.get<string>('KAFKA_TRANSACTION_TOPIC'),
            messages: [
              {
                key: this.configService.get<string>(
                  'KAFKA_TRANSACTION_CLIENT_ID',
                ),
                value: JSON.stringify({
                  transactionExternalId,
                  statusTransaction,
                }),
              },
            ],
          };

          await this.producerKafkaDomainService.sendMessage(produceRecord);
          this.logger.log(
            `Message Transaction successfully sent => ${JSON.stringify(
              produceRecord,
            )}`,
          );
        },
      },
    );
  }
}
