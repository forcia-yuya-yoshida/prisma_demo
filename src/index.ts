import { fluentSelectNG } from "./scenario/fluentSelectNG";
import { fluentSelectOK } from "./scenario/fluentSelectOK";
import { fluentSelectXact } from "./scenario/fluentSelectXact";
import { resetData } from "./scenario/resetData";

// データをリセット
console.log("----------resetData----------");
await resetData();

// fluentAPIの挙動確認
console.log("----------fluentSelectOK----------");
await fluentSelectOK();
console.log("----------fluentSelectNG----------");
await fluentSelectNG();
console.log("----------fluentSelectXact----------");
await fluentSelectXact();
