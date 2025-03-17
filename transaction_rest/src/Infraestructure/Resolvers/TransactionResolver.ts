import { Query, Resolver, Args, Mutation } from '@nestjs/graphql';
import { TransactionService } from '../../Application/Services/TransactionService';
import {
  CreateTransactionRequest,
  GeTransactionRequest,
  UpdateTransactionRequest,
} from '../../Application/Dto';
import { Transaction } from '../../Domain/Entitys';

@Resolver()
export class TransactionResolver {
  constructor(private transactionService: TransactionService) {}

  @Query((returns) => Transaction, { nullable: true })
  getTransaction(
    @Args('input') request: GeTransactionRequest,
  ): Promise<Transaction> {
    const { idTransaction } = request;
    return this.transactionService.getTransaction(idTransaction);
  }
  @Mutation((returns) => Transaction)
  createTransaction(@Args('input') object: CreateTransactionRequest) {
    return this.transactionService.createTransaction(object);
  }
}
