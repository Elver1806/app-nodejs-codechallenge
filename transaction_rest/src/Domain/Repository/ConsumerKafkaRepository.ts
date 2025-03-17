import { ConsumerSubscribeTopics, ConsumerRunConfig } from 'kafkajs';

export interface ConsumerKafkaInterfaceRepository {
  consume(
    topic: ConsumerSubscribeTopics,
    config: ConsumerRunConfig,
  ): Promise<void>;
}
