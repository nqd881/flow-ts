import { IFlowExecutionContext } from "../../abstraction";

export type Condition<
  TContext extends IFlowExecutionContext = IFlowExecutionContext
> = (context: TContext) => boolean | Promise<boolean>;

export type Selector<
  TContext extends IFlowExecutionContext = IFlowExecutionContext,
  TValue = unknown
> = (context: TContext) => TValue | Promise<TValue>;

export type CasePredicate<
  TContext extends IFlowExecutionContext = IFlowExecutionContext,
  TValue = unknown
> = (value: TValue, context: TContext) => boolean | Promise<boolean>;

export type ItemsProvider<
  TContext extends IFlowExecutionContext = IFlowExecutionContext,
  TItem = unknown
> = (
  context: TContext
) =>
  | Iterable<TItem>
  | AsyncIterable<TItem>
  | Promise<Iterable<TItem> | AsyncIterable<TItem>>;

export type ItemContext<TContext extends IFlowExecutionContext, TItem> =
  TContext & { item: TItem; index: number };

export type ItemContextFactory<
  TContext extends IFlowExecutionContext = IFlowExecutionContext,
  TItem = unknown,
  TItemContext extends IFlowExecutionContext = ItemContext<TContext, TItem>
> = (context: TContext, item: TItem, index: number) => TItemContext;
