import { IFlowExecutionContext } from "../src/abstraction";
import { Client } from "../src/client";
import { Compensation } from "../src/saga/compensation";
import { SagaDefBuilder } from "../src/saga/saga-def-builder";

type Ctx = IFlowExecutionContext & {
  orderId: string;
  note: string;
  paymentApproved: boolean;
};

const client = new Client();

// Reused flow: audit trail
const auditFlow = client
  .newFlow<Ctx>()
  .task((ctx: Ctx) => console.log("audit: log order", ctx.orderId))
  .task((ctx: Ctx) => console.log("audit: note", ctx.note))
  .build();

// Inline flow: pack and ship
const packAndShipFlow = client
  .newFlow<Ctx>()
  .task((ctx: Ctx) => console.log("pack", ctx.orderId))
  .task((ctx: Ctx) => console.log("ship", ctx.orderId))
  .build();

const releaseFunds: Compensation = async (ctx) => {
  const c = ctx as unknown as Ctx;
  console.log("payment: release funds", c.orderId);
};

const refundPayment: Compensation = async (ctx) => {
  const c = ctx as unknown as Ctx;
  console.log("payment: refund", c.orderId);
};

const rollbackFinalize: Compensation = async (ctx) => {
  const c = ctx as unknown as Ctx;
  console.log("parent: rollback finalize", c.orderId);
};

// Reused saga: payment workflow
const paymentSaga = client
  .newSaga<Ctx>()
  .task((ctx: Ctx) => {
    console.log("payment: reserve funds", ctx.orderId);
  })
  .compensateWith(releaseFunds)
  .task((ctx: Ctx) => {
    console.log("payment: capture funds", ctx.orderId);
  })
  .compensateWith(refundPayment)
  .commit()
  .build();

// Parent saga mixes inline and reused branches
const parentSagaBuilder = client
  .newSaga<Ctx>()
  .if(
    (ctx: Ctx) => ctx.paymentApproved,
    (f) => f.task((ctx: Ctx) => console.log("approved, proceed", ctx.orderId)),
    (f) => f.task((ctx: Ctx) => console.log("not approved, halt", ctx.orderId))
  )
  .parallel()
  .branch(packAndShipFlow)
  .branch(paymentSaga)
  .branch(auditFlow)
  .all()
  .join();

const parentSaga = (parentSagaBuilder as unknown as SagaDefBuilder<Ctx, Client>)
  .task((ctx: Ctx) => console.log("parent: finalize", ctx.orderId))
  .compensateWith(rollbackFinalize)
  .commit()
  .build();

async function main() {
  const exec = client.runFlow(parentSaga, {
    orderId: "ORD-123",
    note: "priority",
    paymentApproved: true,
  } satisfies Ctx);
  await exec.start();
  await exec.waitUntilFinished();
  console.log("parent saga finished");
}

main().catch((err) => {
  console.error(err);
});
