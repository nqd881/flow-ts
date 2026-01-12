import type { IFlowDef, IFlowExecutionContext } from "../../abstraction";
import { SwitchCase, SwitchStepDef } from "../step-defs";
import { FlowSetup, Selector } from "../types";
import { IStepDefBuilder } from "./step-def-builder";
import type { FlowDefBuilder } from "../flow-def-builder";

export class SwitchStepDefBuilder<
  TContext extends IFlowExecutionContext,
  TValue
> implements IStepDefBuilder<SwitchStepDef<TContext, TValue>> {
  protected branches: Array<SwitchCase<TContext, TValue>> = [];
  protected defaultBranch?: IFlowDef;

  constructor(
    protected parentBuilder: FlowDefBuilder<TContext, any>,
    protected selector: Selector<TContext, TValue>,
    private readonly flowBuilderFactory: () => FlowDefBuilder<TContext, any>
  ) {}

  case(matchValue: TValue, branchSetup: FlowSetup<TContext>) {
    return this.caseWhen(
      (selected) => selected === matchValue,
      branchSetup
    );
  }

  caseWhen(
    predicate: SwitchCase<TContext, TValue>["predicate"],
    branchSetup: FlowSetup<TContext>
  ) {
    const branch = this.flowBuilderFactory().apply(branchSetup).build();

    this.branches.push({ predicate, flow: branch });

    return this;
  }

  default(branchSetup: FlowSetup<TContext>) {
    const branch = this.flowBuilderFactory().apply(branchSetup).build();

    this.defaultBranch = branch;

    return this;
  }

  end() {
    return this.parentBuilder;
  }

  build(): SwitchStepDef<TContext, TValue> {
    if (!this.branches.length && !this.defaultBranch) {
      throw new Error("Switch step must have at least one branch.");
    }

    return new SwitchStepDef(this.selector, this.branches, this.defaultBranch);
  }
}
