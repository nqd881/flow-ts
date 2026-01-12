import type { IFlowDef, IFlowExecutionContext } from "../../abstraction";
import { ParallelStepStrategy } from "../step-defs";
import { ParallelStepDef } from "../step-defs/parallel-step-def";
import { FlowSetup } from "../types";
import { IStepDefBuilder } from "./step-def-builder";
import type { FlowBuilderClient, FlowDefBuilder } from "../flow-def-builder";

export type BranchFactory<
  TContext extends IFlowExecutionContext,
  TClient extends FlowBuilderClient
> = (client: TClient) => IFlowDef;

export class ParallelStepDefBuilder<
  TContext extends IFlowExecutionContext,
  TClient extends FlowBuilderClient
> implements IStepDefBuilder<ParallelStepDef> {
  protected branches: IFlowDef[] = [];
  protected strategy: ParallelStepStrategy = ParallelStepStrategy.CollectAll;

  constructor(
    protected parentBuilder: FlowDefBuilder<TContext, TClient>,
    private readonly client: TClient
  ) {}

  branch(flow: IFlowDef): this;
  branch(branchSetup: FlowSetup<TContext>): this;
  branch(branchSetup: BranchFactory<TContext, TClient>): this;
  branch(
    branchSetup:
      | IFlowDef
      | FlowSetup<TContext>
      | BranchFactory<TContext, TClient>
  ): this {
    if (this.isFlowDef(branchSetup)) {
      this.branches.push(branchSetup);
      return this;
    }

    if (typeof branchSetup === "function") {
      try {
        const result = (branchSetup as BranchFactory<TContext, TClient>)(
          this.client
        );
        if (this.isFlowDef(result)) {
          this.branches.push(result);
          return this;
        }
      } catch {
        // fall through to treat as flow setup
      }
    }

    const builder = this.client.newFlow<TContext>();
    (branchSetup as FlowSetup<TContext>)(builder);
    this.branches.push(builder.build());
    return this;
  }

  protected isFlowDef(value: unknown): value is IFlowDef {
    return (
      !!value &&
      typeof value === "object" &&
      "steps" in (value as any) &&
      Array.isArray((value as any).steps)
    );
  }

  all() {
    this.strategy = ParallelStepStrategy.CollectAll;
    return this;
  }

  allOrFail() {
    this.strategy = ParallelStepStrategy.FailFast;
    return this;
  }

  first() {
    this.strategy = ParallelStepStrategy.FirstCompleted;
    return this;
  }

  join() {
    return this.parentBuilder;
  }

  build(): ParallelStepDef {
    if (!this.branches.length)
      throw new Error("Parallel step must have at least one branch.");

    return new ParallelStepDef(this.branches, this.strategy);
  }
}
