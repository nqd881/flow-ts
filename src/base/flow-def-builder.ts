import { IFlowDef, IFlowExecutionContext, IStepDef } from "../abstraction";
import {
  ForEachStepDef,
  ParallelForEachStepDef,
  ParallelStepStrategy,
  SwitchStepDef,
  TaskStepDef,
  WhileStepDef,
} from "./step-defs";
import {
  Condition,
  FlowSetup,
  ItemContext,
  ItemContextFactory,
  ItemsProvider,
  Selector,
  Task,
} from "./types";
import { FlowDef } from "./flow-def";
import {
  IStepDefBuilder,
  ParallelStepDefBuilder,
  SwitchStepDefBuilder,
} from "./step-builders";

export interface FlowBuilderClient {
  newFlow<TContext extends IFlowExecutionContext = IFlowExecutionContext>(): FlowDefBuilder<TContext, any>;
}

const defaultItemContextFactory = <
  TContext extends IFlowExecutionContext,
  TItem,
  TItemContext extends IFlowExecutionContext = ItemContext<TContext, TItem>
>(context: TContext, item: TItem, index: number) =>
  ({ ...(context as any), item, index } as TItemContext);

export class FlowDefBuilder<
  TContext extends IFlowExecutionContext = IFlowExecutionContext,
  TClient extends FlowBuilderClient = FlowBuilderClient
> {
  protected steps: Array<IStepDef | IStepDefBuilder> = [];

  constructor(protected readonly client: TClient) {}


  apply(setup: FlowSetup<TContext>) {
    setup(this);

    return this;
  }

  addStep(step: IStepDef | IStepDefBuilder) {
    this.steps.push(step);
    return this;
  }

  task<TTask extends Task<TContext>>(task: TTask) {
    const step = new TaskStepDef<TTask, TContext>(task);

    return this.addStep(step);
  }

  parallel() {
    const stepBuilder = new ParallelStepDefBuilder<TContext, TClient>(
      this,
      this.client
    );

    this.addStep(stepBuilder);

    return stepBuilder;
  }


  while(condition: Condition<TContext>, bodySetup: FlowSetup<TContext>) {
    const body = this.client.newFlow<TContext>().apply(bodySetup).build();

    const step = new WhileStepDef<TContext>(condition, body);

    return this.addStep(step);
  }

  if(
    condition: Condition<TContext>,
    thenSetup: FlowSetup<TContext>,
    elseSetup?: FlowSetup<TContext>
  ) {
    const thenBranch = this.client.newFlow<TContext>().apply(thenSetup).build();
    const elseBranch = elseSetup
      ? this.client.newFlow<TContext>().apply(elseSetup).build()
      : undefined;

    const step = new SwitchStepDef<TContext, boolean>(
      condition,
      [{ predicate: (value) => !!value, flow: thenBranch }],
      elseBranch
    );

    return this.addStep(step);
  }

  switchOn<TValue>(selector: Selector<TContext, TValue>) {
    const stepBuilder = new SwitchStepDefBuilder<TContext, TValue>(
      this,
      selector,
      () => this.client.newFlow<TContext>()
    );

    this.addStep(stepBuilder);

    return stepBuilder;
  }

  forEach<
    TItem,
    TItemContext extends IFlowExecutionContext = ItemContext<TContext, TItem>
  >(
    items: ItemsProvider<TContext, TItem>,
    bodySetup: FlowSetup<TItemContext>,
    contextFactory?: ItemContextFactory<TContext, TItem, TItemContext>
  ) {
    const body = this.client.newFlow<TItemContext>().apply(bodySetup).build();

    const createContext =
      contextFactory ??
      (defaultItemContextFactory as ItemContextFactory<
        TContext,
        TItem,
        TItemContext
      >);

    const step = new ForEachStepDef<TContext, TItem, TItemContext>(
      items,
      body,
      createContext
    );

    return this.addStep(step);
  }

  parallelForEach<
    TItem,
    TItemContext extends IFlowExecutionContext = ItemContext<TContext, TItem>
  >(
    items: ItemsProvider<TContext, TItem>,
    bodySetup: FlowSetup<TItemContext>,
    strategy: ParallelStepStrategy = ParallelStepStrategy.CollectAll,
    contextFactory?: ItemContextFactory<TContext, TItem, TItemContext>
  ) {
    const body = this.client.newFlow<TItemContext>().apply(bodySetup).build();

    const createContext =
      contextFactory ??
      (defaultItemContextFactory as ItemContextFactory<
        TContext,
        TItem,
        TItemContext
      >);

    const step = new ParallelForEachStepDef<TContext, TItem, TItemContext>(
      items,
      body,
      strategy,
      createContext
    );

    return this.addStep(step);
  }

  protected buildSteps() {
    return this.steps.map((step) => ("build" in step ? step.build() : step));
  }

  build(): IFlowDef {
    const steps = this.buildSteps();

    return new FlowDef(steps);
  }
}
