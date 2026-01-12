import { IFlowDef, IFlowExecutionContext } from "../../abstraction";
import { ParallelStepStrategy } from "./parallel-step-def";
import { ItemContext, ItemContextFactory, ItemsProvider } from "../types";
import { StepDef } from "./step-def";

const defaultItemContextFactory = <
  TContext extends IFlowExecutionContext,
  TItem,
  TItemContext extends IFlowExecutionContext = ItemContext<TContext, TItem>
>(context: TContext, item: TItem, index: number) =>
  ({ ...(context as any), item, index } as TItemContext);

export class ParallelForEachStepDef<
  TContext extends IFlowExecutionContext = IFlowExecutionContext,
  TItem = unknown,
  TItemContext extends IFlowExecutionContext = ItemContext<TContext, TItem>
> extends StepDef {
  constructor(
    public readonly items: ItemsProvider<TContext, TItem>,
    public readonly body: IFlowDef,
    public readonly strategy: ParallelStepStrategy = ParallelStepStrategy.CollectAll,
    public readonly createItemContext: ItemContextFactory<
      TContext,
      TItem,
      TItemContext
    > = defaultItemContextFactory,
    id?: string
  ) {
    super(id);
  }
}
