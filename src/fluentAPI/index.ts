import { fluentSelectNG } from "./fluentSelectNG";
import { fluentSelectOK } from "./fluentSelectOK";
import { fluentSelectXact } from "./fluentSelectXact";
import { resetData } from "./resetData";

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
